import type { Stage } from '../types.ts';

export const HOUR_MS = 3_600_000;

export interface StageInfo {
  readonly stage: Stage;
  readonly name: string;
  readonly short: string;
  readonly hours: number | null; // null == never (Sealed)
  readonly note: string;
}

export const STAGES: readonly [
  StageInfo,
  StageInfo,
  StageInfo,
  StageInfo,
  StageInfo,
  StageInfo,
  StageInfo,
  StageInfo,
] = [
  {
    stage: 0,
    name: 'Novice I',
    short: 'Nov I',
    hours: 4,
    note: 'just entered',
  },
  {
    stage: 1,
    name: 'Novice II',
    short: 'Nov II',
    hours: 8,
    note: 'one correct answer',
  },
  {
    stage: 2,
    name: 'Novice III',
    short: 'Nov III',
    hours: 24,
    note: 'holds across a night',
  },
  {
    stage: 3,
    name: 'Novice IV',
    short: 'Nov IV',
    hours: 48,
    note: 'words using it unlock here',
  },
  {
    stage: 4,
    name: 'Adept',
    short: 'Adept',
    hours: 168,
    note: 'counts toward level advancement',
  },
  {
    stage: 5,
    name: 'Scholar',
    short: 'Scholar',
    hours: 336,
    note: 'a fortnight between meetings',
  },
  {
    stage: 6,
    name: 'Master',
    short: 'Master',
    hours: 720,
    note: 'asked once a month',
  },
  {
    stage: 7,
    name: 'Sealed',
    short: 'Sealed',
    hours: null,
    note: 'retired from the queue',
  },
];

export const INTERVALS: readonly [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  null,
] = [4, 8, 24, 48, 168, 336, 720, null];

export const LEECH_LAPSES = 3;

export const VOCAB_UNLOCK_STAGE: Stage = 3;
export const ADEPT_STAGE: Stage = 4;
export const ADVANCE_THRESHOLD = 0.9;

export function stageName(stage: Stage): string {
  return STAGES[stage].name;
}

export function stageShortName(stage: Stage): string {
  return STAGES[stage].short;
}

export function isSealed(stage: Stage): stage is 7 {
  return stage === 7;
}
