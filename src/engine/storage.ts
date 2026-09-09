// The key carries a version so the shape of `progress` can change later without
// erasing existing records - every read goes through migrate(). `due` is epoch
// ms or Infinity; JSON writes Infinity as null and migrate() reads it back.

import type {
  CustomMnemonics,
  PersistedState,
  Progress,
  ProgressMap,
  Settings,
  Stage,
  Stats,
} from '../types.ts';

export const STORAGE_KEY = 'kaidoku.v3';
export const STORAGE_VERSION = 3;

interface Envelope {
  version: number;
  state: PersistedState;
}

export const DEFAULT_SETTINGS: Settings = {
  batch: 5,
  cap: 40,
  hints: false,
  strict: false,
};

export const DEFAULT_STATS: Stats = {
  answered: 0,
  correct: 0,
  todayReviews: 0,
  streak: 0,
};

export function defaultState(): PersistedState {
  return {
    progress: {},
    custom: {},
    settings: { ...DEFAULT_SETTINGS },
    level: 1,
    stats: { ...DEFAULT_STATS },
    offset: 0,
  };
}

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

const num = (v: unknown, fallback: number): number =>
  typeof v === 'number' && Number.isFinite(v) ? v : fallback;

const bool = (v: unknown, fallback: boolean): boolean =>
  typeof v === 'boolean' ? v : fallback;

const clampStage = (v: unknown): Stage => {
  const n = typeof v === 'number' ? Math.round(v) : 0;
  return (n < 0 ? 0 : n > 7 ? 7 : n) as Stage;
};

function coerceProgress(raw: unknown): Progress | null {
  if (!isObject(raw)) return null;
  const stage = clampStage(raw.stage);
  // null (JSON's Infinity) or a Sealed stage both mean "never due"
  const dueRaw = raw.due;
  const due =
    dueRaw === null ||
    dueRaw === undefined ||
    dueRaw === 'Infinity' ||
    stage === 7
      ? Infinity
      : num(dueRaw, Infinity);
  return {
    stage,
    due,
    lapses: Math.max(0, Math.round(num(raw.lapses, 0))),
    seen: Math.max(0, Math.round(num(raw.seen, 0))),
    correct: Math.max(0, Math.round(num(raw.correct, 0))),
  };
}

function coerceProgressMap(raw: unknown): ProgressMap {
  const out: ProgressMap = {};
  if (!isObject(raw)) return out;
  for (const [id, value] of Object.entries(raw)) {
    const p = coerceProgress(value);
    if (p) out[id as keyof ProgressMap] = p;
  }
  return out;
}

function coerceCustom(raw: unknown): CustomMnemonics {
  const out: CustomMnemonics = {};
  if (!isObject(raw)) return out;
  for (const [id, value] of Object.entries(raw)) {
    if (typeof value === 'string' && value.trim()) {
      out[id as keyof CustomMnemonics] = value;
    }
  }
  return out;
}

function coerceSettings(raw: unknown): Settings {
  if (!isObject(raw)) return { ...DEFAULT_SETTINGS };
  return {
    batch: num(raw.batch, DEFAULT_SETTINGS.batch),
    cap: num(raw.cap, DEFAULT_SETTINGS.cap),
    hints: bool(raw.hints, DEFAULT_SETTINGS.hints),
    strict: bool(raw.strict, DEFAULT_SETTINGS.strict),
  };
}

function coerceStats(raw: unknown): Stats {
  if (!isObject(raw)) return { ...DEFAULT_STATS };
  return {
    answered: num(raw.answered, 0),
    correct: num(raw.correct, 0),
    todayReviews: num(raw.todayReviews, 0),
    streak: num(raw.streak, 0),
  };
}

// Bring any parsed blob up to the current shape, or return null if it holds
// nothing usable. Accepts the current `{ version, state }` envelope or a bare
// top-level object.
export function migrate(raw: unknown): PersistedState | null {
  if (!isObject(raw)) return null;

  const source: Record<string, unknown> = isObject(raw.state) ? raw.state : raw;
  if (!isObject(source.progress)) return null;

  return {
    progress: coerceProgressMap(source.progress),
    custom: coerceCustom(source.custom),
    settings: coerceSettings(source.settings),
    level: Math.max(1, Math.round(num(source.level, 1))),
    stats: coerceStats(source.stats),
    offset: num(source.offset, 0),
  };
}

const infinityToNull = (_key: string, value: unknown): unknown =>
  value === Infinity ? null : value;

export function serialise(state: PersistedState): string {
  const envelope: Envelope = { version: STORAGE_VERSION, state };
  return JSON.stringify(envelope, infinityToNull);
}

export function exportJson(state: PersistedState): string {
  const envelope: Envelope = { version: STORAGE_VERSION, state };
  return JSON.stringify(envelope, infinityToNull, 2);
}

export function importJson(text: string): PersistedState {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('Import failed: not valid JSON');
  }
  const migrated = migrate(parsed);
  if (!migrated) {
    throw new Error(
      'Import failed: no recognisable Kaidoku record in the file',
    );
  }
  return migrated;
}

function storage(): Storage | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

export function load(): PersistedState | null {
  const ls = storage();
  if (!ls) return null;
  let text: string | null;
  try {
    text = ls.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
  if (!text) return null;
  try {
    return migrate(JSON.parse(text));
  } catch {
    return null;
  }
}

export function loadOrDefault(): PersistedState {
  return load() ?? defaultState();
}

export function save(state: PersistedState): void {
  const ls = storage();
  if (!ls) return;
  try {
    ls.setItem(STORAGE_KEY, serialise(state));
  } catch {
    // storage unavailable or full - run session-only
  }
}

export function clear(): void {
  const ls = storage();
  if (!ls) return;
  try {
    ls.removeItem(STORAGE_KEY);
  } catch {
    // nothing to do
  }
}
