import Link from 'next/link'
import { cn } from '@/lib/utils'
import { RANGE_KEYS } from '@/lib/analytics/range'
import type { RangeKey } from '@/lib/analytics/types'

const LABELS: Record<RangeKey, string> = { '7d': '7 j', '30d': '30 j', '90d': '90 j' }

/** Sélecteur de période piloté par l'URL (`?range=`). */
export function RangePicker({ current, basePath }: { current: RangeKey; basePath: string }) {
  return (
    <nav
      aria-label="Période"
      className="inline-flex items-center rounded-lg border bg-card p-0.5 text-sm"
    >
      {RANGE_KEYS.map((key) => {
        const active = key === current
        return (
          <Link
            key={key}
            href={key === '30d' ? basePath : `${basePath}?range=${key}`}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'rounded-md px-3 py-1 font-medium tabular transition-colors',
              active
                ? 'bg-foreground text-background'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            )}
          >
            {LABELS[key]}
          </Link>
        )
      })}
    </nav>
  )
}
