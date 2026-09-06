import type { ItemType, Stage } from '../types.ts'
import { INTERVALS } from '../engine/intervals.ts'

export function typeLabel(type: ItemType): string {
  return type === 'radical' ? 'Component' : type === 'kanji' ? 'Character' : 'Word'
}

export function humanInterval(hours: number | null): string {
  if (hours === null) return 'never'
  if (hours < 24) return `${hours} hours`
  if (hours < 168) {
    const d = hours / 24
    return `${d} ${d === 1 ? 'day' : 'days'}`
  }
  if (hours < 720) {
    const w = hours / 168
    return `${w} ${w === 1 ? 'week' : 'weeks'}`
  }
  const m = Math.round(hours / 720)
  return `${m} ${m === 1 ? 'month' : 'months'}`
}

export function stageInterval(stage: Stage): string {
  return humanInterval(INTERVALS[stage])
}

export function until(due: number, now: number): string {
  if (!Number.isFinite(due)) return 'sealed'
  const delta = due - now
  if (delta <= 0) return 'due now'
  const hours = delta / 3_600_000
  if (hours < 1) return `in ${Math.max(1, Math.round(hours * 60))} minutes`
  if (hours < 24) return `in ${Math.round(hours)} hours`
  const days = Math.round(hours / 24)
  if (days < 30) return `in ${days} ${days === 1 ? 'day' : 'days'}`
  return `in ${Math.round(days / 30)} months`
}

export function pct(numerator: number, denominator: number): string {
  if (denominator <= 0) return '0%'
  return `${Math.round((numerator / denominator) * 100)}%`
}
