import { describe, expect, it } from 'vitest';
import type { Progress, Stage } from '../types.ts';
import { HOUR_MS } from './intervals.ts';
import { dueAt, freshProgress, nextStage, schedule } from './schedule.ts';

const T0 = 1_700_000_000_000;

const at = (stage: Stage): Progress => ({
  stage,
  due: 0,
  lapses: 0,
  seen: 3,
  correct: 2,
});

describe('nextStage', () => {
  it('advances one rank on a correct answer', () => {
    expect(nextStage(0, 'right')).toBe(1);
    expect(nextStage(3, 'right')).toBe(4);
    expect(nextStage(6, 'right')).toBe(7);
  });

  it('caps at Sealed (7) on correct', () => {
    expect(nextStage(7, 'right')).toBe(7);
  });

  it('drops one rank on a wrong answer below Adept', () => {
    expect(nextStage(1, 'wrong')).toBe(0);
    expect(nextStage(3, 'wrong')).toBe(2);
  });

  it('drops TWO ranks on a wrong answer at Adept or above', () => {
    expect(nextStage(4, 'wrong')).toBe(2);
    expect(nextStage(5, 'wrong')).toBe(3);
    expect(nextStage(7, 'wrong')).toBe(5);
  });

  it('floors at Novice I (0) on wrong', () => {
    expect(nextStage(0, 'wrong')).toBe(0);
    expect(nextStage(1, 'wrong')).toBe(0);
  });
});

describe('dueAt', () => {
  it('uses the INTERVALS table', () => {
    expect(dueAt(0, T0)).toBe(T0 + 4 * HOUR_MS);
    expect(dueAt(2, T0)).toBe(T0 + 24 * HOUR_MS);
    expect(dueAt(4, T0)).toBe(T0 + 168 * HOUR_MS);
    expect(dueAt(6, T0)).toBe(T0 + 720 * HOUR_MS);
  });

  it('is Infinity for Sealed', () => {
    expect(dueAt(7, T0)).toBe(Infinity);
  });
});

describe('schedule', () => {
  it('a stage-3 correct answer is due at now + 168h and lands at Adept', () => {
    const out = schedule(at(3), 'right', T0);
    expect(out.stage).toBe(4);
    expect(out.due).toBe(T0 + 168 * HOUR_MS);
  });

  it('records a correct answer in seen and correct, not lapses', () => {
    const out = schedule(at(2), 'right', T0);
    expect(out).toMatchObject({ stage: 3, seen: 4, correct: 3, lapses: 0 });
  });

  it('records a wrong answer in seen and lapses, not correct', () => {
    const out = schedule(at(4), 'wrong', T0);
    expect(out).toMatchObject({ stage: 2, seen: 4, correct: 2, lapses: 1 });
    expect(out.due).toBe(T0 + 24 * HOUR_MS);
  });

  it('stage 0 wrong stays at 0, due +4h', () => {
    const out = schedule(at(0), 'wrong', T0);
    expect(out.stage).toBe(0);
    expect(out.due).toBe(T0 + 4 * HOUR_MS);
  });

  it('stage 7 right stays sealed with an Infinity due date', () => {
    const out = schedule(at(7), 'right', T0);
    expect(out.stage).toBe(7);
    expect(out.due).toBe(Infinity);
  });

  it('does not mutate its argument', () => {
    const p = at(3);
    const frozen = { ...p };
    schedule(p, 'right', T0);
    expect(p).toEqual(frozen);
  });
});

describe('freshProgress', () => {
  it('is stage 0, due +4h, nothing seen', () => {
    expect(freshProgress(T0)).toEqual({
      stage: 0,
      due: T0 + 4 * HOUR_MS,
      lapses: 0,
      seen: 0,
      correct: 0,
    });
  });
});
