import { PlugZap } from 'lucide-react'
import { StatTile } from '@/components/analytics/stat-tile'
import { formatMoney } from '@/lib/format'
import type {
  PosthogAnalytics,
  RevenueCatAnalytics,
  SourceState,
  VercelAnalytics,
} from '@/lib/analytics/types'

function ConnectTile({ label, name, reason }: { label: string; name: string; reason: string }) {
  return (
    <div className="flex h-full flex-col justify-between gap-4 rounded-xl border border-dashed p-5">
      <p className="eyebrow">{label}</p>
      <div className="flex items-start gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
          <PlugZap className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium">{name} non connecté</p>
          <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground" title={reason}>
            {reason}
          </p>
        </div>
      </div>
    </div>
  )
}

/** Tuile MRR : n'apparaît que si RevenueCat est branché (sinon la ligne garde 4 tuiles). */
function MrrTile({ data }: { data: RevenueCatAnalytics }) {
  const mrr = data.metrics.find((m) => m.id === 'mrr')
  const subs = data.metrics.find((m) => m.id === 'active_subscriptions')
  if (!mrr) return null
  return (
    <div className="flex h-full flex-col justify-between gap-4 rounded-xl border bg-card p-5 transition-colors hover:border-foreground/20">
      <p className="eyebrow">MRR</p>
      <div className="min-w-0">
        <p className="font-display text-4xl font-semibold leading-none tracking-tight tabular">
          {formatMoney(mrr.value, data.currency)}
        </p>
        <p className="mt-2 flex h-5 items-center truncate text-xs text-muted-foreground">
          {subs ? `${subs.value} abonnement${subs.value > 1 ? 's' : ''} actif${subs.value > 1 ? 's' : ''}` : 'revenu mensuel récurrent'}
        </p>
      </div>
    </div>
  )
}

type Props = {
  posthog: SourceState<PosthogAnalytics>
  vercel: SourceState<VercelAnalytics>
  revenuecat: SourceState<RevenueCatAnalytics>
  pendingFeedbacks: number
  totalFeedbacks: number
  subscribers: number
  newSubscribers: number
  prevNewSubscribers: number
}

export function KpiRow({
  posthog,
  vercel,
  revenuecat,
  pendingFeedbacks,
  totalFeedbacks,
  subscribers,
  newSubscribers,
  prevNewSubscribers,
}: Props) {
  const showMrr = revenuecat.status === 'ok' && revenuecat.data.metrics.some((m) => m.id === 'mrr')
  return (
    <div className={showMrr ? 'grid gap-4 sm:grid-cols-2 xl:grid-cols-5' : 'grid gap-4 sm:grid-cols-2 xl:grid-cols-4'}>
      {showMrr && revenuecat.status === 'ok' ? (
        <div className="rise rise-1">
          <MrrTile data={revenuecat.data} />
        </div>
      ) : null}
      <div className="rise rise-1">
        {posthog.status === 'ok' ? (
          <StatTile
            label="Utilisateurs actifs"
            value={posthog.data.activeUsers.value}
            previous={posthog.data.activeUsers.previous}
            hint="vs période précédente"
            sparkline={posthog.data.daily.map((d) => d.users)}
          />
        ) : (
          <ConnectTile
            label="Utilisateurs actifs"
            name="PostHog"
            reason={posthog.status === 'error' ? posthog.message : posthog.reason}
          />
        )}
      </div>
      <div className="rise rise-2">
        {vercel.status === 'ok' ? (
          <StatTile
            label="Visiteurs du site"
            value={vercel.data.visitors.value}
            previous={vercel.data.visitors.previous}
            hint={
              vercel.data.visitors.previous === null
                ? `sur ${vercel.data.coveredDays} jours`
                : 'vs période précédente'
            }
            sparkline={vercel.data.daily.map((d) => d.visitors)}
          />
        ) : (
          <ConnectTile
            label="Visiteurs du site"
            name="Vercel"
            reason={vercel.status === 'error' ? vercel.message : vercel.reason}
          />
        )}
      </div>
      <div className="rise rise-3">
        <StatTile
          label="Feedbacks en attente"
          value={pendingFeedbacks}
          hint={`${totalFeedbacks} au total`}
          upIsGood={false}
        />
      </div>
      <div className="rise rise-4">
        <StatTile
          label="Abonnés newsletter"
          value={subscribers}
          previous={null}
          hint={
            newSubscribers > 0
              ? `+${newSubscribers} sur la période (${prevNewSubscribers} avant)`
              : 'aucun nouvel abonné'
          }
        />
      </div>
    </div>
  )
}
