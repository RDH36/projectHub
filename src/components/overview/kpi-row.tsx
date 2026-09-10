import { PlugZap } from 'lucide-react'
import { StatTile } from '@/components/analytics/stat-tile'
import type { PosthogAnalytics, SourceState, VercelAnalytics } from '@/lib/analytics/types'

function ConnectTile({ label, name, reason }: { label: string; name: string; reason: string }) {
  return (
    <div className="flex flex-col justify-between gap-4 rounded-xl border border-dashed p-5">
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

type Props = {
  posthog: SourceState<PosthogAnalytics>
  vercel: SourceState<VercelAnalytics>
  pendingFeedbacks: number
  totalFeedbacks: number
  subscribers: number
  newSubscribers: number
  prevNewSubscribers: number
}

export function KpiRow({
  posthog,
  vercel,
  pendingFeedbacks,
  totalFeedbacks,
  subscribers,
  newSubscribers,
  prevNewSubscribers,
}: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
              : 'aucun nouvel abonné sur la période'
          }
        />
      </div>
    </div>
  )
}
