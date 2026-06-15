'use client'

import { useState } from 'react'
import { Tables } from '@/lib/types/database'
import { responseSummary } from '@/lib/survey'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { SurveyDetail } from '@/components/survey-detail'

type Survey = Tables<'feature_surveys'>

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function SurveyList({ surveys }: { surveys: Survey[] }) {
  const [selected, setSelected] = useState<Survey | null>(null)

  if (surveys.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-dashed p-12">
        <p className="text-muted-foreground">Aucun sondage pour ce projet</p>
      </div>
    )
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Sondage</TableHead>
            <TableHead className="w-[40%]">Réponse</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Plateforme</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {surveys.map((survey) => (
            <TableRow
              key={survey.id}
              className="cursor-pointer"
              onClick={() => setSelected(survey)}
            >
              <TableCell>
                <Badge variant="secondary" className="font-mono text-xs">
                  {survey.survey_key}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {responseSummary(survey.response)}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {survey.email || '—'}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {survey.device_platform || '—'}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDate(survey.created_at)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <SurveyDetail
        survey={selected}
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null)
        }}
      />
    </>
  )
}
