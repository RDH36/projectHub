import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { resolveRange } from '@/lib/analytics/range'
import { getPosthogAnalytics } from '@/lib/analytics/posthog'
import { getVercelAnalytics } from '@/lib/analytics/vercel'
import { PageHeader } from '@/components/layout/page-header'
import { RangePicker } from '@/components/analytics/range-picker'
import { PosthogSection } from './posthog-section'
import { VercelSection } from './vercel-section'

export default async function AnalyticsPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectSlug: string }>
  searchParams: Promise<{ range?: string }>
}) {
  const { projectSlug } = await params
  const { range: rangeParam } = await searchParams
  const range = resolveRange(rangeParam)
  const supabase = await createClient()

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', projectSlug)
    .single()
  if (!project) notFound()

  const [posthog, vercel] = await Promise.all([
    getPosthogAnalytics(project, range),
    getVercelAnalytics(project, range),
  ])

  return (
    <>
      <PageHeader
        eyebrow={`Analytics · ${range.label}`}
        title="Analytics"
        description="Usage produit mesuré par PostHog et trafic web mesuré par Vercel, comparés à la période précédente."
        actions={<RangePicker current={range.key} basePath={`/dashboard/${projectSlug}/analytics`} />}
      />
      <PosthogSection state={posthog} />
      <VercelSection state={vercel} />
    </>
  )
}
