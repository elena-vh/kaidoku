import type { CustomMnemonics, Item } from '../types.ts'
import type { Verdict } from '../state/reducer.ts'
import { STAGES } from '../engine/intervals.ts'
import { stageInterval } from './format.ts'

export type VerdictTone = 'right' | 'near' | 'wrong'

export interface VerdictCopy {
  tone: VerdictTone
  title: string
  stageMove: string
  body: string
  mnemonic: string | null
  cta: string
}

export function mnemonicFor(item: Item, custom: CustomMnemonics): string {
  return (
    custom[item.id] ||
    item.mnemonic ||
    'No mnemonic supplied for this entry yet. Write one.'
  )
}

function readingPrefix(item: Item): string {
  if (item.type === 'vocab') return item.reading ? `Read ${item.reading}. ` : ''
  if (item.on) {
    return `On'yomi ${item.on}${item.kun ? `, kun'yomi ${item.kun}` : ''}. `
  }
  return ''
}

// The title carries the outcome in words - the three tones share a ground and
// differ only in ink, so colour alone must never be the signal.
export function verdictCopy(
  verdict: Verdict,
  item: Item,
  custom: CustomMnemonics,
): VerdictCopy {
  if (verdict.kind === 'near') {
    return {
      tone: 'near',
      title: 'Nearly — check the spelling',
      stageMove: 'nothing recorded yet',
      body: 'That is one letter away from an accepted meaning. Correct it and answer again; this attempt has not been counted.',
      mnemonic: null,
      cta: 'Try again',
    }
  }

  const from = STAGES[verdict.from].name
  const to = STAGES[verdict.to].name
  const stageMove = from === to ? `stays at ${to}` : `${from} → ${to}`

  if (verdict.kind === 'right') {
    return {
      tone: 'right',
      title: verdict.sealed ? 'Correct — and sealed' : 'Correct',
      stageMove,
      body: verdict.sealed
        ? 'This entry has climbed the whole ladder. It leaves the queue and will not be asked again.'
        : `Returns in ${stageInterval(verdict.to)}.`,
      mnemonic: null,
      cta: 'Next',
    }
  }

  return {
    tone: 'wrong',
    title: `Not accepted — ${item.meaning}`,
    stageMove,
    body: `${readingPrefix(item)}Returns in ${stageInterval(verdict.to)}.`,
    mnemonic: mnemonicFor(item, custom),
    cta: 'Next',
  }
}
