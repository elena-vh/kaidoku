// Every vocab `uses` char and every kanji `parts` meaning must resolve to a real
// item - run as a test so a content typo shows up on the spot, not weeks into a
// review cycle.

import type { Item } from '../types.ts'
import { CORPUS } from './corpus.ts'

export interface CorpusProblem {
  itemId: string
  kind: 'parts' | 'uses'
  ref: string
  message: string
}

export function validateCorpus(corpus: readonly Item[] = CORPUS): CorpusProblem[] {
  const problems: CorpusProblem[] = []

  const radicalMeanings = new Set(
    corpus.filter((i) => i.type === 'radical').map((i) => i.meaning),
  )
  const kanjiChars = new Set(
    corpus.filter((i) => i.type === 'kanji').map((i) => i.char),
  )

  for (const item of corpus) {
    if (item.type === 'kanji') {
      for (const part of item.parts) {
        if (!radicalMeanings.has(part)) {
          problems.push({
            itemId: item.id,
            kind: 'parts',
            ref: part,
            message: `${item.id} (${item.char}) has part "${part}" with no radical of that meaning`,
          })
        }
      }
    }
    if (item.type === 'vocab') {
      for (const use of item.uses) {
        if (!kanjiChars.has(use)) {
          problems.push({
            itemId: item.id,
            kind: 'uses',
            ref: use,
            message: `${item.id} (${item.char}) uses "${use}" with no kanji of that character`,
          })
        }
      }
    }
  }

  return problems
}

export function assertCorpusValid(corpus: readonly Item[] = CORPUS): void {
  const problems = validateCorpus(corpus)
  if (problems.length > 0) {
    throw new Error(
      `Corpus integrity check failed (${problems.length}):\n` +
        problems.map((p) => `  - ${p.message}`).join('\n'),
    )
  }
}
