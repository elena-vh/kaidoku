import type { Outcome } from '../types.ts'

export interface JudgeTarget {
  meaning: string
  alt: string[]
}

const MIN_NEAR_LEN = 3

export function normalise(input: string): string {
  return (input || '')
    .toLowerCase()
    .trim()
    .replace(/[.’',!?]/g, '')
    .replace(/^(to|the|a|an)\s+/, '')
    .replace(/\s+/g, ' ')
}

export function distance(a: string, b: string): number {
  const m = a.length
  const n = b.length
  if (m === 0) return n
  if (n === 0) return m
  let prev: number[] = Array.from({ length: n + 1 }, (_, j) => j)
  for (let i = 1; i <= m; i++) {
    const cur: number[] = [i]
    for (let j = 1; j <= n; j++) {
      const sub = (prev[j - 1] ?? 0) + (a[i - 1] === b[j - 1] ? 0 : 1)
      cur[j] = Math.min((prev[j] ?? 0) + 1, (cur[j - 1] ?? 0) + 1, sub)
    }
    prev = cur
  }
  return prev[n] ?? 0
}

export function judge(
  target: JudgeTarget,
  input: string,
  strict = false,
): Outcome {
  const g = normalise(input)
  if (!g) return 'empty'

  const accepted = [target.meaning, ...target.alt].map(normalise).filter(Boolean)

  if (accepted.includes(g)) return 'right'

  // one long word out of a multi-word meaning ("mountain" for "rice field mountain")
  if (accepted.some((a) => a.split(' ').includes(g)) && g.length > MIN_NEAR_LEN) {
    return 'right'
  }

  // within one edit of an accepted meaning, on a target long enough to be sure
  if (
    !strict &&
    accepted.some((a) => a.length > MIN_NEAR_LEN && distance(a, g) <= 1)
  ) {
    return 'near'
  }

  return 'wrong'
}
