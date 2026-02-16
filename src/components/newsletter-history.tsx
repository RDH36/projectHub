'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Tables } from '@/lib/types/database'

type Send = Tables<'newsletter_sends'>

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—'
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr))
}

export function NewsletterHistory({ sends }: { sends: Send[] }) {
  if (sends.length === 0) {
    return (
      <div className="mt-4 flex h-40 items-center justify-center rounded-md border text-sm text-muted-foreground">
        Aucun envoi pour le moment
      </div>
    )
  }

  return (
    <div className="mt-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Objet</TableHead>
            <TableHead>Destinataires</TableHead>
            <TableHead>Envoyé le</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sends.map((send) => (
            <TableRow key={send.id}>
              <TableCell className="font-medium">{send.subject}</TableCell>
              <TableCell>{send.recipients_count}</TableCell>
              <TableCell>{formatDate(send.sent_at)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
