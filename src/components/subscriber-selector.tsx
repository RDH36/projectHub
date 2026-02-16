'use client'

import { useState } from 'react'
import { Users, UserCheck } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import type { Tables } from '@/lib/types/database'

type Subscriber = Tables<'newsletter_subscribers'>

export type SendMode = 'all' | 'selected'

export function SubscriberSelector({
  subscribers,
  sendMode,
  onSendModeChange,
  selectedIds,
  onSelectedIdsChange,
}: {
  subscribers: Subscriber[]
  sendMode: SendMode
  onSendModeChange: (mode: SendMode) => void
  selectedIds: Set<string>
  onSelectedIdsChange: (ids: Set<string>) => void
}) {
  const [search, setSearch] = useState('')

  const filtered = search
    ? subscribers.filter(
        (s) =>
          s.email.toLowerCase().includes(search.toLowerCase()) ||
          (s.first_name?.toLowerCase().includes(search.toLowerCase()) ?? false)
      )
    : subscribers

  function toggleSubscriber(id: string) {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    onSelectedIdsChange(next)
  }

  function toggleAll() {
    if (selectedIds.size === subscribers.length) {
      onSelectedIdsChange(new Set())
    } else {
      onSelectedIdsChange(new Set(subscribers.map((s) => s.id)))
    }
  }

  return (
    <div className="space-y-4">
      <Label className="text-base font-semibold">Destinataires</Label>
      <RadioGroup
        value={sendMode}
        onValueChange={(v) => onSendModeChange(v as SendMode)}
        className="flex gap-4"
      >
        <div className="flex items-center gap-2">
          <RadioGroupItem value="all" id="send-all" />
          <Label htmlFor="send-all" className="flex items-center gap-1.5 cursor-pointer">
            <Users className="h-4 w-4" />
            Tous les abonnés ({subscribers.length})
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem value="selected" id="send-selected" />
          <Label htmlFor="send-selected" className="flex items-center gap-1.5 cursor-pointer">
            <UserCheck className="h-4 w-4" />
            Sélection
            {sendMode === 'selected' && selectedIds.size > 0 && (
              <Badge variant="secondary" className="ml-1">
                {selectedIds.size}
              </Badge>
            )}
          </Label>
        </div>
      </RadioGroup>

      {sendMode === 'selected' && (
        <div className="rounded-md border">
          <div className="flex items-center gap-2 border-b p-3">
            <Input
              placeholder="Rechercher par email ou prénom..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8"
            />
            <button
              type="button"
              onClick={toggleAll}
              className="text-xs whitespace-nowrap text-muted-foreground hover:text-foreground"
            >
              {selectedIds.size === subscribers.length
                ? 'Tout désélectionner'
                : 'Tout sélectionner'}
            </button>
          </div>
          <ScrollArea className="h-[200px]">
            <div className="space-y-0">
              {filtered.map((s) => (
                <label
                  key={s.id}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-muted/50 cursor-pointer"
                >
                  <Checkbox
                    checked={selectedIds.has(s.id)}
                    onCheckedChange={() => toggleSubscriber(s.id)}
                  />
                  <span className="text-sm">{s.email}</span>
                  {s.first_name && (
                    <span className="text-xs text-muted-foreground">
                      ({s.first_name})
                    </span>
                  )}
                </label>
              ))}
              {filtered.length === 0 && (
                <p className="p-3 text-sm text-muted-foreground text-center">
                  Aucun résultat
                </p>
              )}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  )
}
