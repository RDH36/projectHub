import { ChartCard } from '@/components/analytics/chart-card'
import { TrendChart } from '@/components/analytics/trend-chart'
import { SourceEmpty } from '@/components/analytics/source-empty'
import type { PosthogAnalytics, SourceState, VercelAnalytics } from '@/lib/analytics/types'

export function TrafficPanel({
  posthog,
  vercel,
}: {
  posthog: SourceState<PosthogAnalytics>
  vercel: SourceState<VercelAnalytics>
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <ChartCard
        title={posthog.status === 'ok' && posthog.data.kind === 'web' ? 'Visiteurs par jour' : 'Utilisateurs actifs par jour'}
        description="Personnes uniques ayant utilisé le produit, et nouvelles parmi elles"
        source="posthog"
        className="rise rise-3"
      >
        {posthog.status === 'ok' ? (
          <TrendChart
            data={posthog.data.daily}
            series={[
              { key: 'users', label: 'Actifs' },
              { key: 'newUsers', label: 'Nouveaux' },
            ]}
          />
        ) : (
          <SourceEmpty state={posthog} name="PostHog" className="py-8" />
        )}
      </ChartCard>

      <ChartCard
        title="Trafic du site"
        description={
          vercel.status === 'ok' && vercel.data.truncated
            ? `Production · limité aux ${vercel.data.coveredDays} derniers jours (fenêtre du plan Vercel)`
            : 'Visiteurs uniques et pages vues sur le déploiement de production'
        }
        source="vercel"
        className="rise rise-4"
      >
        {vercel.status === 'ok' ? (
          <TrendChart
            data={vercel.data.daily}
            series={[
              { key: 'visitors', label: 'Visiteurs' },
              { key: 'pageviews', label: 'Pages vues' },
            ]}
          />
        ) : (
          <SourceEmpty state={vercel} name="Vercel" className="py-8" />
        )}
      </ChartCard>
    </div>
  )
}
