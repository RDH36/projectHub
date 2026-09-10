import 'server-only'
import type { Tables } from '@/lib/types/database'
import type { RevenueCatAnalytics, RevenueCatMetric, SourceState } from './types'

const API = 'https://api.revenuecat.com/v2'
/** Le domaine Charts & Metrics est limité à 25 requêtes/minute : cache long. */
const REVALIDATE_SECONDS = 600

const LABELS: Record<string, string> = {
  mrr: 'MRR',
  revenue: 'Revenus (28 j)',
  active_subscriptions: 'Abonnements actifs',
  active_trials: 'Essais actifs',
  new_customers: 'Nouveaux clients (28 j)',
  active_users: 'Utilisateurs actifs (28 j)',
}

/** Ordre d'affichage ; les métriques inconnues passent à la fin. */
const ORDER = Object.keys(LABELS)

/** Descriptions renvoyées en anglais par l'API, traduites pour l'affichage. */
const DESCRIPTIONS: Record<string, string> = {
  'In total': 'total en cours',
  'Last 28 days': '28 derniers jours glissants',
  'Monthly Recurring Revenue': 'revenu mensuel récurrent',
}

type ApiMetric = {
  id: string
  name: string
  description?: string
  unit?: string
  period?: string
  value: number
  last_updated_at_iso8601?: string
}

/** Clé v2 propre au projet (REVENUECAT_API_KEY_<SLUG>) ou clé par défaut. */
function apiKeyFor(slug: string) {
  const suffix = slug.toUpperCase().replace(/[^A-Z0-9]/g, '_')
  return process.env[`REVENUECAT_API_KEY_${suffix}`] ?? process.env.REVENUECAT_API_KEY
}

export function isRevenueCatConfigured(slug: string) {
  return Boolean(apiKeyFor(slug))
}

export async function getRevenueCatAnalytics(
  project: Tables<'projects'>
): Promise<SourceState<RevenueCatAnalytics>> {
  const apiKey = apiKeyFor(project.slug)
  if (!apiKey) {
    return {
      status: 'unconfigured',
      reason: 'REVENUECAT_API_KEY manquante dans les variables d’environnement.',
    }
  }
  if (!project.revenuecat_project_id) {
    return {
      status: 'unconfigured',
      reason: 'Aucun `revenuecat_project_id` renseigné pour ce projet dans la table projects.',
    }
  }

  const currency = process.env.REVENUECAT_CURRENCY ?? 'USD'
  const url = `${API}/projects/${project.revenuecat_project_id}/metrics/overview?currency=${currency}`

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}`, Accept: 'application/json' },
      next: { revalidate: REVALIDATE_SECONDS },
    })
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      let message = body.slice(0, 200)
      try {
        message = (JSON.parse(body) as { message?: string }).message ?? message
      } catch {
        /* corps non JSON */
      }
      throw new Error(`RevenueCat ${res.status} : ${message}`)
    }
    const json = (await res.json()) as { metrics: ApiMetric[]; currency?: string }

    const metrics: RevenueCatMetric[] = json.metrics
      .map((m) => ({
        id: m.id,
        label: LABELS[m.id] ?? m.name,
        value: Number(m.value ?? 0),
        unit: (m.unit === '$' ? '$' : '#') as '$' | '#',
        period: m.period ?? 'P0D',
        description: DESCRIPTIONS[m.description ?? ''] ?? m.description ?? '',
      }))
      .sort((a, b) => {
        const ia = ORDER.indexOf(a.id)
        const ib = ORDER.indexOf(b.id)
        return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib)
      })

    const updatedAt =
      json.metrics
        .map((m) => m.last_updated_at_iso8601 ?? null)
        .filter((v): v is string => Boolean(v))
        .sort()
        .at(-1) ?? null

    return { status: 'ok', data: { currency: json.currency ?? currency, metrics, updatedAt } }
  } catch (err) {
    return { status: 'error', message: err instanceof Error ? err.message : 'Erreur RevenueCat' }
  }
}
