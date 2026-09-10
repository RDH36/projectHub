import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { DashboardHeader } from '@/components/layout/dashboard-header'
import { likeExact } from '@/lib/utils'

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ projectSlug: string }>
}) {
  const { projectSlug } = await params
  const supabase = await createClient()

  const [{ data: projects }, { count: pendingFeedbacks }] = await Promise.all([
    supabase.from('projects').select('*').order('created_at'),
    supabase
      .from('feedback')
      .select('id', { count: 'exact', head: true })
      .ilike('project', likeExact(projectSlug))
      .eq('status', 'pending'),
  ])

  const current = projects?.find((p) => p.slug === projectSlug)
  if (!current) notFound()

  return (
    <SidebarProvider>
      <AppSidebar
        projects={projects ?? []}
        currentSlug={projectSlug}
        pendingFeedbacks={pendingFeedbacks ?? 0}
      />
      <SidebarInset className="page-glow">
        <DashboardHeader projectName={current.name} projectSlug={projectSlug} />
        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
