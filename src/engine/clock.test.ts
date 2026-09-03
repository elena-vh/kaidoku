import { afterEach, describe, expect, it, vi } from 'vitest'
import { fixedClock, offsetClock, realClock } from './clock.ts'
import { HOUR_MS } from './intervals.ts'

afterEach(() => {
  vi.useRealTimers()
})

describe('clock', () => {
  it('realClock reads Date.now()', () => {
    vi.useFakeTimers()
    vi.setSystemTime(1_700_000_000_000)
    expect(realClock.now()).toBe(1_700_000_000_000)
  })

  it('offsetClock shifts the present moment by a fixed amount', () => {
    vi.useFakeTimers()
    vi.setSystemTime(1_700_000_000_000)
    expect(offsetClock(4 * HOUR_MS).now()).toBe(1_700_000_000_000 + 4 * HOUR_MS)
    expect(offsetClock(-HOUR_MS).now()).toBe(1_700_000_000_000 - HOUR_MS)
  })

  it('fixedClock never moves', () => {
    const c = fixedClock(42)
    expect(c.now()).toBe(42)
    expect(c.now()).toBe(42)
  })
})
