import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { SurveyFilters } from '@/components/survey-filters'
import { SurveyList } from '@/components/survey-list'

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
    .ilike('project', projectSlug)
    .order('created_at', { ascending: false })

  const all = surveys || []
  const keys = [...new Set(all.map((s) => s.survey_key))].sort()
  const filtered = search.key
    ? all.filter((s) => s.survey_key === search.key)
    : all

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Sondages</h1>
        <div className="flex gap-2">
          <Badge variant="secondary">{all.length} réponses</Badge>
          <Badge variant="outline">{keys.length} sondages</Badge>
        </div>
      </div>
      <SurveyFilters keys={keys} />
      <SurveyList surveys={filtered} />
    </div>
  )
}
