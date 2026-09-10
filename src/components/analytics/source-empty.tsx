import { AlertTriangle, PlugZap } from 'lucide-react'
import type { SourceState } from '@/lib/analytics/types'
import { cn } from '@/lib/utils'

type Props = {
  state: Exclude<SourceState<unknown>, { status: 'ok' }>
  /** Nom lisible de la source (PostHog, Vercel) */
  name: string
  className?: string
}

/** État « non configuré » ou « erreur » d'une source d'analytics. */
export function SourceEmpty({ state, name, className }: Props) {
  const isError = state.status === 'error'
  const Icon = isError ? AlertTriangle : PlugZap

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-6 py-10 text-center',
        isError ? 'border-destructive/40' : 'border-border',
        className
      )}
    >
      <span
        className={cn(
          'flex size-10 items-center justify-center rounded-full',
          isError ? 'bg-destructive/10 text-destructive' : 'bg-accent text-accent-foreground'
        )}
      >
        <Icon className="size-5" />
      </span>
      <div className="max-w-md">
        <p className="font-display text-base font-semibold">
          {isError ? `${name} : erreur de chargement` : `${name} n’est pas connecté`}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {isError ? state.message : state.reason}
        </p>
      </div>
    </div>
  )
}
