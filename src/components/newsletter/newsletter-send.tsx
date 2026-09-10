'use client'

import { useState } from 'react'
import { useAction } from 'next-safe-action/hooks'
import { toast } from 'sonner'
import { Loader2, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { sendNewsletter } from '@/actions/newsletter.actions'

export function NewsletterSend({
  projectSlug,
  recipientCount,
  subject,
  html,
  selectedEmails,
}: {
  projectSlug: string
  recipientCount: number
  subject: string
  html: string
  selectedEmails?: string[]
}) {
  const [open, setOpen] = useState(false)

  const { execute, isPending } = useAction(sendNewsletter, {
    onSuccess: ({ data }) => {
      toast.success(`Newsletter envoyée à ${data?.count ?? recipientCount} abonné(s)`)
      setOpen(false)
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Erreur lors de l'envoi")
    },
  })

  const disabled = !subject || !html || recipientCount === 0

  const label = selectedEmails
    ? `Envoyer à ${recipientCount} abonné(s) sélectionné(s)`
    : `Envoyer à tous (${recipientCount})`

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button disabled={disabled || isPending}>
          {isPending ? <Loader2 className="animate-spin" /> : <Send />}
          {label}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmer l&apos;envoi</AlertDialogTitle>
          <AlertDialogDescription>
            {selectedEmails
              ? `Êtes-vous sûr de vouloir envoyer cette newsletter à ${recipientCount} abonné(s) sélectionné(s) ?`
              : `Êtes-vous sûr de vouloir envoyer cette newsletter à tous les ${recipientCount} abonné(s) ?`}{' '}
            Cette action est irréversible.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={() =>
              execute({ projectSlug, subject, html, selectedEmails })
            }
            disabled={isPending}
          >
            {isPending ? 'Envoi en cours...' : "Confirmer l'envoi"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
