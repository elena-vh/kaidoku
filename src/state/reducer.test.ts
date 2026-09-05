import { beforeEach, describe, expect, it } from 'vitest'
import type { AppState } from './reducer.ts'
import { initialState, persistable, reducer } from './reducer.ts'
import { defaultState } from '../engine/storage.ts'
import { itemId, type ItemId } from '../types.ts'
import { HOUR_MS } from '../engine/intervals.ts'

const FIRE = itemId('kanji', '火') // "fire"
const WATER = itemId('kanji', '水') // "water"
const MOUNTAIN = itemId('kanji', '山') // "mountain"
const T0 = 1_700_000_000_000

let state: AppState
beforeEach(() => {
  state = initialState(defaultState())
})

const startReview = (ids: ItemId[]) =>
  reducer(state, { type: 'review/start', ids })

describe('review/start', () => {
  it('builds a session and switches to the review screen', () => {
    const s = startReview([FIRE, WATER])
    expect(s.screen).toBe('review')
    expect(s.session).toMatchObject({ queue: [FIRE, WATER], i: 0, total: 2, right: 0, wrong: 0 })
    expect(s.answer).toBe('')
    expect(s.verdict).toBeNull()
  })
})

describe('review/submit', () => {
  it('empty input records nothing and shows no verdict', () => {
    let s = startReview([FIRE])
    s = reducer(s, { type: 'review/type', value: '   ' })
    const after = reducer(s, { type: 'review/submit', now: T0 })
    expect(after).toBe(s)
    expect(after.progress[FIRE]).toBeUndefined()
    expect(after.verdict).toBeNull()
  })

  it('near shows feedback but does not touch progress, stats or the queue', () => {
    let s = startReview([MOUNTAIN])
    s = reducer(s, { type: 'review/type', value: 'mountan' }) // one edit away
    const after = reducer(s, { type: 'review/submit', now: T0 })
    expect(after.verdict).toEqual({ kind: 'near' })
    expect(after.progress[MOUNTAIN]).toBeUndefined()
    expect(after.stats).toEqual(state.stats)
    expect(after.session?.i).toBe(0)
  })

  it('a correct answer schedules the item and updates stats', () => {
    let s = startReview([FIRE])
    s = reducer(s, { type: 'review/type', value: 'fire' })
    s = reducer(s, { type: 'review/submit', now: T0 })
    expect(s.verdict).toMatchObject({ kind: 'right', id: FIRE, from: 0, to: 1, sealed: false })
    expect(s.progress[FIRE]).toMatchObject({ stage: 1, due: T0 + 8 * HOUR_MS, seen: 1, correct: 1 })
    expect(s.stats).toMatchObject({ answered: 1, correct: 1, todayReviews: 1 })
    expect(s.session).toMatchObject({ right: 1, wrong: 0 })
  })

  it('a wrong answer records the lapse', () => {
    let s = startReview([FIRE])
    s = reducer(s, { type: 'review/type', value: 'nonsense' })
    s = reducer(s, { type: 'review/submit', now: T0 })
    expect(s.verdict).toMatchObject({ kind: 'wrong', from: 0, to: 0 })
    expect(s.progress[FIRE]).toMatchObject({ stage: 0, lapses: 1, seen: 1, correct: 0 })
    expect(s.stats).toMatchObject({ answered: 1, correct: 0, todayReviews: 1 })
    expect(s.session?.wrongIds).toEqual({ [FIRE]: true })
  })

  it('is a no-op while a verdict is showing', () => {
    let s = startReview([FIRE])
    s = reducer(s, { type: 'review/type', value: 'fire' })
    s = reducer(s, { type: 'review/submit', now: T0 })
    const again = reducer(s, { type: 'review/submit', now: T0 + 1 })
    expect(again).toBe(s)
  })
})

describe('review/advance', () => {
  it('near retry clears the verdict and keeps the typed answer', () => {
    let s = startReview([MOUNTAIN])
    s = reducer(s, { type: 'review/type', value: 'mountan' })
    s = reducer(s, { type: 'review/submit', now: T0 })
    s = reducer(s, { type: 'review/advance' })
    expect(s.verdict).toBeNull()
    expect(s.answer).toBe('mountan')
    expect(s.session?.i).toBe(0)
  })

  it('a right answer moves to the next card and clears the input', () => {
    let s = startReview([FIRE, WATER])
    s = reducer(s, { type: 'review/type', value: 'fire' })
    s = reducer(s, { type: 'review/submit', now: T0 })
    s = reducer(s, { type: 'review/advance' })
    expect(s.session).toMatchObject({ i: 1, done: 1, queue: [FIRE, WATER] })
    expect(s.answer).toBe('')
    expect(s.verdict).toBeNull()
  })

  it('a wrong answer requeues the id once at the back', () => {
    let s = startReview([FIRE, WATER])
    s = reducer(s, { type: 'review/type', value: 'nope' })
    s = reducer(s, { type: 'review/submit', now: T0 })
    s = reducer(s, { type: 'review/advance' })
    expect(s.session?.queue).toEqual([FIRE, WATER, FIRE])
    expect(s.session).toMatchObject({ i: 1, done: 1 })
  })

  it('is a no-op with no verdict showing', () => {
    const s = startReview([FIRE])
    expect(reducer(s, { type: 'review/advance' })).toBe(s)
  })
})

describe('review/end', () => {
  it('drops the session and returns to Today', () => {
    let s = startReview([FIRE])
    s = reducer(s, { type: 'review/end' })
    expect(s.session).toBeNull()
    expect(s.screen).toBe('today')
  })
})

describe('lessons', () => {
  const ids: ItemId[] = [itemId('radical', '一'), itemId('kanji', '火')]

  it('start / next / prev walk the pager without going out of bounds', () => {
    let s = reducer(state, { type: 'lessons/start', ids })
    expect(s.screen).toBe('lesson')
    expect(s.lesson).toEqual({ queue: ids, i: 0, done: false })
    s = reducer(s, { type: 'lessons/prev' })
    expect(s.lesson?.i).toBe(0)
    s = reducer(s, { type: 'lessons/next' })
    expect(s.lesson?.i).toBe(1)
    s = reducer(s, { type: 'lessons/next' })
    expect(s.lesson?.i).toBe(1)
  })

  it('commit writes the whole batch to stage 0 due +4h', () => {
    let s = reducer(state, { type: 'lessons/start', ids })
    s = reducer(s, { type: 'lessons/commit', now: T0 })
    expect(s.lesson?.done).toBe(true)
    for (const id of ids) {
      expect(s.progress[id]).toEqual({ stage: 0, due: T0 + 4 * HOUR_MS, lapses: 0, seen: 0, correct: 0 })
    }
  })

  it('drill hands the batch to a review session', () => {
    let s = reducer(state, { type: 'lessons/start', ids })
    s = reducer(s, { type: 'lessons/commit', now: T0 })
    s = reducer(s, { type: 'lessons/drill' })
    expect(s.screen).toBe('review')
    expect(s.lesson).toBeNull()
    expect(s.session?.queue).toEqual(ids)
  })
})

describe('mnemonic editing', () => {
  it('save stores a custom mnemonic; restore removes it', () => {
    let s: AppState = { ...state, screen: 'entry', entryId: FIRE }
    s = reducer(s, { type: 'mnemonic/edit' })
    expect(s.editing).toBe(true)
    s = reducer(s, { type: 'mnemonic/draft', value: 'my fire story' })
    s = reducer(s, { type: 'mnemonic/save' })
    expect(s.custom[FIRE]).toBe('my fire story')
    expect(s.editing).toBe(false)
    s = reducer(s, { type: 'mnemonic/restore' })
    expect(s.custom[FIRE]).toBeUndefined()
  })
})

describe('level/advance', () => {
  it('does nothing when the 90% rule is not met', () => {
    const s = reducer(state, { type: 'level/advance' })
    expect(s.level).toBe(state.level)
  })

  it('advances when every level-1 kanji is Sealed', () => {
    const progress = { ...state.progress }
    for (const c of ['一','二','三','人','大','山','川','口','日','月','木','火','水','土']) {
      progress[itemId('kanji', c)] = { stage: 7, due: Infinity, lapses: 0, seen: 9, correct: 9 }
    }
    const s = reducer({ ...state, level: 1, progress }, { type: 'level/advance' })
    expect(s.level).toBe(2)
    expect(s.viewLevel).toBe(2)
  })
})

describe('settings and clock', () => {
  it('settings/set merges a patch', () => {
    const s = reducer(state, { type: 'settings/set', patch: { strict: true } })
    expect(s.settings).toEqual({ ...state.settings, strict: true })
  })

  it('clock/shift accumulates and clock/reset zeroes', () => {
    let s = reducer(state, { type: 'clock/shift', ms: 4 * HOUR_MS })
    s = reducer(s, { type: 'clock/shift', ms: 24 * HOUR_MS })
    expect(s.offset).toBe(28 * HOUR_MS)
    s = reducer(s, { type: 'clock/reset' })
    expect(s.offset).toBe(0)
  })
})

describe('data/erase', () => {
  it('needs two presses and then wipes progress and custom mnemonics', () => {
    let s: AppState = {
      ...state,
      progress: { [FIRE]: { stage: 3, due: T0, lapses: 0, seen: 4, correct: 4 } },
      custom: { [FIRE]: 'story' },
      level: 4,
    }
    s = reducer(s, { type: 'data/erase' })
    expect(s.resetArmed).toBe(true)
    expect(s.progress[FIRE]).toBeDefined() // first press only arms
    s = reducer(s, { type: 'data/erase' })
    expect(s.progress).toEqual({})
    expect(s.custom).toEqual({})
    expect(s.level).toBe(1)
  })

  it('any navigation disarms the reset', () => {
    let s = reducer(state, { type: 'reset/arm' })
    s = reducer(s, { type: 'nav', screen: 'today' })
    expect(s.resetArmed).toBe(false)
  })
})

describe('persistable', () => {
  it('is exactly the allowed slice - no session, lesson, screen, answer, verdict', () => {
    const s = startReview([FIRE])
    expect(Object.keys(persistable(s)).sort()).toEqual([
      'custom',
      'level',
      'offset',
      'progress',
      'settings',
      'stats',
    ])
  })
})
