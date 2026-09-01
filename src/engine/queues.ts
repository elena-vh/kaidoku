import type { Item, ItemType, ProgressMap, Stage } from '../types.ts'
import { itemId } from '../types.ts'
import { ADEPT_STAGE, ADVANCE_THRESHOLD, VOCAB_UNLOCK_STAGE } from './intervals.ts'

const MAX_LEVEL = 5

const TYPE_ORDER: Record<ItemType, number> = { radical: 0, kanji: 1, vocab: 2 }

function stageOf(progress: ProgressMap, id: Item['id']): Stage | null {
  return progress[id]?.stage ?? null
}

// A word opens only once every kanji it uses is at Novice IV. Checked live, not
// stored, so words unlock on their own as you progress.
export function isUnlocked(
  item: Item,
  progress: ProgressMap,
  level: number,
): boolean {
  if (item.level > level) return false
  if (item.type !== 'vocab') return true
  return item.uses.every((char) => {
    const stage = progress[itemId('kanji', char)]?.stage
    return stage !== undefined && stage >= VOCAB_UNLOCK_STAGE
  })
}

export function dueQueue(
  corpus: readonly Item[],
  progress: ProgressMap,
  now: number,
): Item[] {
  return corpus
    .filter((item) => {
      const p = progress[item.id]
      return p !== undefined && p.stage < 7 && p.due <= now
    })
    .sort((a, b) => (progress[a.id]?.due ?? 0) - (progress[b.id]?.due ?? 0))
}

export function lessonQueue(
  corpus: readonly Item[],
  progress: ProgressMap,
  level: number,
): Item[] {
  return corpus
    .filter((item) => isUnlocked(item, progress, level) && progress[item.id] === undefined)
    .sort(
      (a, b) =>
        a.level - b.level ||
        TYPE_ORDER[a.type] - TYPE_ORDER[b.type] ||
        corpus.indexOf(a) - corpus.indexOf(b),
    )
}

function levelKanji(corpus: readonly Item[], level: number): Item[] {
  return corpus.filter((i) => i.type === 'kanji' && i.level === level)
}

// A level advances when >= 90% of its kanji are at Adept. Radicals and vocab
// don't count.
export function canAdvance(
  level: number,
  progress: ProgressMap,
  corpus: readonly Item[],
): boolean {
  if (level >= MAX_LEVEL) return false
  const kanji = levelKanji(corpus, level)
  if (kanji.length === 0) return false
  const atAdept = kanji.filter((k) => {
    const stage = stageOf(progress, k.id)
    return stage !== null && stage >= ADEPT_STAGE
  }).length
  return atAdept / kanji.length >= ADVANCE_THRESHOLD
}

export function levelAdeptProgress(
  level: number,
  progress: ProgressMap,
  corpus: readonly Item[],
): { atAdept: number; total: number; needed: number } {
  const kanji = levelKanji(corpus, level)
  const atAdept = kanji.filter((k) => {
    const stage = stageOf(progress, k.id)
    return stage !== null && stage >= ADEPT_STAGE
  }).length
  return {
    atAdept,
    total: kanji.length,
    needed: Math.ceil(kanji.length * ADVANCE_THRESHOLD),
  }
}
