import { createClient } from '@/lib/supabase/server'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ projectSlug: string }>
}) {
  const { projectSlug } = await params
  const supabase = await createClient()
  const { data: projects } = await supabase.from('projects').select('*')

  return (
    <SidebarProvider>
      <AppSidebar projects={projects || []} currentSlug={projectSlug} />
      <SidebarInset>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
