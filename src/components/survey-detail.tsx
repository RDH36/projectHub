'use client'

import { Tables, Json } from '@/lib/types/database'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type Survey = Tables<'feature_surveys'>

function formatDateTime(dateStr: string | null) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatValue(value: Json): string {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'boolean') return value ? 'Oui' : 'Non'
  if (Array.isArray(value)) return value.map((v) => formatValue(v)).join(', ')
  if (typeof value === 'object') return JSON.stringify(value, null, 2)
  return String(value)
}

function ResponseEntries({ response }: { response: Json }) {
  if (
    response === null ||
    typeof response !== 'object' ||
    Array.isArray(response)
  ) {
    return <p className="whitespace-pre-wrap text-sm">{formatValue(response)}</p>
  }

  const entries = Object.entries(response)
  if (entries.length === 0) {
    return <p className="text-sm text-muted-foreground">Réponse vide</p>
  }

  return (
    <div className="space-y-3">
      {entries.map(([key, value]) => (
        <div key={key}>
          <p className="text-sm font-medium text-muted-foreground">{key}</p>
          <p className="mt-0.5 whitespace-pre-wrap text-sm">
            {formatValue(value ?? null)}
          </p>
        </div>
      ))}
    </div>
  )
}

export function SurveyDetail({
  survey,
  open,
  onOpenChange,
}: {
  survey: Survey | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (!survey) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Détail du sondage
            <Badge variant="secondary" className="font-mono text-xs">
              {survey.survey_key}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-sm font-medium text-muted-foreground">
              Réponse
            </p>
            <ResponseEntries response={survey.response} />
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-muted-foreground">Plateforme</p>
              <p>{survey.device_platform || '—'}</p>
            </div>
            <div>
              <p className="font-medium text-muted-foreground">Version</p>
              <p>{survey.app_version || '—'}</p>
            </div>
            <div>
              <p className="font-medium text-muted-foreground">Devise</p>
              <p>{survey.currency || '—'}</p>
            </div>
            <div>
              <p className="font-medium text-muted-foreground">Date</p>
              <p>{formatDateTime(survey.created_at)}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
