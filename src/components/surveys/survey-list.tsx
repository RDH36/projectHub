'use client'

import { useState } from 'react'
import { Tables } from '@/lib/types/database'
import { responseSummary } from '@/lib/survey'
import { formatDate } from '@/lib/format'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { SurveyDetail } from '@/components/surveys/survey-detail'

type Survey = Tables<'feature_surveys'>

export function SurveyList({ surveys }: { surveys: Survey[] }) {
  const [selected, setSelected] = useState<Survey | null>(null)

  if (surveys.length === 0) {
    return (
      <div className="p-14 text-center text-sm text-muted-foreground">
        Aucune réponse de sondage pour ce projet.
      </div>
    )
  }

  return (
    <>
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow className="hover:bg-transparent">
            <TableHead className="eyebrow h-10">Sondage</TableHead>
            <TableHead className="eyebrow h-10 w-[40%]">Réponse</TableHead>
            <TableHead className="eyebrow h-10">Email</TableHead>
            <TableHead className="eyebrow h-10">Plateforme</TableHead>
            <TableHead className="eyebrow h-10 text-right">Date</TableHead>
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
              <TableCell className="text-right text-muted-foreground tabular">
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
