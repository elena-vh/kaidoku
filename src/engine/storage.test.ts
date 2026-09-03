import { beforeEach, describe, expect, it } from 'vitest'
import type { PersistedState } from '../types.ts'
import { itemId } from '../types.ts'
import {
  STORAGE_KEY,
  clear,
  defaultState,
  exportJson,
  importJson,
  load,
  loadOrDefault,
  migrate,
  save,
} from './storage.ts'

const sample = (): PersistedState => ({
  progress: {
    [itemId('kanji', '火')]: { stage: 4, due: 1_700_000_000_000, lapses: 1, seen: 8, correct: 6 },
    [itemId('kanji', '水')]: { stage: 7, due: Infinity, lapses: 0, seen: 12, correct: 12 },
  },
  custom: { [itemId('kanji', '火')]: 'my own story about fire' },
  settings: { batch: 10, cap: 60, hints: true, strict: true },
  level: 3,
  stats: { answered: 200, correct: 170, todayReviews: 12, streak: 5 },
  offset: 4 * 3_600_000,
})

beforeEach(() => {
  clear()
})

describe('save / load round-trip', () => {
  it('reloads an identical state', () => {
    const state = sample()
    save(state)
    expect(load()).toEqual(state)
  })

  it('keeps a Sealed item Sealed, with an Infinity due date, across the JSON round-trip', () => {
    save(sample())
    const back = load()
    const sealed = back?.progress[itemId('kanji', '水')]
    expect(sealed?.stage).toBe(7)
    expect(sealed?.due).toBe(Infinity)
    expect(Number.isFinite(sealed?.due)).toBe(false)
  })

  it('load returns null when nothing is stored', () => {
    expect(load()).toBeNull()
  })

  it('loadOrDefault falls back to a fresh level-1 state', () => {
    expect(loadOrDefault()).toEqual(defaultState())
  })

  it('persists only the allowed slice - no session or lesson keys', () => {
    save(sample())
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY)!)
    expect(Object.keys(raw.state).sort()).toEqual([
      'custom',
      'level',
      'offset',
      'progress',
      'settings',
      'stats',
    ])
    expect(raw.version).toBe(3)
  })
})

describe('migrate', () => {
  it('rejects a blob with no progress', () => {
    expect(migrate(null)).toBeNull()
    expect(migrate({ settings: {} })).toBeNull()
    expect(migrate('nonsense')).toBeNull()
  })

  it('accepts a bare top-level object without the version envelope', () => {
    const bare = {
      progress: { [itemId('kanji', '火')]: { stage: 2, due: 123, lapses: 0, seen: 1, correct: 1 } },
      custom: {},
      settings: { batch: 5, cap: 40, hints: false, strict: false },
      level: 2,
      stats: { answered: 1, correct: 1, todayReviews: 0, streak: 0 },
      offset: 0,
    }
    expect(migrate(bare)).toEqual(bare)
  })

  it('reads due:null back as Infinity for a Sealed item', () => {
    const migrated = migrate({
      version: 3,
      state: {
        progress: { [itemId('kanji', '水')]: { stage: 7, due: null, lapses: 0, seen: 1, correct: 1 } },
      },
    })
    expect(migrated?.progress[itemId('kanji', '水')]?.due).toBe(Infinity)
  })

  it('fills missing fields with defaults and clamps a bad stage', () => {
    const migrated = migrate({
      progress: { [itemId('kanji', '火')]: { stage: 99 } },
    })
    expect(migrated?.progress[itemId('kanji', '火')]).toEqual({
      stage: 7,
      due: Infinity,
      lapses: 0,
      seen: 0,
      correct: 0,
    })
    expect(migrated?.level).toBe(1)
    expect(migrated?.settings).toEqual(defaultState().settings)
  })

  it('drops empty custom mnemonics', () => {
    const migrated = migrate({
      progress: { [itemId('kanji', '火')]: { stage: 1, due: 1, lapses: 0, seen: 1, correct: 1 } },
      custom: { [itemId('kanji', '火')]: '   ', [itemId('kanji', '水')]: 'kept' },
    })
    expect(migrated?.custom).toEqual({ [itemId('kanji', '水')]: 'kept' })
  })
})

describe('exportJson / importJson', () => {
  it('round-trips through a JSON string', () => {
    const state = sample()
    const text = exportJson(state)
    expect(text).toContain('\n') // pretty-printed
    expect(importJson(text)).toEqual(state)
  })

  it('throws on invalid JSON', () => {
    expect(() => importJson('{ not json')).toThrow(/not valid JSON/)
  })

  it('throws on JSON that is not a Kaidoku record', () => {
    expect(() => importJson('{"hello":"world"}')).toThrow(/no recognisable/)
  })
})

describe('save when storage is unavailable', () => {
  it('does not throw', () => {
    const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      get() {
        throw new Error('blocked')
      },
    })
    expect(() => save(sample())).not.toThrow()
    expect(load()).toBeNull()
    if (original) Object.defineProperty(globalThis, 'localStorage', original)
  })
})
