'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tous' },
  { value: 'pending', label: 'En attente' },
  { value: 'treated', label: 'Traité' },
]

const CATEGORY_OPTIONS = [
  { value: 'all', label: 'Toutes catégories' },
  { value: 'bug', label: 'Bug' },
  { value: 'feature', label: 'Feature' },
  { value: 'question', label: 'Question' },
  { value: 'other', label: 'Autre' },
]

export function FeedbackFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const currentStatus = searchParams.get('status') || 'all'
  const currentCategory = searchParams.get('category') || 'all'

  function updateParams(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all') {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex gap-1">
        {STATUS_OPTIONS.map((opt) => (
          <Button
            key={opt.value}
            variant={currentStatus === opt.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => updateParams('status', opt.value)}
          >
            {opt.label}
          </Button>
        ))}
      </div>
      <Select
        value={currentCategory}
        onValueChange={(v) => updateParams('category', v)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {CATEGORY_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
