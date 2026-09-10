import { createClient } from '@/lib/supabase/server'
import { PageHeader, StatChip } from '@/components/layout/page-header'
import { SubscriberList } from '@/components/subscribers/subscriber-list'

export default async function SubscribersPage({
  params,
}: {
  params: Promise<{ projectSlug: string }>
}) {
  const { projectSlug } = await params
  const supabase = await createClient()

  const { data: subscribers } = await supabase
    .from('newsletter_subscribers')
    .select('*')
    .ilike('project', projectSlug)
    .eq('newsletter_approval', true)
    .order('created_at', { ascending: false })

  const list = subscribers ?? []
  const monthAgo = new Date()
  monthAgo.setDate(monthAgo.getDate() - 30)
  const recent = list.filter((s) => new Date(s.created_at) >= monthAgo).length

  return (
    <>
      <PageHeader
        eyebrow="Communauté"
        title="Abonnés"
        description="Personnes ayant accepté de recevoir la newsletter."
        stats={
          <>
            <StatChip value={list.length} label="abonnés" />
            <StatChip value={`+${recent}`} label="sur 30 jours" tone="success" />
          </>
        }
      />
      <div className="rise rise-2">
        <SubscriberList subscribers={list} />
      </div>
    </>
  )
}
