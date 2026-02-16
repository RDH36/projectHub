'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  MessageSquare,
  Users,
  Mail,
  LogOut,
  ChevronsUpDown,
  LayoutDashboard,
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
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Tables } from '@/lib/types/database'

type Project = Tables<'projects'>

const navItems = [
  { label: 'Feedbacks', icon: MessageSquare, segment: 'feedbacks' },
  { label: 'Abonnés', icon: Users, segment: 'subscribers' },
  { label: 'Newsletter', icon: Mail, segment: 'newsletter' },
]

export function AppSidebar({
  projects,
  currentSlug,
}: {
  projects: Project[]
  currentSlug: string
}) {
  const pathname = usePathname()
  const router = useRouter()
  const currentProject = projects.find((p) => p.slug === currentSlug)

  const isActive = (segment: string) => pathname.includes(`/${segment}`)

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href={`/dashboard/${currentSlug}/feedbacks`}>
                <div className="bg-primary text-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-md">
                  <LayoutDashboard className="size-4" />
                </div>
                <span className="text-base font-semibold">ProjectHub</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* Project Switcher */}
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <SidebarGroupLabel>Projet</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton className="w-full justify-between">
                      <span className="truncate font-medium">
                        {currentProject?.name ?? currentSlug}
                      </span>
                      <ChevronsUpDown className="size-4 opacity-50" />
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    {projects.map((project) => (
                      <DropdownMenuItem
                        key={project.id}
                        onSelect={() =>
                          router.push(`/dashboard/${project.slug}/feedbacks`)
                        }
                      >
                        {project.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.segment}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.segment)}
                    tooltip={item.label}
                  >
                    <Link
                      href={`/dashboard/${currentSlug}/${item.segment}`}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <form action="/auth/signout" method="POST">
              <SidebarMenuButton
                type="submit"
                className="w-full"
                tooltip="Se déconnecter"
              >
                <LogOut />
                <span>Se déconnecter</span>
              </SidebarMenuButton>
            </form>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
