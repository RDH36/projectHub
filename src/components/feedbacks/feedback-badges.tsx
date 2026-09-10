import { cn } from '@/lib/utils'

const CATEGORY: Record<string, { label: string; className: string }> = {
  bug: { label: 'Bug', className: 'bg-destructive/10 text-destructive' },
  feature: { label: 'Feature', className: 'bg-chart-2/12 text-chart-2' },
  question: { label: 'Question', className: 'bg-chart-4/12 text-chart-4' },
  other: { label: 'Autre', className: 'bg-muted text-muted-foreground' },
}

export function CategoryBadge({
  category,
  compact = false,
}: {
  category: string | null
  compact?: boolean
}) {
  if (!category) return null
  const meta = CATEGORY[category] ?? { label: category, className: CATEGORY.other.className }
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-md font-medium',
        compact ? 'px-1.5 py-px text-[0.6875rem]' : 'px-2 py-0.5 text-xs',
        meta.className
      )}
    >
      {meta.label}
    </span>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const treated = status === 'treated'
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium',
        treated ? 'border-success/40 bg-success/10 text-success' : 'border-warning/50 bg-warning/10 text-warning-foreground dark:text-warning'
      )}
    >
      <span className={cn('size-1.5 rounded-full', treated ? 'bg-success' : 'bg-warning')} />
      {treated ? 'Traité' : 'En attente'}
    </span>
  )
}
