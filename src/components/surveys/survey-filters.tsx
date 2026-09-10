'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function SurveyFilters({ keys }: { keys: string[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  if (keys.length === 0) return null

  const currentKey = searchParams.get('key') || 'all'

  function updateKey(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all') {
      params.delete('key')
    } else {
      params.set('key', value)
    }
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
  }

  return (
    <div className="flex items-center gap-3">
      <Select value={currentKey} onValueChange={updateKey}>
        <SelectTrigger className="w-[220px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les sondages</SelectItem>
          {keys.map((key) => (
            <SelectItem key={key} value={key}>
              {key}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
