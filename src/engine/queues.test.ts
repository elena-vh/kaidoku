import { describe, expect, it } from 'vitest';
import type { Item, Progress, ProgressMap, Stage } from '../types.ts';
import { itemId } from '../types.ts';
import { canAdvance, dueQueue, isUnlocked, lessonQueue } from './queues.ts';
import { HOUR_MS } from './intervals.ts';

const T0 = 1_700_000_000_000;

const p = (stage: Stage, due = T0): Progress => ({
  stage,
  due,
  lapses: 0,
  seen: 1,
  correct: 1,
});

function kanji(char: string, level: number, uses: string[] = []): Item {
  return {
    id: itemId('kanji', char),
    type: 'kanji',
    char,
    level,
    meaning: char,
    alt: [],
    on: '',
    kun: '',
    reading: '',
    strokes: 1,
    parts: [],
    uses,
    mnemonic: '',
  };
}

function vocab(char: string, level: number, uses: string[]): Item {
  return {
    ...kanji(char, level),
    id: itemId('vocab', char),
    type: 'vocab',
    uses,
  };
}

function radical(char: string, level: number): Item {
  return {
    ...kanji(char, level),
    id: itemId('radical', char),
    type: 'radical',
  };
}

describe('isUnlocked', () => {
  const word = vocab('山川', 2, ['山', '川']);

  it('locks anything above the current level', () => {
    expect(isUnlocked(kanji('時', 4), {}, 2)).toBe(false);
  });

  it('unlocks radicals and kanji at or below the current level', () => {
    expect(isUnlocked(radical('一', 1), {}, 2)).toBe(true);
    expect(isUnlocked(kanji('火', 1), {}, 2)).toBe(true);
  });

  it('holds a word until every kanji it uses reaches Novice IV (stage 3)', () => {
    expect(isUnlocked(word, {}, 2)).toBe(false);
    expect(
      isUnlocked(
        word,
        { [itemId('kanji', '山')]: p(3), [itemId('kanji', '川')]: p(2) },
        2,
      ),
    ).toBe(false);
    expect(
      isUnlocked(
        word,
        { [itemId('kanji', '山')]: p(3), [itemId('kanji', '川')]: p(3) },
        2,
      ),
    ).toBe(true);
  });

  it('stage 4+ also satisfies the word unlock', () => {
    expect(
      isUnlocked(
        word,
        { [itemId('kanji', '山')]: p(4), [itemId('kanji', '川')]: p(7) },
        2,
      ),
    ).toBe(true);
  });
});

describe('dueQueue', () => {
  const catalogue = [
    kanji('a', 1),
    kanji('b', 1),
    kanji('c', 1),
    kanji('d', 1),
  ];
  const progress: ProgressMap = {
    [itemId('kanji', 'a')]: p(2, T0 - 5 * HOUR_MS),
    [itemId('kanji', 'b')]: p(1, T0 - 20 * HOUR_MS),
    [itemId('kanji', 'c')]: p(3, T0 + HOUR_MS), // not due yet
    [itemId('kanji', 'd')]: p(7, T0 - HOUR_MS), // sealed, never queued
  };

  it('returns only due, un-sealed items, soonest-due first', () => {
    const q = dueQueue(catalogue, progress, T0);
    expect(q.map((i) => i.char)).toEqual(['b', 'a']);
  });

  it('is empty when nothing is due', () => {
    expect(dueQueue(catalogue, {}, T0)).toEqual([]);
  });
});

describe('lessonQueue', () => {
  it('offers unlocked, unstarted items ordered radical -> kanji -> vocab, by level', () => {
    const catalogue = [
      vocab('w2', 2, []),
      kanji('k2', 2),
      radical('r2', 2),
      kanji('k1', 1),
      radical('r1', 1),
    ];
    const q = lessonQueue(catalogue, {}, 2);
    expect(q.map((i) => i.char)).toEqual(['r1', 'k1', 'r2', 'k2', 'w2']);
  });

  it('excludes items that already have progress', () => {
    const catalogue = [kanji('k1', 1), radical('r1', 1)];
    const q = lessonQueue(catalogue, { [itemId('kanji', 'k1')]: p(0) }, 1);
    expect(q.map((i) => i.char)).toEqual(['r1']);
  });

  it('excludes items above the level and locked words', () => {
    const catalogue = [kanji('k3', 3), vocab('w1', 1, ['x'])];
    expect(lessonQueue(catalogue, {}, 1)).toEqual([]);
  });
});

describe('canAdvance', () => {
  const makeLevel = (n: number, level: number): Item[] =>
    Array.from({ length: n }, (_, i) => kanji(`L${level}-${i}`, level));

  const withAdept = (items: Item[], count: number): ProgressMap => {
    const map: ProgressMap = {};
    items.forEach((item, i) => {
      map[item.id] = p(i < count ? 4 : 1);
    });
    return map;
  };

  it('is false below the 90% boundary and true at it', () => {
    const catalogue = makeLevel(100, 1);
    expect(canAdvance(1, withAdept(catalogue, 89), catalogue)).toBe(false);
    expect(canAdvance(1, withAdept(catalogue, 90), catalogue)).toBe(true);
  });

  it('counts stage 4 and above', () => {
    const catalogue = makeLevel(10, 1);
    const map: ProgressMap = {};
    catalogue.forEach((item, i) => {
      map[item.id] = p(i < 9 ? (i % 2 ? 5 : 7) : 3);
    });
    expect(canAdvance(1, map, catalogue)).toBe(true);
  });

  it('ignores radicals and vocab', () => {
    const catalogue: Item[] = [
      kanji('k1', 1),
      ...Array.from({ length: 9 }, (_, i) => kanji(`k${i + 2}`, 1)),
      radical('r1', 1),
      vocab('w1', 1, []),
    ];
    const map = withAdept(
      catalogue.filter((i) => i.type === 'kanji'),
      9,
    );
    expect(canAdvance(1, map, catalogue)).toBe(true);
  });

  it('never advances past the last level', () => {
    const catalogue = makeLevel(10, 5);
    expect(canAdvance(5, withAdept(catalogue, 10), catalogue)).toBe(false);
  });

  it('is false for a level with no kanji', () => {
    expect(canAdvance(1, {}, [radical('r1', 1)])).toBe(false);
  });
});
