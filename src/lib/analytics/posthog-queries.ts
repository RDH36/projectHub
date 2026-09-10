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
  uniq(properties.$session_id) AS sessions
FROM events
WHERE ${baseWhere(scope, b.cur, b.end)}
GROUP BY date
ORDER BY date`
}

/**
 * Nouveaux utilisateurs par jour de première apparition sur la période
 * courante. La période précédente sert de recul pour distinguer un nouveau
 * venu d'un utilisateur de retour (un seul scan de 2× la période).
 * `person.created_at` est utilisé quand il est fiable ; certaines apps
 * (personnes anonymes) ont une date à 1970, d'où le repli sur le premier
 * événement observé.
 */
export function newUsersQuery(scope: Scope, range: AnalyticsRange) {
  const b = bounds(range)
  return `
SELECT toDate(first_seen) AS date, count() AS new_users
FROM (
  SELECT
    person_id,
    if(any(person.created_at) > toDateTime('2000-01-01 00:00:00'), any(person.created_at), min(timestamp)) AS first_seen
  FROM events
  WHERE ${baseWhere(scope, b.prev, b.end)}
  GROUP BY person_id
)
WHERE first_seen >= ${b.cur}
GROUP BY date
ORDER BY date`
}

/**
 * Les quatre classements (événements, écrans/pages, pays, versions/navigateurs)
 * en un seul scan : ARRAY JOIN déplie chaque événement en 4 dimensions, une
 * fenêtre garde les 8 premières valeurs par dimension.
 */
export function breakdownsQuery(scope: Scope, range: AnalyticsRange) {
  const b = bounds(range)
  const screenEvent = scope.kind === 'app' ? '$screen' : '$pageview'
  const screenProp = scope.kind === 'app' ? 'properties.$screen_name' : 'properties.$pathname'
  const versionProp = scope.kind === 'app' ? 'properties.$app_version' : 'properties.$browser'
  return `
SELECT dim, label, events, persons
FROM (
  SELECT
    dim,
    label,
    count() AS events,
    uniq(person_id) AS persons,
    row_number() OVER (PARTITION BY dim ORDER BY count() DESC) AS rn
  FROM events
  ARRAY JOIN
    ['event', 'screen', 'country', 'version'] AS dim,
    [
      if(event NOT LIKE '$%' AND event NOT LIKE 'Application %', event, ''),
      if(event = '${screenEvent}', toString(${screenProp}), ''),
      toString(properties.$geoip_country_name),
      toString(${versionProp})
    ] AS label
  WHERE ${baseWhere(scope, b.cur, b.end)}
    AND label != ''
  GROUP BY dim, label
)
WHERE rn <= 8
ORDER BY dim, events DESC`
}
