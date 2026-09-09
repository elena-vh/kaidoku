import type {
  CustomMnemonics,
  ItemId,
  PersistedState,
  ProgressMap,
  Settings,
  Stage,
  Stats,
} from '../types.ts';
import { CATALOGUE, itemById } from '../data/catalogue.ts';
import { judge } from '../engine/judge.ts';
import { canAdvance, dueQueue, lessonQueue } from '../engine/queues.ts';
import { freshProgress, schedule } from '../engine/schedule.ts';
import { defaultState } from '../engine/storage.ts';

export type Screen =
  | 'landing'
  | 'today'
  | 'review'
  | 'lesson'
  | 'entry'
  | 'browse'
  | 'levels'
  | 'progress'
  | 'trouble'
  | 'settings';

export interface SessionState {
  queue: ItemId[];
  i: number;
  done: number;
  right: number;
  wrong: number;
  total: number;
  wrongIds: Record<ItemId, true>;
}

export interface LessonState {
  queue: ItemId[];
  i: number;
  done: boolean;
}

export type Verdict =
  | { kind: 'near' }
  | {
      kind: 'right' | 'wrong';
      id: ItemId;
      from: Stage;
      to: Stage;
      sealed: boolean;
    };

export interface AppState {
  screen: Screen;
  prev: Screen;
  level: number;
  viewLevel: number;
  offset: number;
  progress: ProgressMap;
  custom: CustomMnemonics;
  settings: Settings;
  stats: Stats;
  session: SessionState | null;
  lesson: LessonState | null;
  entryId: ItemId | null;
  answer: string;
  verdict: Verdict | null;
  editing: boolean;
  draft: string;
  resetArmed: boolean;
}

export type Action =
  | { type: 'nav'; screen: Screen; entryId?: ItemId }
  | { type: 'nav/back' }
  | { type: 'lessons/start'; ids: ItemId[] }
  | { type: 'lessons/next' }
  | { type: 'lessons/prev' }
  | { type: 'lessons/commit'; now: number }
  | { type: 'lessons/drill' }
  | { type: 'review/start'; ids: ItemId[]; from?: Screen }
  | { type: 'review/type'; value: string }
  | { type: 'review/submit'; now: number }
  | { type: 'review/advance' }
  | { type: 'review/end' }
  | { type: 'mnemonic/edit' }
  | { type: 'mnemonic/draft'; value: string }
  | { type: 'mnemonic/save' }
  | { type: 'mnemonic/restore' }
  | { type: 'level/advance' }
  | { type: 'settings/set'; patch: Partial<Settings> }
  | { type: 'clock/shift'; ms: number }
  | { type: 'clock/reset' }
  | { type: 'reset/arm' }
  | { type: 'data/erase' };

const MAX_LEVEL = 5;

export function initialState(
  persisted: PersistedState = defaultState(),
): AppState {
  return {
    screen: 'today',
    prev: 'today',
    level: persisted.level,
    viewLevel: persisted.level,
    offset: persisted.offset,
    progress: persisted.progress,
    custom: persisted.custom,
    settings: persisted.settings,
    stats: persisted.stats,
    session: null,
    lesson: null,
    entryId: null,
    answer: '',
    verdict: null,
    editing: false,
    draft: '',
    resetArmed: false,
  };
}

// Exactly the fields that get persisted.
export function persistable(state: AppState): PersistedState {
  return {
    progress: state.progress,
    custom: state.custom,
    settings: state.settings,
    level: state.level,
    stats: state.stats,
    offset: state.offset,
  };
}

function buildSession(ids: ItemId[]): SessionState {
  return {
    queue: [...ids],
    i: 0,
    done: 0,
    right: 0,
    wrong: 0,
    total: ids.length,
    wrongIds: {},
  };
}

const currentReviewId = (s: SessionState): ItemId | undefined => s.queue[s.i];

const stageOf = (progress: ProgressMap, id: ItemId): Stage =>
  progress[id]?.stage ?? 0;

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'nav':
      return {
        ...state,
        prev: state.screen === action.screen ? state.prev : state.screen,
        screen: action.screen,
        entryId: action.entryId ?? state.entryId,
        editing: false,
        draft: '',
        resetArmed: false,
      };

    case 'nav/back': {
      const target = state.prev === 'entry' ? 'today' : state.prev;
      return { ...state, screen: target, editing: false, resetArmed: false };
    }

    case 'lessons/start':
      return {
        ...state,
        prev: state.screen,
        screen: 'lesson',
        lesson: { queue: [...action.ids], i: 0, done: false },
      };

    case 'lessons/next': {
      if (!state.lesson || state.lesson.done) return state;
      const { lesson } = state;
      if (lesson.i >= lesson.queue.length - 1) return state;
      return { ...state, lesson: { ...lesson, i: lesson.i + 1 } };
    }

    case 'lessons/prev': {
      if (!state.lesson || state.lesson.done) return state;
      return {
        ...state,
        lesson: { ...state.lesson, i: Math.max(0, state.lesson.i - 1) },
      };
    }

    case 'lessons/commit': {
      if (!state.lesson || state.lesson.done) return state;
      const progress: ProgressMap = { ...state.progress };
      for (const id of state.lesson.queue) {
        progress[id] = freshProgress(action.now);
      }
      return { ...state, progress, lesson: { ...state.lesson, done: true } };
    }

    case 'lessons/drill': {
      if (!state.lesson) return state;
      return {
        ...state,
        screen: 'review',
        prev: 'today',
        session: buildSession(state.lesson.queue),
        lesson: null,
        answer: '',
        verdict: null,
      };
    }

    case 'review/start':
      return {
        ...state,
        screen: 'review',
        prev: action.from ?? state.screen,
        session: buildSession(action.ids),
        answer: '',
        verdict: null,
      };

    case 'review/type':
      return { ...state, answer: action.value };

    case 'review/submit': {
      const { session } = state;
      if (!session || state.verdict) return state;
      const id = currentReviewId(session);
      if (!id) return state;
      const item = itemById(id);
      if (!item) return state;

      const outcome = judge(item, state.answer, state.settings.strict);
      if (outcome === 'empty') return state;
      if (outcome === 'near') {
        return { ...state, verdict: { kind: 'near' } };
      }

      const from = stageOf(state.progress, id);
      const prev = state.progress[id] ?? {
        stage: 0 as Stage,
        due: action.now,
        lapses: 0,
        seen: 0,
        correct: 0,
      };
      const next = schedule(prev, outcome, action.now);

      const progress: ProgressMap = { ...state.progress, [id]: next };
      const stats: Stats = {
        ...state.stats,
        answered: state.stats.answered + 1,
        correct: state.stats.correct + (outcome === 'right' ? 1 : 0),
        todayReviews: state.stats.todayReviews + 1,
      };
      const updatedSession: SessionState = {
        ...session,
        right: session.right + (outcome === 'right' ? 1 : 0),
        wrong: session.wrong + (outcome === 'wrong' ? 1 : 0),
        wrongIds:
          outcome === 'wrong'
            ? { ...session.wrongIds, [id]: true }
            : session.wrongIds,
      };

      return {
        ...state,
        progress,
        stats,
        session: updatedSession,
        verdict: {
          kind: outcome,
          id,
          from,
          to: next.stage,
          sealed: next.stage === 7,
        },
      };
    }

    case 'review/advance': {
      const { session, verdict } = state;
      if (!session || !verdict) return state;

      // a near miss just clears the verdict - the answer stays for editing
      if (verdict.kind === 'near') {
        return { ...state, verdict: null };
      }

      const queue = [...session.queue];
      const current = queue[session.i];
      if (verdict.kind === 'wrong' && current) queue.push(current);

      return {
        ...state,
        session: {
          ...session,
          queue,
          i: session.i + 1,
          done: session.done + 1,
        },
        verdict: null,
        answer: '',
      };
    }

    case 'review/end':
      return {
        ...state,
        screen: 'today',
        prev: 'today',
        session: null,
        verdict: null,
        answer: '',
      };

    case 'mnemonic/edit': {
      if (!state.entryId) return state;
      const item = itemById(state.entryId);
      const current = state.custom[state.entryId] ?? item?.mnemonic ?? '';
      return {
        ...state,
        editing: !state.editing,
        draft: state.editing ? '' : current,
      };
    }

    case 'mnemonic/draft':
      return { ...state, draft: action.value };

    case 'mnemonic/save': {
      if (!state.entryId) return state;
      return {
        ...state,
        custom: { ...state.custom, [state.entryId]: state.draft },
        editing: false,
        draft: '',
      };
    }

    case 'mnemonic/restore': {
      if (!state.entryId) return state;
      const custom = { ...state.custom };
      delete custom[state.entryId];
      return { ...state, custom, editing: false, draft: '' };
    }

    case 'level/advance': {
      if (state.level >= MAX_LEVEL) return state;
      if (!canAdvance(state.level, state.progress, CATALOGUE)) return state;
      const level = state.level + 1;
      return { ...state, level, viewLevel: level };
    }

    case 'settings/set':
      return { ...state, settings: { ...state.settings, ...action.patch } };

    case 'clock/shift':
      return { ...state, offset: state.offset + action.ms };

    case 'clock/reset':
      return { ...state, offset: 0 };

    case 'reset/arm':
      return { ...state, resetArmed: true };

    case 'data/erase': {
      // first press arms, second press wipes everything except settings
      if (!state.resetArmed) return { ...state, resetArmed: true };
      return { ...initialState(defaultState()), settings: state.settings };
    }

    default:
      return state;
  }
}

export { dueQueue, lessonQueue };
