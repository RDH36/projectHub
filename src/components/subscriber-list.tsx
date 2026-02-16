'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Tables } from '@/lib/types/database'

type Subscriber = Tables<'newsletter_subscribers'>

const formatDate = (dateStr: string) =>
  new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateStr))

export function SubscriberList({ subscribers }: { subscribers: Subscriber[] }) {
  const [search, setSearch] = useState('')

  const filtered = search
    ? subscribers.filter((s) =>
        s.email.toLowerCase().includes(search.toLowerCase())
      )
    : subscribers

  if (subscribers.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        Aucun abonné pour ce projet
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <Input
        placeholder="Rechercher par email…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Prénom</TableHead>
            <TableHead>Inscrit le</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((subscriber) => (
            <TableRow key={subscriber.id}>
              <TableCell className="font-medium">{subscriber.email}</TableCell>
              <TableCell>{subscriber.first_name || '—'}</TableCell>
              <TableCell>{formatDate(subscriber.created_at)}</TableCell>
            </TableRow>
          ))}
          {filtered.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={3}
                className="text-muted-foreground text-center"
              >
                Aucun résultat
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <p className="text-muted-foreground text-sm">
        {filtered.length} abonné{filtered.length !== 1 ? 's' : ''}
      </p>
    </div>
  )
}
