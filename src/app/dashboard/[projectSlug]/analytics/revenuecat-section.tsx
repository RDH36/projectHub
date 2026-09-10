import { SectionHeading } from '@/components/analytics/section-heading'
import { SourceEmpty } from '@/components/analytics/source-empty'
import { formatMoney, formatNumber, formatRelative } from '@/lib/format'
import type { RevenueCatAnalytics, RevenueCatMetric, SourceState } from '@/lib/analytics/types'

function MetricTile({ metric, currency }: { metric: RevenueCatMetric; currency: string }) {
  const value =
    metric.unit === '$' ? formatMoney(metric.value, currency) : formatNumber(metric.value)
  return (
    <div className="flex flex-col justify-between gap-4 rounded-xl border bg-card p-5 transition-colors hover:border-foreground/20">
      <p className="eyebrow">{metric.label}</p>
      <div>
        <p className="font-display text-4xl font-semibold leading-none tracking-tight tabular">
          {value}
        </p>
        {metric.description ? (
          <p className="mt-2 line-clamp-2 text-xs text-muted-foreground" title={metric.description}>
            {metric.description}
          </p>
        ) : null}
      </div>
    </div>
  )
}

export function RevenueCatSection({ state }: { state: SourceState<RevenueCatAnalytics> }) {
  return (
    <section className="rise rise-4 flex flex-col gap-5">
      <SectionHeading
        eyebrow="Revenus"
        title="Abonnements et revenus"
        description={
          state.status === 'ok' && state.data.updatedAt
            ? `Métriques RevenueCat, mises à jour ${formatRelative(state.data.updatedAt)}.`
            : 'Métriques RevenueCat : MRR, revenus, abonnements et essais.'
        }
        source="revenuecat"
      />
      {state.status !== 'ok' ? (
        <SourceEmpty state={state} name="RevenueCat" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {state.data.metrics.map((metric) => (
            <MetricTile key={metric.id} metric={metric} currency={state.data.currency} />
          ))}
        </div>
      )}
    </section>
  )
}
