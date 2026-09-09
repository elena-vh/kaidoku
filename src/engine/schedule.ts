import type { Progress, Stage } from '../types.ts';
import { HOUR_MS, INTERVALS } from './intervals.ts';

export type ScheduleOutcome = 'right' | 'wrong';

export function nextStage(stage: Stage, outcome: ScheduleOutcome): Stage {
  if (outcome === 'right') {
    return Math.min(7, stage + 1) as Stage;
  }
  // a lapse from Adept or above costs two ranks, not one
  const drop = stage >= 4 ? 2 : 1;
  return Math.max(0, stage - drop) as Stage;
}

export function dueAt(stage: Stage, now: number): number {
  const hours = INTERVALS[stage];
  return hours === null ? Infinity : now + hours * HOUR_MS;
}

export function schedule(
  p: Progress,
  outcome: ScheduleOutcome,
  now: number,
): Progress {
  const stage = nextStage(p.stage, outcome);
  return {
    stage,
    due: dueAt(stage, now),
    lapses: p.lapses + (outcome === 'wrong' ? 1 : 0),
    seen: p.seen + 1,
    correct: p.correct + (outcome === 'right' ? 1 : 0),
  };
}

// A fresh entry, straight out of a lesson: stage 0, due in 4 hours.
export function freshProgress(now: number): Progress {
  return { stage: 0, due: dueAt(0, now), lapses: 0, seen: 0, correct: 0 };
}
