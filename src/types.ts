export type ItemType = 'radical' | 'kanji' | 'vocab';

// The literal union, not `number`, so INTERVALS[stage] is exhaustive.
export type Stage = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type Outcome = 'right' | 'near' | 'wrong' | 'empty';

// `${type}:${char}`, branded so a bare char can't be passed where an id belongs.
export type ItemId = string & { readonly __brand: 'ItemId' };

export interface Item {
  id: ItemId;
  type: ItemType;
  char: string;
  level: number;
  meaning: string;
  alt: string[];
  on: string;
  kun: string;
  reading: string;
  strokes: number | null;
  parts: string[]; // radical meanings this is built from (kanji only)
  uses: string[]; // kanji chars inside this word (vocab only)
  mnemonic: string;
}

export interface Progress {
  stage: Stage;
  due: number; // epoch ms, or Infinity for Sealed
  lapses: number;
  seen: number;
  correct: number;
}

export type ProgressMap = Record<ItemId, Progress>;

// User-authored mnemonics, kept apart so "restore original" always works.
export type CustomMnemonics = Record<ItemId, string>;

export const itemId = (type: ItemType, char: string): ItemId =>
  `${type}:${char}` as ItemId;

export interface Settings {
  batch: number;
  cap: number;
  hints: boolean;
  strict: boolean;
}

export interface Stats {
  answered: number;
  correct: number;
  todayReviews: number;
  streak: number;
}

// The only fields written to storage.
export interface PersistedState {
  progress: ProgressMap;
  custom: CustomMnemonics;
  settings: Settings;
  level: number;
  stats: Stats;
  offset: number;
}
