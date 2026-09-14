import { describe, expect, it } from 'vitest';
import type { Progress, ProgressMap, Stage } from '../types.ts';
import { itemId } from '../types.ts';
import { rankCounts } from './insights.ts';

const at = (stage: Stage): Progress => ({
  stage,
  due: 0,
  lapses: 0,
  seen: 1,
  correct: 1,
});

describe('rankCounts', () => {
  it('is eight zeroes for an empty record', () => {
    expect(rankCounts({})).toEqual([0, 0, 0, 0, 0, 0, 0, 0]);
  });

  it('counts one item per stage', () => {
    const progress: ProgressMap = {
      [itemId('kanji', 'a')]: at(0),
      [itemId('kanji', 'b')]: at(0),
      [itemId('kanji', 'c')]: at(4),
      [itemId('kanji', 'd')]: at(7),
    };
    expect(rankCounts(progress)).toEqual([2, 0, 0, 0, 1, 0, 0, 1]);
  });

  it('totals to the number of started items', () => {
    const progress: ProgressMap = {
      [itemId('kanji', 'a')]: at(1),
      [itemId('kanji', 'b')]: at(3),
      [itemId('kanji', 'c')]: at(3),
    };
    const total = rankCounts(progress).reduce((a, b) => a + b, 0);
    expect(total).toBe(3);
  });
});
