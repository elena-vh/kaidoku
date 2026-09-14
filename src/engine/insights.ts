import type { ProgressMap } from '../types.ts';

export type RankCounts = readonly [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
];

export function rankCounts(progress: ProgressMap): RankCounts {
  const counts: [
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
  ] = [0, 0, 0, 0, 0, 0, 0, 0];
  for (const p of Object.values(progress)) {
    counts[p.stage] += 1;
  }
  return counts;
}
