'use client'

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { formatCompact, formatLongDay, formatShortDay } from '@/lib/format'

export type TrendSeries = { key: string; label: string; color?: string }

type Props = {
  data: Array<Record<string, number | string>>
  series: TrendSeries[]
  xKey?: string
  className?: string
}

const DEFAULT_COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)']

/**
 * Courbe(s) journalière(s) : ligne 2px, lavis 10 %, grille horizontale
 * hairline, tooltip croisé. Légende uniquement à partir de 2 séries.
 */
export function TrendChart({ data, series, xKey = 'date', className }: Props) {
  const config = Object.fromEntries(
    series.map((s, i) => [s.key, { label: s.label, color: s.color ?? DEFAULT_COLORS[i] }])
  ) satisfies ChartConfig

  const empty = data.every((row) => series.every((s) => !Number(row[s.key])))

  return (
    <div className="relative">
      <ChartContainer config={config} className={className ?? 'aspect-[16/6] w-full'}>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            {series.map((s) => (
              <linearGradient key={s.key} id={`fill-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={`var(--color-${s.key})`} stopOpacity={0.14} />
                <stop offset="100%" stopColor={`var(--color-${s.key})`} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid vertical={false} stroke="var(--border)" strokeWidth={1} />
          <XAxis
            dataKey={xKey}
            tickLine={false}
            axisLine={false}
            minTickGap={28}
            tickMargin={8}
            tickFormatter={(v) => formatShortDay(String(v))}
            className="text-[11px]"
          />
          <YAxis
            width={36}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
            tickFormatter={(v) => formatCompact(Number(v))}
            className="text-[11px]"
          />
          <ChartTooltip
            cursor={{ stroke: 'var(--muted-foreground)', strokeWidth: 1, strokeOpacity: 0.4 }}
            content={
              <ChartTooltipContent
                labelFormatter={(v) => formatLongDay(String(v))}
                indicator="line"
              />
            }
          />
          {series.length > 1 ? <ChartLegend content={<ChartLegendContent />} /> : null}
          {series.map((s) => (
            <Area
              key={s.key}
              dataKey={s.key}
              type="monotone"
              stroke={`var(--color-${s.key})`}
              strokeWidth={2}
              fill={`url(#fill-${s.key})`}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, stroke: 'var(--card)' }}
              isAnimationActive={false}
            />
          ))}
        </AreaChart>
      </ChartContainer>
      {empty ? (
        <p className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
          Aucune donnée sur la période
        </p>
      ) : null}
    </div>
  )
}
