// Drives a scripted sequence through schedule() and checks the final stage and
// due date against an independent reference - covers a climb to Sealed and an
// Adept lapse.

import { describe, expect, it } from 'vitest'
import type { Progress, Stage } from '../types.ts'
import { HOUR_MS, INTERVALS } from './intervals.ts'
import { schedule, type ScheduleOutcome } from './schedule.ts'

const T0 = 1_700_000_000_000
const START: Progress = { stage: 0, due: 0, lapses: 0, seen: 0, correct: 0 }

// An independent reimplementation of the ladder, to check schedule() against.
function referenceStage(stage: Stage, outcome: ScheduleOutcome): Stage {
  if (outcome === 'right') return Math.min(7, stage + 1) as Stage
  return Math.max(0, stage - (stage >= 4 ? 2 : 1)) as Stage
}

function run(script: readonly ScheduleOutcome[]) {
  let p = START
  let t = T0
  let refStage: Stage = 0
  for (const outcome of script) {
    p = schedule(p, outcome, t)
    refStage = referenceStage(refStage, outcome)
    t += HOUR_MS
  }
  return { p, lastNow: t - HOUR_MS, refStage }
}

describe('long-run scheduling', () => {
  it('lands where hand-computation says after a fully spelled-out script', () => {
    // step (0-indexed) | outcome | stage after | due after
    //  0 right  0 -> 1   +8h
    //  1 right  1 -> 2   +24h
    //  2 right  2 -> 3   +48h
    //  3 right  3 -> 4   +168h   (Adept)
    //  4 wrong  4 -> 2   +24h    <- the Adept lapse: TWO ranks
    //  5 right  2 -> 3   +48h
    //  6 right  3 -> 4   +168h
    //  7 right  4 -> 5   +336h
    //  8 right  5 -> 6   +720h
    //  9 right  6 -> 7   never   (Sealed)
    // 10 right  7 -> 7   never   (stays Sealed)
    const script: ScheduleOutcome[] = [
      'right', 'right', 'right', 'right', 'wrong',
      'right', 'right', 'right', 'right', 'right', 'right',
    ]
    const { p } = run(script)
    expect(p.stage).toBe(7)
    expect(p.due).toBe(Infinity)
    expect(p.seen).toBe(11)
    expect(p.correct).toBe(10)
    expect(p.lapses).toBe(1)

    // and the Adept lapse mid-script, recomputed on its own
    const adept = schedule(
      { stage: 4, due: 0, lapses: 0, seen: 0, correct: 0 },
      'wrong',
      T0,
    )
    expect(adept.stage).toBe(2)
    expect(adept.due).toBe(T0 + 24 * HOUR_MS)
  })

  it('a 200-outcome mixed run matches the independent reference', () => {
    // deterministic pseudo-random script, ~55% right
    const script: ScheduleOutcome[] = []
    let seed = 12345
    for (let i = 0; i < 200; i++) {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff
      script.push((seed % 100) / 100 < 0.55 ? 'right' : 'wrong')
    }

    const { p, lastNow, refStage } = run(script)
    const rights = script.filter((o) => o === 'right').length

    expect(p.stage).toBe(refStage)
    expect(p.seen).toBe(200)
    expect(p.correct).toBe(rights)
    expect(p.lapses).toBe(200 - rights)

    const hrs = INTERVALS[p.stage]
    expect(p.due).toBe(hrs === null ? Infinity : lastNow + hrs * HOUR_MS)
  })

  it('a run of 200 correct answers seals and stays sealed', () => {
    const { p } = run(Array.from({ length: 200 }, () => 'right' as const))
    expect(p.stage).toBe(7)
    expect(p.due).toBe(Infinity)
    expect(p.correct).toBe(200)
    expect(p.lapses).toBe(0)
  })

  it('a run of 200 wrong answers stays pinned at Novice I', () => {
    const { p, lastNow } = run(Array.from({ length: 200 }, () => 'wrong' as const))
    expect(p.stage).toBe(0)
    expect(p.due).toBe(lastNow + 4 * HOUR_MS)
    expect(p.lapses).toBe(200)
  })
})
