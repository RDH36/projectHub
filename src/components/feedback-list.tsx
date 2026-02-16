'use client'

import { useState } from 'react'
import { Tables } from '@/lib/types/database'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { FeedbackDetail } from '@/components/feedback-detail'

type Feedback = Tables<'feedback'>

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'treated') {
    return <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">Traité</Badge>
  }
  return <Badge variant="outline" className="border-yellow-500 text-yellow-600">En attente</Badge>
}

function CategoryBadge({ category }: { category: string | null }) {
  if (!category) return null
  const styles: Record<string, string> = {
    bug: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    feature: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    question: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    other: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  }
  const labels: Record<string, string> = {
    bug: 'Bug',
    feature: 'Feature',
    question: 'Question',
    other: 'Autre',
  }
  return <Badge className={styles[category] || styles.other}>{labels[category] || category}</Badge>
}

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
      <div className="flex items-center justify-center rounded-lg border border-dashed p-12">
        <p className="text-muted-foreground">Aucun feedback pour ce projet</p>
      </div>
    )
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40%]">Message</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Catégorie</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {feedbacks.map((fb) => (
            <TableRow
              key={fb.id}
              className="cursor-pointer"
              onClick={() => setSelected(fb)}
            >
              <TableCell className="font-medium">
                {fb.message.length > 80 ? `${fb.message.slice(0, 80)}…` : fb.message}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {fb.email || '—'}
              </TableCell>
              <TableCell>
                <CategoryBadge category={fb.category} />
              </TableCell>
              <TableCell>
                <StatusBadge status={fb.status} />
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDate(fb.created_at)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <FeedbackDetail
        feedback={selected}
        open={!!selected}
        onOpenChange={(open) => { if (!open) setSelected(null) }}
        projectSlug={projectSlug}
      />
    </>
  )
}
