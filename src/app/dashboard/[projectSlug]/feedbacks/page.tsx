import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { FeedbackFilters } from '@/components/feedback-filters'
import { FeedbackList } from '@/components/feedback-list'

export default async function FeedbacksPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectSlug: string }>
  searchParams: Promise<{ status?: string; category?: string }>
}) {
  const { projectSlug } = await params
  const search = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('feedback')
    .select('*')
    .ilike('project', projectSlug)
    .order('created_at', { ascending: false })

  if (search.status) {
    query = query.eq('status', search.status)
  }
  if (search.category) {
    query = query.eq('category', search.category)
  }

  const { data: feedbacks } = await query

  const all = feedbacks || []
  const pendingCount = all.filter((f) => f.status === 'pending').length
  const treatedCount = all.filter((f) => f.status === 'treated').length

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Feedbacks</h1>
        <div className="flex gap-2">
          <Badge variant="secondary">{all.length} total</Badge>
          <Badge variant="outline" className="border-yellow-500 text-yellow-600">
            {pendingCount} en attente
          </Badge>
          <Badge variant="outline" className="border-green-500 text-green-600">
            {treatedCount} traités
          </Badge>
        </div>
      </div>
      <FeedbackFilters />
      <FeedbackList feedbacks={all} projectSlug={projectSlug} />
    </div>
  )
}
