import Link from 'next/link'
import { ArrowRight, ClipboardList } from 'lucide-react'
import { ChartCard } from '@/components/analytics/chart-card'
import { CategoryBadge } from '@/components/feedbacks/feedback-badges'
import { formatRelative } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Tables } from '@/lib/types/database'

type Feedback = Tables<'feedback'>

export function RecentFeedbacks({
  feedbacks,
  projectSlug,
  surveysInRange,
  rangeLabel,
  className,
}: {
  feedbacks: Feedback[]
  projectSlug: string
  surveysInRange: number
  rangeLabel: string
  className?: string
}) {
  return (
    <ChartCard
      title="Derniers feedbacks"
      description="Les cinq retours les plus récents"
      source="supabase"
      className={cn('rise rise-5', className)}
      contentClassName="flex flex-col gap-1"
      action={
        <Link
          href={`/dashboard/${projectSlug}/feedbacks`}
          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          Tout voir <ArrowRight className="size-3" />
        </Link>
      }
    >
      {feedbacks.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">Aucun feedback pour ce projet</p>
      ) : (
        <ul className="-mx-2 flex flex-col">
          {feedbacks.map((fb) => (
            <li key={fb.id}>
              <Link
                href={`/dashboard/${projectSlug}/feedbacks?status=${fb.status}`}
                className="flex gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-accent/60"
              >
                <span
                  aria-label={fb.status === 'pending' ? 'En attente' : 'Traité'}
                  className={cn(
                    'mt-1.5 size-2 shrink-0 rounded-full',
                    fb.status === 'pending' ? 'bg-warning' : 'bg-success'
                  )}
                />
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm leading-snug">{fb.message}</p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <CategoryBadge category={fb.category} compact />
                    <span className="truncate">{fb.email ?? 'anonyme'}</span>
                    <span className="ml-auto shrink-0 tabular">{formatRelative(fb.created_at)}</span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <Link
        href={`/dashboard/${projectSlug}/surveys`}
        className="mt-3 flex items-center gap-2 rounded-lg border border-dashed px-3 py-2 text-xs text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
      >
        <ClipboardList className="size-3.5" />
        <span>
          <span className="font-semibold tabular text-foreground">{surveysInRange}</span> réponse
          {surveysInRange > 1 ? 's' : ''} aux sondages sur les {rangeLabel.replace('derniers ', '')}
        </span>
        <ArrowRight className="ml-auto size-3" />
      </Link>
    </ChartCard>
  )
}
