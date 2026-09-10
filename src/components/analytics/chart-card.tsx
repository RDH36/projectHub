import { cn } from '@/lib/utils'

export type Source = 'posthog' | 'vercel' | 'supabase'

const SOURCE_LABEL: Record<Source, string> = {
  posthog: 'PostHog',
  vercel: 'Vercel',
  supabase: 'Supabase',
}

export function SourcePill({ source }: { source: Source }) {
  return (
    <span className="eyebrow inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[0.625rem]">
      <span
        className={cn(
          'size-1.5 rounded-full',
          source === 'posthog' && 'bg-chart-6',
          source === 'vercel' && 'bg-foreground',
          source === 'supabase' && 'bg-chart-3'
        )}
      />
      {SOURCE_LABEL[source]}
    </span>
  )
}

type Props = {
  title: string
  description?: string
  source?: Source
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
  contentClassName?: string
}

export function ChartCard({
  title,
  description,
  source,
  action,
  children,
  className,
  contentClassName,
}: Props) {
  return (
    <section
      className={cn('flex flex-col rounded-xl border bg-card', className)}
      aria-label={title}
    >
      <header className="flex items-start justify-between gap-3 px-5 pt-5 pb-3">
        <div className="min-w-0">
          <h3 className="font-display text-base font-semibold leading-tight">{title}</h3>
          {description ? (
            <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {action}
          {source ? <SourcePill source={source} /> : null}
        </div>
      </header>
      <div className={cn('flex-1 px-5 pb-5', contentClassName)}>{children}</div>
    </section>
  )
}
