'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BarChart3,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Mail,
  MessageSquare,
  Users,
  type LucideIcon,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import { ProjectSwitcher } from '@/components/layout/project-switcher'
import { ScreenOverlay } from '@/components/layout/screen-overlay'
import type { Tables } from '@/lib/types/database'

type Project = Tables<'projects'>

type NavItem = { label: string; icon: LucideIcon; segment: string; badge?: number }
type NavGroup = { label: string; items: NavItem[] }

export function AppSidebar({
  projects,
  currentSlug,
  pendingFeedbacks = 0,
}: {
  projects: Project[]
  currentSlug: string
  pendingFeedbacks?: number
}) {
  const pathname = usePathname()
  const base = `/dashboard/${currentSlug}`
  const [signingOut, setSigningOut] = useState(false)

  async function handleSignOut(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSigningOut(true)
    try {
      await fetch('/auth/signout', { method: 'POST', redirect: 'follow' })
    } finally {
      // Navigation complète : purge l'état client et affiche /login
      window.location.assign('/login')
    }
  }

  const groups: NavGroup[] = [
    {
      label: 'Pilotage',
      items: [
        { label: 'Vue d’ensemble', icon: LayoutDashboard, segment: '' },
        { label: 'Analytics', icon: BarChart3, segment: 'analytics' },
      ],
    },
    {
      label: 'Communauté',
      items: [
        { label: 'Feedbacks', icon: MessageSquare, segment: 'feedbacks', badge: pendingFeedbacks },
        { label: 'Sondages', icon: ClipboardList, segment: 'surveys' },
        { label: 'Abonnés', icon: Users, segment: 'subscribers' },
        { label: 'Newsletter', icon: Mail, segment: 'newsletter' },
      ],
    },
  ]

  const isActive = (segment: string) =>
    segment === '' ? pathname === base : pathname.startsWith(`${base}/${segment}`)

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="gap-3 p-3">
        <Link
          href={base}
          className="flex items-center gap-2.5 px-1 py-1 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
        >
          <span className="relative flex size-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <span className="absolute inset-[5px] rounded-[3px] border-2 border-current opacity-90" />
            <span className="absolute right-[5px] bottom-[5px] size-2 rounded-[2px] bg-current" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight group-data-[collapsible=icon]:hidden">
            ProjectHub
          </span>
        </Link>
        <SidebarMenu>
          <SidebarMenuItem>
            <ProjectSwitcher projects={projects} currentSlug={currentSlug} />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {groups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="eyebrow">{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.segment)}
                      tooltip={item.label}
                      className="data-[active=true]:bg-sidebar-accent data-[active=true]:font-semibold"
                    >
                      <Link href={item.segment ? `${base}/${item.segment}` : base}>
                        <item.icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                    {item.badge ? (
                      <SidebarMenuBadge className="rounded-full bg-primary/12 text-primary tabular">
                        {item.badge}
                      </SidebarMenuBadge>
                    ) : null}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <form action="/auth/signout" method="POST" onSubmit={handleSignOut}>
              <SidebarMenuButton
                type="submit"
                disabled={signingOut}
                className="w-full text-muted-foreground hover:text-foreground"
                tooltip="Se déconnecter"
              >
                <LogOut />
                <span>Se déconnecter</span>
              </SidebarMenuButton>
            </form>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
      {signingOut ? (
        <ScreenOverlay
          eyebrow="À bientôt"
          title="Déconnexion…"
          icon={
            <span className="flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/10">
              <LogOut className="size-7" />
            </span>
          }
        />
      ) : null}
    </Sidebar>
  )
}
