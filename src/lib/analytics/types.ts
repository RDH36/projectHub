export type RangeKey = '7d' | '30d' | '90d'

export type AnalyticsRange = {
  key: RangeKey
  days: number
  label: string
  /** Début de la période courante (YYYY-MM-DD) */
  since: string
  /** Fin de la période courante (YYYY-MM-DD, inclus) */
  until: string
  /** Début de la période précédente, de même durée */
  prevSince: string
  prevUntil: string
}

/** Valeur courante + valeur de la période précédente (pour le delta). */
export type Kpi = { value: number; previous: number | null }

export type RankedItem = { label: string; value: number }

export type PosthogDaily = {
  date: string
  users: number
  newUsers: number
  sessions: number
}

export type PosthogAnalytics = {
  activeUsers: Kpi
  newUsers: Kpi
  sessions: Kpi
  events: Kpi
  daily: PosthogDaily[]
  topEvents: RankedItem[]
  topScreens: RankedItem[]
  countries: RankedItem[]
  versions: RankedItem[]
  /** Mobile (app) ou web (site) — change les libellés */
  kind: 'app' | 'web'
}

export type VercelDaily = { date: string; visitors: number; pageviews: number }

export type VercelAnalytics = {
  visitors: Kpi
  pageviews: Kpi
  daily: VercelDaily[]
  /** Jours réellement couverts (le plan Hobby limite à 31 jours) */
  coveredDays: number
  /** Vrai si la période demandée a été raccourcie à la fenêtre Vercel */
  truncated: boolean
  topPaths: RankedItem[]
  referrers: RankedItem[]
  countries: RankedItem[]
  devices: RankedItem[]
}

export type RevenueCatMetric = {
  id: string
  label: string
  value: number
  /** '$' = montant dans `currency`, '#' = compteur */
  unit: '$' | '#'
  /** Durée ISO 8601 (P0D = instantané, P28D = 28 jours glissants) */
  period: string
  description: string
}

export type RevenueCatAnalytics = {
  currency: string
  metrics: RevenueCatMetric[]
  updatedAt: string | null
}

/**
 * État d'une source externe. `unconfigured` = il manque une clé ou un
 * paramètre projet ; `error` = l'API a répondu mais a échoué.
 */
export type SourceState<T> =
  | { status: 'ok'; data: T }
  | { status: 'unconfigured'; reason: string }
  | { status: 'error'; message: string }
