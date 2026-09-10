import type { Tables } from '@/lib/types/database'
import type { AnalyticsRange } from './types'

export type Scope = { kind: 'app' | 'web'; clause: string }

/** Événements techniques exclus des compteurs d'activité. */
const NOISE_EVENTS = ['$identify', '$set', '$web_vitals', '$feature_flag_called']

function literal(value: string) {
  return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`
}

/** Filtre HogQL qui isole le projet dans le projet PostHog partagé. */
export function scopeFor(project: Tables<'projects'>): Scope | null {
  if (project.posthog_app_name) {
    return { kind: 'app', clause: `properties.$app_name = ${literal(project.posthog_app_name)}` }
  }
  if (project.posthog_host) {
    return { kind: 'web', clause: `properties.$host = ${literal(project.posthog_host)}` }
  }
  return null
}

type Bounds = { cur: string; prev: string; end: string }

function bounds(range: AnalyticsRange): Bounds {
  return {
    cur: `toDateTime('${range.since} 00:00:00')`,
    prev: `toDateTime('${range.prevSince} 00:00:00')`,
    end: `toDateTime('${range.until} 00:00:00') + INTERVAL 1 DAY`,
  }
}

function baseWhere(scope: Scope, from: string, to: string) {
  const noise = NOISE_EVENTS.map(literal).join(', ')
  return `${scope.clause}
    AND timestamp >= ${from}
    AND timestamp < ${to}
    AND event NOT IN (${noise})`
}

/** KPIs période courante + période précédente, en un seul scan. */
export function kpiQuery(scope: Scope, range: AnalyticsRange) {
  const b = bounds(range)
  return `
SELECT
  uniqIf(person_id, timestamp >= ${b.cur}) AS users,
  uniqIf(person_id, timestamp < ${b.cur}) AS users_prev,
  uniqIf(person_id, timestamp >= ${b.cur} AND person.created_at >= ${b.cur}) AS new_users,
  uniqIf(person_id, timestamp < ${b.cur} AND person.created_at >= ${b.prev} AND person.created_at < ${b.cur}) AS new_users_prev,
  uniqIf(properties.$session_id, timestamp >= ${b.cur}) AS sessions,
  uniqIf(properties.$session_id, timestamp < ${b.cur}) AS sessions_prev,
  countIf(timestamp >= ${b.cur}) AS events,
  countIf(timestamp < ${b.cur}) AS events_prev
FROM events
WHERE ${baseWhere(scope, b.prev, b.end)}`
}

export function dailyQuery(scope: Scope, range: AnalyticsRange) {
  const b = bounds(range)
  return `
SELECT
  toDate(timestamp) AS date,
  uniq(person_id) AS users,
  uniqIf(person_id, toDate(person.created_at) = toDate(timestamp)) AS new_users,
  uniq(properties.$session_id) AS sessions
FROM events
WHERE ${baseWhere(scope, b.cur, b.end)}
GROUP BY date
ORDER BY date`
}

export function topEventsQuery(scope: Scope, range: AnalyticsRange) {
  const b = bounds(range)
  return `
SELECT event AS label, count() AS value
FROM events
WHERE ${baseWhere(scope, b.cur, b.end)}
  AND event NOT LIKE '$%'
  AND event NOT LIKE 'Application %'
GROUP BY label
ORDER BY value DESC
LIMIT 8`
}

/** Écrans (app) ou pages (web) les plus vus. */
export function topScreensQuery(scope: Scope, range: AnalyticsRange) {
  const b = bounds(range)
  const event = scope.kind === 'app' ? '$screen' : '$pageview'
  const prop = scope.kind === 'app' ? 'properties.$screen_name' : 'properties.$pathname'
  return `
SELECT ${prop} AS label, count() AS value
FROM events
WHERE ${baseWhere(scope, b.cur, b.end)}
  AND event = '${event}'
  AND notEmpty(toString(${prop}))
GROUP BY label
ORDER BY value DESC
LIMIT 8`
}

export function countriesQuery(scope: Scope, range: AnalyticsRange) {
  const b = bounds(range)
  return `
SELECT properties.$geoip_country_name AS label, uniq(person_id) AS value
FROM events
WHERE ${baseWhere(scope, b.cur, b.end)}
  AND notEmpty(toString(properties.$geoip_country_name))
GROUP BY label
ORDER BY value DESC
LIMIT 6`
}

/** Versions d'app (app) ou navigateurs (web). */
export function versionsQuery(scope: Scope, range: AnalyticsRange) {
  const b = bounds(range)
  const prop = scope.kind === 'app' ? 'properties.$app_version' : 'properties.$browser'
  return `
SELECT ${prop} AS label, uniq(person_id) AS value
FROM events
WHERE ${baseWhere(scope, b.cur, b.end)}
  AND notEmpty(toString(${prop}))
GROUP BY label
ORDER BY value DESC
LIMIT 6`
}
