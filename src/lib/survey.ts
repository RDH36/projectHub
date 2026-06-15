import { Json } from '@/lib/types/database'

export type SurveyItem = {
  key: string | null
  question: string | null
  value: Json
  answer: string | null
}

export type ParsedResponse = {
  items: SurveyItem[]
  comment: string | null
  raw: Record<string, Json> | null
}

function isPlainObject(value: Json): value is { [key: string]: Json } {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function toText(value: Json | undefined): string | null {
  if (value === null || value === undefined) return null
  if (typeof value === 'string') return value
  return String(value)
}

/**
 * Parse une réponse de sondage (jsonb).
 * - Nouveau format : { items: [{ key, question, value, answer }], comment }
 * - Ancien format plat : { champ: valeur, ... }
 * - Scalaire : tout le reste
 */
export function parseSurveyResponse(response: Json): ParsedResponse {
  if (isPlainObject(response) && Array.isArray(response.items)) {
    const items: SurveyItem[] = response.items
      .filter(isPlainObject)
      .map((item) => ({
        key: toText(item.key),
        question: toText(item.question),
        value: item.value ?? null,
        answer: toText(item.answer),
      }))
    return { items, comment: toText(response.comment), raw: null }
  }

  if (isPlainObject(response)) {
    return { items: [], comment: null, raw: response }
  }

  return { items: [], comment: null, raw: null }
}

export function formatRawValue(value: Json | undefined): string {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'boolean') return value ? 'Oui' : 'Non'
  if (Array.isArray(value)) return value.map((v) => formatRawValue(v)).join(', ')
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

/** Texte court résumant la réponse, pour l'affichage en liste. */
export function responseSummary(response: Json): string {
  const { items, raw } = parseSurveyResponse(response)

  if (items.length > 0) {
    const parts = items
      .map((item) => item.answer ?? formatRawValue(item.value))
      .filter((part) => part && part !== '—')
    return parts.length ? parts.slice(0, 3).join(' · ') : '—'
  }

  if (raw) {
    const entries = Object.entries(raw)
    if (entries.length === 0) return '—'
    return entries
      .slice(0, 3)
      .map(([key, value]) => `${key}: ${formatRawValue(value)}`)
      .join(' · ')
  }

  return formatRawValue(response)
}
