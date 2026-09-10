const compact = new Intl.NumberFormat('fr-FR', {
  notation: 'compact',
  maximumFractionDigits: 1,
})
const plain = new Intl.NumberFormat('fr-FR')

/** 1284 → « 1,3 k », 42 → « 42 » */
export function formatCompact(value: number) {
  return Math.abs(value) < 10_000 ? plain.format(value) : compact.format(value)
}

export function formatNumber(value: number) {
  return plain.format(value)
}

/** 1234.5 → « 1 234,50 $US » ; devise ISO (USD, EUR…) */
export function formatMoney(value: number, currency: string) {
  try {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency,
      maximumFractionDigits: value >= 1000 ? 0 : 2,
    }).format(value)
  } catch {
    return `${plain.format(value)} ${currency}`
  }
}

/** +12,5 % / −3 % ; null si non calculable */
export function formatPercent(value: number | null, digits = 0) {
  if (value === null || !Number.isFinite(value)) return null
  const sign = value > 0 ? '+' : value < 0 ? '−' : ''
  return `${sign}${Math.abs(value).toFixed(digits).replace('.', ',')} %`
}

const shortDay = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' })
const longDay = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'short',
  day: 'numeric',
  month: 'long',
})

/** « 2026-09-04 » → « 4 sept. » */
export function formatShortDay(iso: string) {
  return shortDay.format(new Date(`${iso}T00:00:00`))
}

export function formatLongDay(iso: string) {
  return longDay.format(new Date(`${iso}T00:00:00`))
}

export function formatDate(dateStr: string | null) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatDateTime(dateStr: string | null) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** Date relative courte : « il y a 3 j », « à l’instant » */
export function formatRelative(dateStr: string | null) {
  if (!dateStr) return '—'
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.round(diff / 60_000)
  if (minutes < 1) return 'à l’instant'
  if (minutes < 60) return `il y a ${minutes} min`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `il y a ${hours} h`
  const days = Math.round(hours / 24)
  if (days < 30) return `il y a ${days} j`
  return formatDate(dateStr)
}
