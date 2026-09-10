'use client'

import { useState, useTransition } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Check, ChevronsUpDown } from 'lucide-react'
import { ScreenOverlay } from '@/components/layout/screen-overlay'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SidebarMenuButton } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import type { Tables } from '@/lib/types/database'

type Project = Tables<'projects'>

const HUES = [40, 200, 150, 280, 330, 80]

/** Pastille colorée déterministe par projet (initiale + teinte). */
export function ProjectMark({ name, index, className }: { name: string; index: number; className?: string }) {
  const hue = HUES[index % HUES.length]
  return (
    <span
      aria-hidden
      className={cn(
        'flex size-8 shrink-0 items-center justify-center rounded-lg font-display text-sm font-bold',
        className
      )}
      style={{
        background: `oklch(0.92 0.06 ${hue})`,
        color: `oklch(0.38 0.13 ${hue})`,
      }}
    >
      {name.slice(0, 1).toUpperCase()}
    </span>
  )
}

export function ProjectSwitcher({
  projects,
  currentSlug,
}: {
  projects: Project[]
  currentSlug: string
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [target, setTarget] = useState<{ name: string; index: number } | null>(null)
  const currentIndex = Math.max(projects.findIndex((p) => p.slug === currentSlug), 0)
  const current = projects[currentIndex]

  function switchTo(project: Project, index: number) {
    if (project.slug === currentSlug) return
    // Conserve la section courante (feedbacks, analytics…) en changeant de projet
    const next = pathname.replace(`/dashboard/${currentSlug}`, `/dashboard/${project.slug}`)
    setTarget({ name: project.name, index })
    // La transition reste « pending » jusqu'à ce que la nouvelle page soit rendue
    startTransition(() => router.push(next))
  }

  return (
    <>
      {isPending && target ? (
        <ScreenOverlay
          eyebrow="Changement de projet"
          title={target.name}
          icon={
            <ProjectMark
              name={target.name}
              index={target.index}
              className="size-16 rounded-2xl text-2xl shadow-lg shadow-primary/10"
            />
          }
        />
      ) : null}
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent"
          tooltip={current?.name ?? currentSlug}
        >
          <ProjectMark name={current?.name ?? currentSlug} index={currentIndex} />
          <div className="grid flex-1 text-left leading-tight">
            <span className="eyebrow text-[0.625rem]">Projet</span>
            <span className="truncate font-display text-sm font-semibold">
              {current?.name ?? currentSlug}
            </span>
          </div>
          <ChevronsUpDown className="ml-auto size-4 opacity-50" />
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="bottom" sideOffset={6} className="w-60">
        <DropdownMenuLabel className="eyebrow">Changer de projet</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {projects.map((project, index) => (
          <DropdownMenuItem
            key={project.id}
            onSelect={() => switchTo(project, index)}
            className="gap-2.5"
          >
            <ProjectMark name={project.name} index={index} className="size-6 rounded-md text-xs" />
            <span className="flex-1 truncate">{project.name}</span>
            {project.slug === currentSlug ? <Check className="size-4" /> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
    </>
  )
}
