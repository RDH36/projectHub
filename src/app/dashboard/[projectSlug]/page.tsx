import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { resolveRange } from '@/lib/analytics/range'
import { getPosthogAnalytics } from '@/lib/analytics/posthog'
import { getVercelAnalytics } from '@/lib/analytics/vercel'
import { getRevenueCatAnalytics } from '@/lib/analytics/revenuecat'
import { PageHeader } from '@/components/layout/page-header'
import { RangePicker } from '@/components/analytics/range-picker'
import { KpiRow } from '@/components/overview/kpi-row'
import { TrafficPanel } from '@/components/overview/traffic-panel'
import { RecentFeedbacks } from '@/components/overview/recent-feedbacks'
import { AudiencePanel } from '@/components/overview/audience-panel'
import { likeExact } from '@/lib/utils'

export default async function OverviewPage({
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

  const sinceIso = `${range.since}T00:00:00Z`
  const prevSinceIso = `${range.prevSince}T00:00:00Z`

  const [posthog, vercel, revenuecat, feedbacksRes, subscribersRes, sendsRes, surveysRes] =
    await Promise.all([
      getPosthogAnalytics(project, range),
      getVercelAnalytics(project, range),
      getRevenueCatAnalytics(project),
      supabase
        .from('feedback')
        .select('*')
        .ilike('project', likeExact(projectSlug))
        .order('created_at', { ascending: false }),
      supabase
        .from('newsletter_subscribers')
        .select('created_at')
        .ilike('project', likeExact(projectSlug))
        .eq('newsletter_approval', true)
        .order('created_at'),
      supabase
        .from('newsletter_sends')
        .select('*')
        .ilike('project', likeExact(projectSlug))
        .order('sent_at', { ascending: false })
        .limit(3),
      supabase
        .from('feature_surveys')
        .select('id', { count: 'exact', head: true })
        .ilike('project', likeExact(projectSlug))
        .gte('created_at', sinceIso),
    ])

  const feedbacks = feedbacksRes.data ?? []
  const subscribers = subscribersRes.data ?? []
  const pending = feedbacks.filter((f) => f.status === 'pending').length
  const newSubscribers = subscribers.filter((s) => s.created_at >= sinceIso).length
  const prevNewSubscribers = subscribers.filter(
    (s) => s.created_at >= prevSinceIso && s.created_at < sinceIso
  ).length

  return (
    <>
      <PageHeader
        eyebrow={`Vue d’ensemble · ${range.label}`}
        title={project.name}
        description="Activité produit, trafic et retours utilisateurs, au même endroit."
        actions={<RangePicker current={range.key} basePath={`/dashboard/${projectSlug}`} />}
      />

      <KpiRow
        posthog={posthog}
        vercel={vercel}
        revenuecat={revenuecat}
        pendingFeedbacks={pending}
        totalFeedbacks={feedbacks.length}
        subscribers={subscribers.length}
        newSubscribers={newSubscribers}
        prevNewSubscribers={prevNewSubscribers}
      />

      <TrafficPanel posthog={posthog} vercel={vercel} />

      <div className="grid gap-6 lg:grid-cols-5">
        <RecentFeedbacks
          feedbacks={feedbacks.slice(0, 5)}
          projectSlug={projectSlug}
          surveysInRange={surveysRes.count ?? 0}
          rangeLabel={range.label}
          className="lg:col-span-2"
        />
        <AudiencePanel
          subscriberDates={subscribers.map((s) => s.created_at)}
          sends={sendsRes.data ?? []}
          range={range}
          projectSlug={projectSlug}
          className="lg:col-span-3"
        />
      </div>
    </>
  )
}
