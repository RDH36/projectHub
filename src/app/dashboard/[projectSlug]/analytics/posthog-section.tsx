import { SectionHeading } from '@/components/analytics/section-heading'
import { StatTile } from '@/components/analytics/stat-tile'
import { ChartCard } from '@/components/analytics/chart-card'
import { TrendChart } from '@/components/analytics/trend-chart'
import { BarList } from '@/components/analytics/bar-list'
import { SourceEmpty } from '@/components/analytics/source-empty'
import type { PosthogAnalytics, SourceState } from '@/lib/analytics/types'

export function PosthogSection({ state }: { state: SourceState<PosthogAnalytics> }) {
  return (
    <section className="rise rise-2 flex flex-col gap-5">
      <SectionHeading
        eyebrow="Produit"
        title="Usage de l’application"
        description="Utilisateurs, sessions et événements capturés par le SDK PostHog."
        source="posthog"
      />
      {state.status !== 'ok' ? <SourceEmpty state={state} name="PostHog" /> : <Body data={state.data} />}
    </section>
  )
}

function Body({ data }: { data: PosthogAnalytics }) {
  const isApp = data.kind === 'app'
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label={isApp ? 'Utilisateurs actifs' : 'Visiteurs'}
          value={data.activeUsers.value}
          previous={data.activeUsers.previous}
          sparkline={data.daily.map((d) => d.users)}
        />
        <StatTile
          label={isApp ? 'Nouveaux utilisateurs' : 'Nouveaux visiteurs'}
          value={data.newUsers.value}
          previous={data.newUsers.previous}
          sparkline={data.daily.map((d) => d.newUsers)}
        />
        <StatTile
          label="Sessions"
          value={data.sessions.value}
          previous={data.sessions.previous}
          sparkline={data.daily.map((d) => d.sessions)}
        />
        <StatTile label="Événements" value={data.events.value} previous={data.events.previous} />
      </div>

      <ChartCard
        title={isApp ? 'Utilisateurs actifs par jour' : 'Visiteurs par jour'}
        description="Personnes uniques par jour ; « nouveaux » = première apparition ce jour-là"
        source="posthog"
      >
        <TrendChart
          data={data.daily}
          series={[
            { key: 'users', label: 'Actifs' },
            { key: 'newUsers', label: 'Nouveaux' },
          ]}
          className="aspect-[16/5] w-full"
        />
      </ChartCard>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ChartCard title="Événements" description="Actions métier les plus fréquentes">
          <BarList items={data.topEvents} unit="événements" />
        </ChartCard>
        <ChartCard title={isApp ? 'Écrans' : 'Pages'} description="Les plus consultés">
          <BarList items={data.topScreens} unit="vues" />
        </ChartCard>
        <ChartCard title="Pays" description="Utilisateurs uniques">
          <BarList items={data.countries} unit="utilisateurs" />
        </ChartCard>
        <ChartCard title={isApp ? 'Versions' : 'Navigateurs'} description="Utilisateurs uniques">
          <BarList items={data.versions} unit="utilisateurs" />
        </ChartCard>
      </div>
    </>
  )
}
