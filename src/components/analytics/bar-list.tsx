import { cn } from '@/lib/utils'
import { formatNumber } from '@/lib/format'
import type { RankedItem } from '@/lib/analytics/types'

type Props = {
  items: RankedItem[]
  /** Libellé de l'unité pour l'accessibilité (ex. « vues ») */
  unit?: string
  emptyText?: string
  className?: string
}

/**
 * Classement horizontal : libellé + valeur, barre fine dessous.
 * Rendu côté serveur, sans dépendance graphique.
 */
export function BarList({ items, unit = '', emptyText = 'Aucune donnée', className }: Props) {
  if (items.length === 0) {
    return <p className="py-6 text-center text-sm text-muted-foreground">{emptyText}</p>
  }
  const max = Math.max(...items.map((i) => i.value), 1)

  return (
    <ol className={cn('flex flex-col gap-3', className)}>
      {items.map((item, index) => {
        const width = Math.max((item.value / max) * 100, 1.5)
        return (
          <li key={`${item.label}-${index}`} className="group">
            <div className="flex items-baseline justify-between gap-4 text-sm">
              <span className="min-w-0 truncate" title={item.label}>
                {item.label}
              </span>
              <span className="shrink-0 font-medium tabular text-foreground/80">
                {formatNumber(item.value)}
                {unit ? <span className="sr-only"> {unit}</span> : null}
              </span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-chart-1 transition-[width] duration-500 ease-out"
                style={{ width: `${width}%` }}
              />
            </div>
          </li>
        )
      })}
    </ol>
  )
}
