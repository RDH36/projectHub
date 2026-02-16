import { createClient } from '@/lib/supabase/server'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { NewsletterEditor } from '@/components/newsletter-editor'
import { NewsletterHistory } from '@/components/newsletter-history'

export default async function NewsletterPage({
  params,
}: {
  params: Promise<{ projectSlug: string }>
}) {
  const { projectSlug } = await params
  const supabase = await createClient()

  const [templatesRes, sendsRes, subscribersRes] = await Promise.all([
    supabase
      .from('newsletter_templates')
      .select('*')
      .ilike('project', projectSlug)
      .order('updated_at', { ascending: false }),
    supabase
      .from('newsletter_sends')
      .select('*')
      .ilike('project', projectSlug)
      .order('sent_at', { ascending: false })
      .limit(10),
    supabase
      .from('newsletter_subscribers')
      .select('*')
      .ilike('project', projectSlug)
      .eq('newsletter_approval', true)
      .order('created_at', { ascending: false }),
  ])

  const templates = templatesRes.data || []
  const sends = sendsRes.data || []
  const subscribers = subscribersRes.data || []

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">Newsletter</h1>
        <Badge variant="secondary">{subscribers.length} abonné(s)</Badge>
      </div>

      <Tabs defaultValue="editor">
        <TabsList>
          <TabsTrigger value="editor">Éditeur</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
        </TabsList>
        <TabsContent value="editor">
          <NewsletterEditor
            templates={templates}
            projectSlug={projectSlug}
            subscribers={subscribers}
          />
        </TabsContent>
        <TabsContent value="history">
          <NewsletterHistory sends={sends} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
