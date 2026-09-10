import { createClient } from '@/lib/supabase/server'
import { PageHeader, StatChip } from '@/components/layout/page-header'
import { FeedbackFilters } from '@/components/feedbacks/feedback-filters'
import { FeedbackList } from '@/components/feedbacks/feedback-list'
import { likeExact } from '@/lib/utils'

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
    .ilike('project', likeExact(projectSlug))
    .order('created_at', { ascending: false })

  if (search.status) query = query.eq('status', search.status)
  if (search.category) query = query.eq('category', search.category)

  const { data: feedbacks } = await query
  const all = feedbacks || []
  const pendingCount = all.filter((f) => f.status === 'pending').length
  const treatedCount = all.filter((f) => f.status === 'treated').length

  return (
    <>
      <PageHeader
        eyebrow="Communauté"
        title="Feedbacks"
        description="Retours envoyés depuis l’application. Cliquez sur une ligne pour catégoriser ou marquer comme traité."
        actions={<FeedbackFilters />}
        stats={
          <>
            <StatChip value={all.length} label="au total" />
            <StatChip value={pendingCount} label="en attente" tone="warning" />
            <StatChip value={treatedCount} label="traités" tone="success" />
          </>
        }
      />
      <div className="rise rise-2 overflow-hidden rounded-xl border bg-card">
        <FeedbackList feedbacks={all} projectSlug={projectSlug} />
      </div>
    </>
  )
}
