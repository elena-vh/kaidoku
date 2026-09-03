// Time enters the engine only as a `now: number` argument. This is the one place
// that produces that number, so the rest stays testable without faking timers.

export interface Clock {
  now(): number
}

export const realClock: Clock = {
  now: () => Date.now(),
}

// Intervals stay real; only the present moment moves. Used by the clock-shift
// dev control (+4h / +1 day) so a 30-day interval can be inspected now.
export const offsetClock = (offsetMs: number): Clock => ({
  now: () => Date.now() + offsetMs,
})

export const fixedClock = (t: number): Clock => ({
  now: () => t,
})
