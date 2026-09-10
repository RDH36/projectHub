'use client'

import { useState } from 'react'
import { Inbox } from 'lucide-react'
import { Tables } from '@/lib/types/database'
import { formatDate } from '@/lib/format'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { FeedbackDetail } from '@/components/feedbacks/feedback-detail'
import { CategoryBadge, StatusBadge } from '@/components/feedbacks/feedback-badges'

type Feedback = Tables<'feedback'>

export function FeedbackList({
  feedbacks,
  projectSlug,
}: {
  feedbacks: Feedback[]
  projectSlug: string
}) {
  const [selected, setSelected] = useState<Feedback | null>(null)

  if (feedbacks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 p-14 text-center">
        <Inbox className="size-6 text-muted-foreground/60" />
        <p className="text-sm text-muted-foreground">Aucun feedback ne correspond à ces filtres.</p>
      </div>
    )
  }

  return (
    <>
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow className="hover:bg-transparent">
            <TableHead className="eyebrow h-10 w-[46%]">Message</TableHead>
            <TableHead className="eyebrow h-10">Email</TableHead>
            <TableHead className="eyebrow h-10">Catégorie</TableHead>
            <TableHead className="eyebrow h-10">Statut</TableHead>
            <TableHead className="eyebrow h-10 text-right">Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {feedbacks.map((fb) => (
            <TableRow
              key={fb.id}
              className="cursor-pointer"
              onClick={() => setSelected(fb)}
            >
              <TableCell className="py-3">
                <p className="line-clamp-2 whitespace-normal leading-snug">{fb.message}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  v{fb.app_version}
                  {fb.device_platform ? ` · ${fb.device_platform}` : ''}
                </p>
              </TableCell>
              <TableCell className="text-muted-foreground">{fb.email || '—'}</TableCell>
              <TableCell>
                <CategoryBadge category={fb.category} />
              </TableCell>
              <TableCell>
                <StatusBadge status={fb.status} />
              </TableCell>
              <TableCell className="text-right text-muted-foreground tabular">
                {formatDate(fb.created_at)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <FeedbackDetail
        feedback={selected}
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null)
        }}
        projectSlug={projectSlug}
      />
    </>
  )
}
