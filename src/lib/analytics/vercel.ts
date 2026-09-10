import 'server-only'
import type { Tables } from '@/lib/types/database'
import type {
  AnalyticsRange,
  RankedItem,
  SourceState,
  VercelAnalytics,
  VercelDaily,
} from './types'
import { eachDay } from './range'

const API = 'https://api.vercel.com/v1/query/web-analytics/visits/aggregate'
const REVALIDATE_SECONDS = 300
/** Fenêtre de reporting du plan Hobby : les 31 derniers jours seulement. */
const MAX_LOOKBACK_DAYS = 31

type Row = Record<string, string | number | null> & {
  pageviews?: number
  visitors?: number
  timestamp?: string
}

export function isVercelConfigured() {
  return Boolean(process.env.VERCEL_TOKEN)
}

async function aggregate(params: {
  projectId: string
  by: string
  since: string
  until: string
  limit?: number
}): Promise<Row[]> {
  const search = new URLSearchParams({
    projectId: params.projectId,
    by: params.by,
    since: params.since,
    until: params.until,
    limit: String(params.limit ?? 10),
  })
  if (process.env.VERCEL_TEAM_ID) search.set('teamId', process.env.VERCEL_TEAM_ID)

  const res = await fetch(`${API}?${search}`, {
    headers: { Authorization: `Bearer ${process.env.VERCEL_TOKEN}` },
    next: { revalidate: REVALIDATE_SECONDS },
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    let message = body.slice(0, 200)
    try {
      message = (JSON.parse(body) as { error?: { message?: string } }).error?.message ?? message
    } catch {
      /* corps non JSON */
    }
    throw new Error(`Vercel ${res.status} : ${message}`)
  }
  const json = (await res.json()) as { data: Row[] }
  return json.data ?? []
}

function toDaily(rows: Row[], range: AnalyticsRange): VercelDaily[] {
  const byDay = new Map<string, VercelDaily>()
  for (const row of rows) {
    if (!row.timestamp) continue
    const date = String(row.timestamp).slice(0, 10)
    byDay.set(date, {
      date,
      visitors: Number(row.visitors ?? 0),
      pageviews: Number(row.pageviews ?? 0),
    })
  }
  return eachDay(range).map(
    (date) => byDay.get(date) ?? { date, visitors: 0, pageviews: 0 }
  )
}

function toRanked(rows: Row[], dimension: string, metric: 'visitors' | 'pageviews'): RankedItem[] {
  return rows
    .map((row) => ({
      label: String(row[dimension] ?? '') || '(inconnu)',
      value: Number(row[metric] ?? 0),
    }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value)
}

/**
 * Restreint la période à la fenêtre de reporting Vercel. Renvoie la période
 * effective et le nombre de jours réellement couverts.
 */
function clampRange(range: AnalyticsRange): { effective: AnalyticsRange; truncated: boolean } {
  const today = new Date(`${range.until}T00:00:00Z`)
  const floor = new Date(today)
  floor.setUTCDate(floor.getUTCDate() - (MAX_LOOKBACK_DAYS - 1))
  const floorIso = floor.toISOString().slice(0, 10)
  if (range.since >= floorIso) return { effective: range, truncated: false }
  const days = Math.round((today.getTime() - floor.getTime()) / 86_400_000) + 1
  return { effective: { ...range, since: floorIso, days }, truncated: true }
}

/** La période précédente n'est interrogeable que si elle tient dans la fenêtre. */
function previousAvailable(range: AnalyticsRange) {
  const today = new Date(`${range.until}T00:00:00Z`)
  const floor = new Date(today)
  floor.setUTCDate(floor.getUTCDate() - (MAX_LOOKBACK_DAYS - 1))
  return range.prevSince >= floor.toISOString().slice(0, 10)
}

/** Total visiteurs uniques : une seule ligne (dimension `environment`, prod par défaut). */
function totals(rows: Row[]) {
  return rows.reduce<{ visitors: number; pageviews: number }>(
    (acc, row) => ({
      visitors: acc.visitors + Number(row.visitors ?? 0),
      pageviews: acc.pageviews + Number(row.pageviews ?? 0),
    }),
    { visitors: 0, pageviews: 0 }
  )
}

export async function getVercelAnalytics(
  project: Tables<'projects'>,
  range: AnalyticsRange
): Promise<SourceState<VercelAnalytics>> {
  if (!isVercelConfigured()) {
    return { status: 'unconfigured', reason: 'VERCEL_TOKEN manquant dans les variables d’environnement.' }
  }
  if (!project.vercel_project_id) {
    return {
      status: 'unconfigured',
      reason: 'Aucun `vercel_project_id` renseigné pour ce projet dans la table projects.',
    }
  }

  const projectId = project.vercel_project_id
  const { effective, truncated } = clampRange(range)
  const current = { since: effective.since, until: effective.until }
  const previous = { since: range.prevSince, until: range.prevUntil }
  // Hors fenêtre (ou en erreur), la comparaison est simplement absente.
  const previousTotals = previousAvailable(range)
    ? aggregate({ projectId, by: 'environment', ...previous, limit: 5 }).catch(() => null)
    : Promise.resolve(null)

  try {
    const [daily, totalNow, totalPrev, paths, referrers, countries, devices] =
      await Promise.all([
        aggregate({ projectId, by: 'day', ...current, limit: 100 }),
        aggregate({ projectId, by: 'environment', ...current, limit: 5 }),
        previousTotals,
        aggregate({ projectId, by: 'requestPath', ...current, limit: 8 }),
        aggregate({ projectId, by: 'referrerHostname', ...current, limit: 6 }),
        aggregate({ projectId, by: 'country', ...current, limit: 6 }),
        aggregate({ projectId, by: 'deviceType', ...current, limit: 4 }),
      ])

    const now = totals(totalNow)
    const prev = totalPrev ? totals(totalPrev) : null

    return {
      status: 'ok',
      data: {
        visitors: { value: now.visitors, previous: prev?.visitors ?? null },
        pageviews: { value: now.pageviews, previous: prev?.pageviews ?? null },
        daily: toDaily(daily, effective),
        coveredDays: effective.days,
        truncated,
        topPaths: toRanked(paths, 'requestPath', 'pageviews'),
        referrers: toRanked(referrers, 'referrerHostname', 'visitors'),
        countries: toRanked(countries, 'country', 'visitors'),
        devices: toRanked(devices, 'deviceType', 'visitors'),
      },
    }
  } catch (err) {
    return { status: 'error', message: err instanceof Error ? err.message : 'Erreur Vercel' }
  }
}
