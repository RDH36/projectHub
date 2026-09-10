'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Identifiants incorrects. Vérifiez votre email et votre mot de passe.')
      setLoading(false)
      return
    }

    router.push('/dashboard/mitsitsy')
    router.refresh()
  }

  return (
    <div className="rise w-full max-w-sm">
      <div className="mb-8 lg:hidden">
        <span className="font-display text-2xl font-bold tracking-tight">ProjectHub</span>
      </div>
      <p className="eyebrow mb-2">Connexion</p>
      <h2 className="font-display text-3xl font-semibold tracking-tight">Bon retour.</h2>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Accès réservé à l’administrateur du hub.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="vous@exemple.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-11"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Mot de passe</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="h-11"
          />
        </div>
        {error ? (
          <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}
        <Button type="submit" className="h-11 w-full" disabled={loading}>
          {loading ? <Loader2 className="animate-spin" /> : null}
          {loading ? 'Connexion…' : 'Se connecter'}
          {!loading ? <ArrowRight /> : null}
        </Button>
      </form>
    </div>
  )
}
