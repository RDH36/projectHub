'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatDateTime } from '@/lib/format'
import type { Tables } from '@/lib/types/database'

type Send = Tables<'newsletter_sends'>

export function NewsletterHistory({ sends }: { sends: Send[] }) {
  if (sends.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
        Aucun envoi pour le moment
      </div>
    )
  }

  return (
    <div>
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow className="hover:bg-transparent">
            <TableHead className="eyebrow h-10">Objet</TableHead>
            <TableHead className="eyebrow h-10">Destinataires</TableHead>
            <TableHead className="eyebrow h-10">Envoyé le</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sends.map((send) => (
            <TableRow key={send.id}>
              <TableCell className="font-medium">{send.subject}</TableCell>
              <TableCell>{send.recipients_count}</TableCell>
              <TableCell className="text-muted-foreground tabular">{formatDateTime(send.sent_at)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
