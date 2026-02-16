'use client'

import { useAction } from 'next-safe-action/hooks'
import { Tables } from '@/lib/types/database'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { updateFeedbackStatus, updateFeedbackCategory } from '@/actions/feedback.actions'

type Feedback = Tables<'feedback'>

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

export function FeedbackDetail({
  feedback,
  open,
  onOpenChange,
  projectSlug,
}: {
  feedback: Feedback | null
  open: boolean
  onOpenChange: (open: boolean) => void
  projectSlug: string
}) {
  const statusAction = useAction(updateFeedbackStatus, {
    onSuccess: () => toast.success('Statut mis à jour'),
    onError: () => toast.error('Erreur lors de la mise à jour du statut'),
  })

  const categoryAction = useAction(updateFeedbackCategory, {
    onSuccess: () => toast.success('Catégorie mise à jour'),
    onError: () => toast.error('Erreur lors de la mise à jour de la catégorie'),
  })

  if (!feedback) return null

  const newStatus = feedback.status === 'pending' ? 'treated' : 'pending'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Détail du feedback</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Message</p>
            <p className="mt-1 whitespace-pre-wrap">{feedback.message}</p>
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-muted-foreground">Email</p>
              <p>{feedback.email || '—'}</p>
            </div>
            <div>
              <p className="font-medium text-muted-foreground">Version</p>
              <p>{feedback.app_version}</p>
            </div>
            <div>
              <p className="font-medium text-muted-foreground">Plateforme</p>
              <p>{feedback.device_platform || '—'}</p>
            </div>
            <div>
              <p className="font-medium text-muted-foreground">Date</p>
              <p>{formatDateTime(feedback.created_at)}</p>
            </div>
          </div>
          <Separator />
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="mb-1.5 text-sm font-medium text-muted-foreground">Catégorie</p>
              <Select
                value={feedback.category || ''}
                onValueChange={(value) =>
                  categoryAction.execute({
                    feedbackId: feedback.id,
                    category: value as 'bug' | 'feature' | 'question' | 'other',
                    projectSlug,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Non catégorisé" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bug">Bug</SelectItem>
                  <SelectItem value="feature">Feature</SelectItem>
                  <SelectItem value="question">Question</SelectItem>
                  <SelectItem value="other">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <p className="mb-1.5 text-sm font-medium text-muted-foreground">Statut</p>
              <Badge
                className={
                  feedback.status === 'treated'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                    : 'border-yellow-500 text-yellow-600'
                }
                variant={feedback.status === 'pending' ? 'outline' : 'default'}
              >
                {feedback.status === 'treated' ? 'Traité' : 'En attente'}
              </Badge>
            </div>
          </div>
          <Button
            className="w-full"
            variant={newStatus === 'treated' ? 'default' : 'outline'}
            disabled={statusAction.isPending}
            onClick={() =>
              statusAction.execute({
                feedbackId: feedback.id,
                status: newStatus,
                projectSlug,
              })
            }
          >
            {statusAction.isPending
              ? 'Mise à jour...'
              : newStatus === 'treated'
                ? 'Marquer comme traité'
                : 'Marquer en attente'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
