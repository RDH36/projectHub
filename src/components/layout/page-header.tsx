import { cn } from '@/lib/utils'

type Props = {
  /** Petit libellé technique au-dessus du titre */
  eyebrow?: string
  title: string
  description?: string
  /** Contrôles alignés à droite (filtres, période, boutons) */
  actions?: React.ReactNode
  /** Ligne de chiffres-clés sous le titre */
  stats?: React.ReactNode
  className?: string
}

export function PageHeader({ eyebrow, title, description, actions, stats, className }: Props) {
  return (
    <div className={cn('rise flex flex-col gap-4', className)}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          {eyebrow ? <p className="eyebrow mb-1.5">{eyebrow}</p> : null}
          <h1 className="font-display text-3xl font-semibold leading-none tracking-tight sm:text-4xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-2 max-w-prose text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
      </div>
      {stats ? <div className="flex flex-wrap items-center gap-2">{stats}</div> : null}
    </div>
  )
}

/** Puce chiffrée pour la ligne `stats` du PageHeader. */
export function StatChip({
  value,
  label,
  tone = 'neutral',
}: {
  value: number | string
  label: string
  tone?: 'neutral' | 'warning' | 'success' | 'primary'
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs',
        tone === 'warning' && 'border-warning/50 bg-warning/10',
        tone === 'success' && 'border-success/40 bg-success/10',
        tone === 'primary' && 'border-primary/40 bg-primary/10'
      )}
    >
      <span className="font-semibold tabular">{value}</span>
      <span className="text-muted-foreground">{label}</span>
    </span>
  )
}
