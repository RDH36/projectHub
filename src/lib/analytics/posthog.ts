import 'server-only'
import { unstable_cache } from 'next/cache'
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
  breakdownsQuery,
  dailyQuery,
  kpiQuery,
  newUsersQuery,
  scopeFor,
  type Scope,
} from './posthog-queries'

/**
 * L'API PostHog a un budget horaire de données lues (plan gratuit). Les
 * résultats sont donc mis en cache 15 min côté serveur, partagés entre la vue
 * d'ensemble et la page Analytics, et uniquement en cas de succès.
 */
const CACHE_SECONDS = 900

type Row = Record<string, string | number | null>

class PosthogError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message)
  }
}

export function isPosthogConfigured() {
  return Boolean(process.env.POSTHOG_API_KEY && process.env.POSTHOG_PROJECT_ID)
}

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
    cache: 'no-store',
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    let detail = body.slice(0, 200)
    try {
      const parsed = JSON.parse(body) as { code?: string; detail?: string }
      if (parsed.code === 'api_queries_budget_exceeded') {
        detail = 'Budget horaire de lecture de l’API PostHog dépassé. Les données reviendront d’elles-mêmes dans l’heure ; en attendant, évitez de recharger la page.'
      } else if (parsed.detail) {
        detail = parsed.detail
      }
    } catch {
      /* corps non JSON */
    }
    throw new PosthogError(detail, res.status)
  }
  const json = (await res.json()) as { columns: string[]; results: (string | number | null)[][] }
  return json.results.map((values) =>
    Object.fromEntries(json.columns.map((col, i) => [col, values[i]]))
  )
}

const num = (v: string | number | null | undefined) => Number(v ?? 0)

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

/** Nouveaux utilisateurs par jour et total sur la période courante. */
function splitNewUsers(rows: Row[], range: AnalyticsRange) {
  const byDay = new Map<string, number>()
  let total = 0
  for (const row of rows) {
    const date = String(row.date).slice(0, 10)
    if (date < range.since) continue
    const count = num(row.new_users)
    total += count
    byDay.set(date, count)
  }
  return { byDay, total }
}

/** Répartit les lignes du scan unique en quatre classements. */
function splitBreakdowns(rows: Row[]) {
  const pick = (dim: string, metric: 'events' | 'persons'): RankedItem[] =>
    rows
      .filter((row) => row.dim === dim)
      .map((row) => ({ label: String(row.label ?? ''), value: num(row[metric]) }))
      .sort((a, b) => b.value - a.value)
  return {
    topEvents: pick('event', 'events'),
    topScreens: pick('screen', 'events'),
    countries: pick('country', 'persons'),
    versions: pick('version', 'persons'),
  }
}

/** Lance les 4 requêtes et assemble le résultat. Lève une erreur en cas d'échec (jamais mis en cache). */
async function fetchAnalytics(scope: Scope, range: AnalyticsRange): Promise<PosthogAnalytics> {
  const [kpis, daily, newUsers, breakdowns] = await Promise.all([
    hogql(kpiQuery(scope, range)),
    hogql(dailyQuery(scope, range)),
    hogql(newUsersQuery(scope, range)),
    hogql(breakdownsQuery(scope, range)),
  ])
  const k = kpis[0] ?? {}
  const fresh = splitNewUsers(newUsers, range)

  return {
    kind: scope.kind,
    activeUsers: { value: num(k.users), previous: num(k.users_prev) },
    newUsers: { value: fresh.total, previous: null },
    sessions: { value: num(k.sessions), previous: num(k.sessions_prev) },
    events: { value: num(k.events), previous: num(k.events_prev) },
    daily: toDaily(daily, fresh.byDay, range),
    ...splitBreakdowns(breakdowns),
  }
}

const cachedAnalytics = unstable_cache(
  (scope: Scope, range: AnalyticsRange) => fetchAnalytics(scope, range),
  ['posthog-analytics'],
  { revalidate: CACHE_SECONDS }
)

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
    return { status: 'ok', data: await cachedAnalytics(scope, range) }
  } catch (err) {
    return { status: 'error', message: err instanceof Error ? err.message : 'Erreur PostHog' }
  }
}
