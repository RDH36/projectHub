import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { SubscriberList } from '@/components/subscriber-list'

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

  const count = subscribers?.length ?? 0

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Abonnés</h1>
        <Badge variant="secondary">{count}</Badge>
      </div>
      <Separator />
      <SubscriberList subscribers={subscribers ?? []} />
    </div>
  )
}
