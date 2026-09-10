import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCompact, formatPercent } from '@/lib/format'
import { percentChange } from '@/lib/analytics/range'

type Props = {
  label: string
  value: number
  previous?: number | null
  /** Texte discret sous la valeur (ex. « vs période précédente ») */
  hint?: string
  /** Série de 8–30 points pour la mini-courbe */
  sparkline?: number[]
  /** Une hausse est-elle une bonne nouvelle ? (défaut : oui) */
  upIsGood?: boolean
  className?: string
}

function Sparkline({ points }: { points: number[] }) {
  if (points.length < 2) return null
  const w = 72
  const h = 22
  const max = Math.max(...points, 1)
  const step = w / (points.length - 1)
  const coords = points.map((p, i) => [i * step, h - (p / max) * (h - 3) - 1] as const)
  const path = coords.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const area = `${path} L${w},${h} L0,${h} Z`
  const [lx, ly] = coords[coords.length - 1]

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width={w}
      height={h}
      aria-hidden
      className="shrink-0 overflow-visible text-chart-1"
    >
      <path d={area} fill="currentColor" opacity={0.1} />
      <path d={path} fill="none" stroke="currentColor" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={lx} cy={ly} r={3.5} fill="currentColor" stroke="var(--card)" strokeWidth={2} />
    </svg>
  )
}

export function StatTile({
  label,
  value,
  previous = null,
  hint,
  sparkline,
  upIsGood = true,
  className,
}: Props) {
  const change = percentChange(value, previous)
  const changeText = formatPercent(change)
  const direction = change === null ? 'flat' : change > 0 ? 'up' : change < 0 ? 'down' : 'flat'
  const good = direction === 'flat' ? null : (direction === 'up') === upIsGood
  const Icon = direction === 'up' ? ArrowUpRight : direction === 'down' ? ArrowDownRight : Minus

  return (
    <div
      className={cn(
        'group relative flex h-full flex-col justify-between gap-4 rounded-xl border bg-card p-5 transition-colors hover:border-foreground/20',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="eyebrow">{label}</p>
        {sparkline ? <Sparkline points={sparkline} /> : null}
      </div>
      <div className="min-w-0">
        <p className="font-display text-4xl font-semibold leading-none tracking-tight tabular">
          {formatCompact(value)}
        </p>
        <div className="mt-2 flex h-5 min-w-0 items-center gap-1.5 whitespace-nowrap text-xs">
          {changeText ? (
            <span
              className={cn(
                'inline-flex shrink-0 items-center gap-0.5 whitespace-nowrap rounded-md px-1.5 py-0.5 font-medium tabular',
                good === true && 'bg-success/12 text-success',
                good === false && 'bg-destructive/10 text-destructive',
                good === null && 'bg-muted text-muted-foreground'
              )}
            >
              <Icon className="size-3" />
              {changeText}
            </span>
          ) : null}
          {hint ? <span className="truncate text-muted-foreground" title={hint}>{hint}</span> : null}
        </div>
      </div>
    </div>
  )
}
