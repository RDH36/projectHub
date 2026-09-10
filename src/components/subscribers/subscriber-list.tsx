'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatDate } from '@/lib/format'
import type { Tables } from '@/lib/types/database'

type Subscriber = Tables<'newsletter_subscribers'>

export function SubscriberList({ subscribers }: { subscribers: Subscriber[] }) {
  const [search, setSearch] = useState('')
  const needle = search.trim().toLowerCase()

  const filtered = needle
    ? subscribers.filter(
        (s) =>
          s.email.toLowerCase().includes(needle) ||
          (s.first_name?.toLowerCase().includes(needle) ?? false)
      )
    : subscribers

  if (subscribers.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-14 text-center text-sm text-muted-foreground">
        Aucun abonné pour ce projet.
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="flex items-center gap-3 border-b px-4 py-3">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher par email ou prénom…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 pl-8"
          />
        </div>
        <p className="ml-auto text-xs text-muted-foreground tabular">
          {filtered.length} / {subscribers.length}
        </p>
      </div>
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow className="hover:bg-transparent">
            <TableHead className="eyebrow h-10">Email</TableHead>
            <TableHead className="eyebrow h-10">Prénom</TableHead>
            <TableHead className="eyebrow h-10 text-right">Inscrit le</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((subscriber) => (
            <TableRow key={subscriber.id}>
              <TableCell className="font-medium">{subscriber.email}</TableCell>
              <TableCell className="text-muted-foreground">{subscriber.first_name || '—'}</TableCell>
              <TableCell className="text-right text-muted-foreground tabular">
                {formatDate(subscriber.created_at)}
              </TableCell>
            </TableRow>
          ))}
          {filtered.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} className="py-10 text-center text-muted-foreground">
                Aucun résultat pour « {search} »
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
