import { createClient } from '@/lib/supabase/server'
import { PageHeader, StatChip } from '@/components/layout/page-header'
import { SurveyFilters } from '@/components/surveys/survey-filters'
import { SurveyList } from '@/components/surveys/survey-list'
import { likeExact } from '@/lib/utils'

export default async function SurveysPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectSlug: string }>
  searchParams: Promise<{ key?: string }>
}) {
  const { projectSlug } = await params
  const search = await searchParams
  const supabase = await createClient()

  const { data: surveys } = await supabase
    .from('feature_surveys')
    .select('*')
    .ilike('project', likeExact(projectSlug))
    .order('created_at', { ascending: false })

  const all = surveys || []
  const keys = [...new Set(all.map((s) => s.survey_key))].sort()
  const filtered = search.key ? all.filter((s) => s.survey_key === search.key) : all

  return (
    <>
      <PageHeader
        eyebrow="Communauté"
        title="Sondages"
        description="Réponses aux sondages in-app, une ligne par réponse."
        actions={<SurveyFilters keys={keys} />}
        stats={
          <>
            <StatChip value={all.length} label="réponses" />
            <StatChip value={keys.length} label="sondages" tone="primary" />
          </>
        }
      />
      <div className="rise rise-2 overflow-hidden rounded-xl border bg-card">
        <SurveyList surveys={filtered} />
      </div>
    </>
  )
}
