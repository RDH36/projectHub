import 'server-only'
import type { Tables } from '@/lib/types/database'
import type {
  AnalyticsRange,
  PosthogAnalytics,
  PosthogDaily,
  RankedItem,
  SourceState,
} from './types'
import { eachDay } from './range'
import {
  countriesQuery,
  dailyQuery,
  kpiQuery,
  newUsersQuery,
  scopeFor,
  topEventsQuery,
  topScreensQuery,
  versionsQuery,
} from './posthog-queries'

const REVALIDATE_SECONDS = 300

export function isPosthogConfigured() {
  return Boolean(process.env.POSTHOG_API_KEY && process.env.POSTHOG_PROJECT_ID)
}

type Row = Record<string, string | number | null>

/** Exécute une requête HogQL via l'API Query et renvoie des lignes nommées. */
async function hogql(query: string): Promise<Row[]> {
  const host = (process.env.POSTHOG_HOST ?? 'https://us.posthog.com').replace(/\/$/, '')
  const projectId = process.env.POSTHOG_PROJECT_ID

  const res = await fetch(`${host}/api/projects/${projectId}/query/`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.POSTHOG_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: { kind: 'HogQLQuery', query } }),
    next: { revalidate: REVALIDATE_SECONDS },
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`PostHog ${res.status} : ${body.slice(0, 200)}`)
  }
  const json = (await res.json()) as { columns: string[]; results: (string | number | null)[][] }
  return json.results.map((values) =>
    Object.fromEntries(json.columns.map((col, i) => [col, values[i]]))
  )
}

const num = (v: string | number | null | undefined) => Number(v ?? 0)

function toRanked(rows: Row[]): RankedItem[] {
  return rows.map((row) => ({ label: String(row.label ?? ''), value: num(row.value) }))
}

function toDaily(rows: Row[], newByDay: Map<string, number>, range: AnalyticsRange): PosthogDaily[] {
  const byDay = new Map(rows.map((row) => [String(row.date).slice(0, 10), row]))
  return eachDay(range).map((date) => {
    const row = byDay.get(date)
    return {
      date,
      users: num(row?.users),
      newUsers: newByDay.get(date) ?? 0,
      sessions: num(row?.sessions),
    }
  })
}

/** Sépare les nouveaux utilisateurs entre période courante et précédente. */
function splitNewUsers(rows: Row[], range: AnalyticsRange) {
  const byDay = new Map<string, number>()
  let current = 0
  let previous = 0
  for (const row of rows) {
    const date = String(row.date).slice(0, 10)
    const count = num(row.new_users)
    if (date >= range.since) {
      current += count
      byDay.set(date, count)
    } else if (date >= range.prevSince) {
      previous += count
    }
  }
  return { byDay, current, previous }
}

export async function getPosthogAnalytics(
  project: Tables<'projects'>,
  range: AnalyticsRange
): Promise<SourceState<PosthogAnalytics>> {
  if (!isPosthogConfigured()) {
    return {
      status: 'unconfigured',
      reason: 'POSTHOG_API_KEY et POSTHOG_PROJECT_ID manquants dans les variables d’environnement.',
    }
  }
  const scope = scopeFor(project)
  if (!scope) {
    return {
      status: 'unconfigured',
      reason: 'Renseigner `posthog_app_name` (app) ou `posthog_host` (site) pour ce projet dans la table projects.',
    }
  }

  try {
    const [kpis, daily, newUsers, topEvents, topScreens, countries, versions] = await Promise.all([
      hogql(kpiQuery(scope, range)),
      hogql(dailyQuery(scope, range)),
      hogql(newUsersQuery(scope, range)),
      hogql(topEventsQuery(scope, range)),
      hogql(topScreensQuery(scope, range)),
      hogql(countriesQuery(scope, range)),
      hogql(versionsQuery(scope, range)),
    ])
    const k = kpis[0] ?? {}
    const fresh = splitNewUsers(newUsers, range)

    return {
      status: 'ok',
      data: {
        kind: scope.kind,
        activeUsers: { value: num(k.users), previous: num(k.users_prev) },
        newUsers: { value: fresh.current, previous: fresh.previous },
        sessions: { value: num(k.sessions), previous: num(k.sessions_prev) },
        events: { value: num(k.events), previous: num(k.events_prev) },
        daily: toDaily(daily, fresh.byDay, range),
        topEvents: toRanked(topEvents),
        topScreens: toRanked(topScreens),
        countries: toRanked(countries),
        versions: toRanked(versions),
      },
    }
  } catch (err) {
    return { status: 'error', message: err instanceof Error ? err.message : 'Erreur PostHog' }
  }
}
