'use client'

import { usePathname } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { ThemeToggle } from '@/components/layout/theme-toggle'

const SECTION_LABELS: Record<string, string> = {
  analytics: 'Analytics',
  feedbacks: 'Feedbacks',
  surveys: 'Sondages',
  subscribers: 'Abonnés',
  newsletter: 'Newsletter',
}

export function DashboardHeader({
  projectName,
  projectSlug,
}: {
  projectName: string
  projectSlug: string
}) {
  const pathname = usePathname()
  const segment = pathname.split(`/dashboard/${projectSlug}/`)[1]?.split('/')[0] ?? ''
  const section = SECTION_LABELS[segment] ?? 'Vue d’ensemble'

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <SidebarTrigger className="-ml-1 text-muted-foreground" />
      <nav aria-label="Fil d’Ariane" className="flex items-center gap-1.5 text-sm">
        <span className="text-muted-foreground">{projectName}</span>
        <ChevronRight className="size-3.5 text-muted-foreground/60" />
        <span className="font-medium">{section}</span>
      </nav>
      <div className="ml-auto flex items-center gap-1">
        <ThemeToggle />
      </div>
    </header>
  )
}
