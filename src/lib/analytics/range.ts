import type { AnalyticsRange, RangeKey } from './types'

const RANGES: Record<RangeKey, { days: number; label: string }> = {
  '7d': { days: 7, label: '7 derniers jours' },
  '30d': { days: 30, label: '30 derniers jours' },
  '90d': { days: 90, label: '90 derniers jours' },
}

export const RANGE_KEYS = Object.keys(RANGES) as RangeKey[]

function isoDay(date: Date) {
  return date.toISOString().slice(0, 10)
}

function shiftDays(date: Date, days: number) {
  const d = new Date(date)
  d.setUTCDate(d.getUTCDate() + days)
  return d
}

/** Construit la période à partir du paramètre `?range=` (défaut : 30 jours). */
export function resolveRange(raw: string | undefined): AnalyticsRange {
  const key: RangeKey = raw && raw in RANGES ? (raw as RangeKey) : '30d'
  const { days, label } = RANGES[key]

  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)
  const since = shiftDays(today, -(days - 1))
  const prevUntil = shiftDays(since, -1)
  const prevSince = shiftDays(prevUntil, -(days - 1))

  return {
    key,
    days,
    label,
    since: isoDay(since),
    until: isoDay(today),
    prevSince: isoDay(prevSince),
    prevUntil: isoDay(prevUntil),
  }
}

/** Liste des jours (YYYY-MM-DD) de la période, pour combler les trous. */
export function eachDay(range: AnalyticsRange): string[] {
  const out: string[] = []
  let cursor = new Date(`${range.since}T00:00:00Z`)
  const end = new Date(`${range.until}T00:00:00Z`)
  while (cursor <= end) {
    out.push(isoDay(cursor))
    cursor = shiftDays(cursor, 1)
  }
  return out
}

/** Variation en % entre deux valeurs, null si non calculable. */
export function percentChange(value: number, previous: number | null) {
  if (previous === null || previous === 0) return null
  return ((value - previous) / previous) * 100
}
