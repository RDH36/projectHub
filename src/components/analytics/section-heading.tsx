import { SourcePill, type Source } from '@/components/analytics/chart-card'

export function SectionHeading({
  eyebrow,
  title,
  description,
  source,
}: {
  eyebrow: string
  title: string
  description?: string
  source: Source
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 border-b pb-3">
      <div>
        <p className="eyebrow mb-1">{eyebrow}</p>
        <h2 className="font-display text-2xl font-semibold leading-none tracking-tight">{title}</h2>
        {description ? <p className="mt-1.5 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      <SourcePill source={source} />
    </div>
  )
}
