'use client'

import { Tables } from '@/lib/types/database'
import { parseSurveyResponse, formatRawValue } from '@/lib/survey'
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

function ResponseBody({ response }: { response: Survey['response'] }) {
  const { items, comment, raw } = parseSurveyResponse(response)

  if (items.length > 0) {
    return (
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={item.key ?? index}>
            <p className="text-sm font-medium text-muted-foreground">
              {item.question ?? item.key ?? `Question ${index + 1}`}
            </p>
            <p className="mt-0.5 whitespace-pre-wrap text-sm">
              {item.answer ?? formatRawValue(item.value)}
            </p>
          </div>
        ))}
        {comment && (
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Commentaire
            </p>
            <p className="mt-0.5 whitespace-pre-wrap text-sm">{comment}</p>
          </div>
        )}
      </div>
    )
  }

  if (raw) {
    const entries = Object.entries(raw)
    if (entries.length === 0) {
      return <p className="text-sm text-muted-foreground">Réponse vide</p>
    }
    return (
      <div className="space-y-3">
        {entries.map(([key, value]) => (
          <div key={key}>
            <p className="text-sm font-medium text-muted-foreground">{key}</p>
            <p className="mt-0.5 whitespace-pre-wrap text-sm">
              {formatRawValue(value)}
            </p>
          </div>
        ))}
      </div>
    )
  }

  return (
    <p className="whitespace-pre-wrap text-sm">{formatRawValue(response)}</p>
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
            <ResponseBody response={survey.response} />
          </div>
          {survey.email && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Email de contact
                </p>
                <p className="mt-0.5 text-sm">{survey.email}</p>
              </div>
            </>
          )}
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
