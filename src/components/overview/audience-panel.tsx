import Link from 'next/link'
import { ArrowRight, Send } from 'lucide-react'
import { ChartCard } from '@/components/analytics/chart-card'
import { TrendChart } from '@/components/analytics/trend-chart'
import { eachDay } from '@/lib/analytics/range'
import type { AnalyticsRange } from '@/lib/analytics/types'
import { formatDate, formatNumber } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Tables } from '@/lib/types/database'

type Send = Tables<'newsletter_sends'>

/** Cumul des abonnés jour par jour sur la période (les inscrits avant comptent dans la base). */
function cumulative(dates: string[], range: AnalyticsRange) {
  const sorted = [...dates].sort()
  const days = eachDay(range)
  let index = 0
  let total = 0
  const sinceIso = `${range.since}T00:00:00Z`
  while (index < sorted.length && sorted[index] < sinceIso) {
    total += 1
    index += 1
  }
  return days.map((date) => {
    const endOfDay = `${date}T23:59:59.999Z`
    while (index < sorted.length && sorted[index] <= endOfDay) {
      total += 1
      index += 1
    }
    return { date, total }
  })
}

export function AudiencePanel({
  subscriberDates,
  sends,
  range,
  projectSlug,
  className,
}: {
  subscriberDates: string[]
  sends: Send[]
  range: AnalyticsRange
  projectSlug: string
  className?: string
}) {
  const data = cumulative(subscriberDates, range)

  return (
    <ChartCard
      title="Audience newsletter"
      description="Évolution du nombre d’abonnés et derniers envois"
      source="supabase"
      className={cn('rise rise-5', className)}
      action={
        <Link
          href={`/dashboard/${projectSlug}/newsletter`}
          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          Envoyer <ArrowRight className="size-3" />
        </Link>
      }
    >
      <TrendChart data={data} series={[{ key: 'total', label: 'Abonnés', color: 'var(--chart-3)' }]} />
      <div className="mt-4 border-t pt-4">
        <p className="eyebrow mb-2">Derniers envois</p>
        {sends.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucune newsletter envoyée pour le moment.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {sends.map((send) => (
              <li key={send.id} className="flex items-center gap-3 text-sm">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
                  <Send className="size-3.5" />
                </span>
                <span className="min-w-0 flex-1 truncate">{send.subject}</span>
                <span className="shrink-0 text-xs text-muted-foreground tabular">
                  {formatNumber(send.recipients_count)} dest. · {formatDate(send.sent_at)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </ChartCard>
  )
}
