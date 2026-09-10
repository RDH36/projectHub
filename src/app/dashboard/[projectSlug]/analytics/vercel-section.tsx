import { SectionHeading } from '@/components/analytics/section-heading'
import { StatTile } from '@/components/analytics/stat-tile'
import { ChartCard } from '@/components/analytics/chart-card'
import { TrendChart } from '@/components/analytics/trend-chart'
import { BarList } from '@/components/analytics/bar-list'
import { SourceEmpty } from '@/components/analytics/source-empty'
import type { SourceState, VercelAnalytics } from '@/lib/analytics/types'

export function VercelSection({ state }: { state: SourceState<VercelAnalytics> }) {
  return (
    <section className="rise rise-3 flex flex-col gap-5">
      <SectionHeading
        eyebrow="Web"
        title="Trafic du site"
        description="Web Analytics Vercel du déploiement de production."
        source="vercel"
      />
      {state.status !== 'ok' ? <SourceEmpty state={state} name="Vercel" /> : <Body data={state.data} />}
    </section>
  )
}

function Body({ data }: { data: VercelAnalytics }) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <StatTile
          label="Visiteurs uniques"
          value={data.visitors.value}
          previous={data.visitors.previous}
          hint={data.visitors.previous === null ? 'comparaison indisponible sur cette période' : undefined}
          sparkline={data.daily.map((d) => d.visitors)}
        />
        <StatTile
          label="Pages vues"
          value={data.pageviews.value}
          previous={data.pageviews.previous}
          sparkline={data.daily.map((d) => d.pageviews)}
        />
      </div>

      <ChartCard
        title="Trafic par jour"
        description={
          data.truncated
            ? `Visiteurs uniques et pages vues · limité aux ${data.coveredDays} derniers jours (fenêtre du plan Vercel)`
            : 'Visiteurs uniques et pages vues'
        }
        source="vercel"
      >
        <TrendChart
          data={data.daily}
          series={[
            { key: 'visitors', label: 'Visiteurs' },
            { key: 'pageviews', label: 'Pages vues' },
          ]}
          className="aspect-[16/5] w-full"
        />
      </ChartCard>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ChartCard title="Pages" description="Pages vues">
          <BarList items={data.topPaths} unit="vues" />
        </ChartCard>
        <ChartCard title="Sources" description="Visiteurs par site référent">
          <BarList items={data.referrers} unit="visiteurs" emptyText="Aucun référent" />
        </ChartCard>
        <ChartCard title="Pays" description="Visiteurs uniques">
          <BarList items={data.countries} unit="visiteurs" />
        </ChartCard>
        <ChartCard title="Appareils" description="Visiteurs uniques">
          <BarList items={data.devices} unit="visiteurs" />
        </ChartCard>
      </div>
    </>
  )
}
