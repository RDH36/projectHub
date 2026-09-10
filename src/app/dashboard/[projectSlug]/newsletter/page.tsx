import { createClient } from '@/lib/supabase/server'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageHeader, StatChip } from '@/components/layout/page-header'
import { NewsletterEditor } from '@/components/newsletter/newsletter-editor'
import { NewsletterHistory } from '@/components/newsletter/newsletter-history'

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
    <>
      <PageHeader
        eyebrow="Communauté"
        title="Newsletter"
        description="Composez en HTML, prévisualisez, puis envoyez à tout ou partie des abonnés."
        stats={
          <>
            <StatChip value={subscribers.length} label="abonnés" tone="primary" />
            <StatChip value={templates.length} label="templates" />
            <StatChip value={sends.length} label="envois récents" />
          </>
        }
      />

      <Tabs defaultValue="editor" className="rise rise-2">
        <TabsList>
          <TabsTrigger value="editor">Éditeur</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
        </TabsList>
        <TabsContent value="editor" className="rounded-xl border bg-card p-5">
          <NewsletterEditor
            templates={templates}
            projectSlug={projectSlug}
            subscribers={subscribers}
          />
        </TabsContent>
        <TabsContent value="history" className="overflow-hidden rounded-xl border bg-card">
          <NewsletterHistory sends={sends} />
        </TabsContent>
      </Tabs>
    </>
  )
}
