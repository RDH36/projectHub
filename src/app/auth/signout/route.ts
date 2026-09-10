import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { type NextRequest, NextResponse } from 'next/server'

/** Refuse les POST venant d'un autre site (déconnexion forcée par CSRF). */
function isSameOrigin(request: NextRequest) {
  const origin = request.headers.get('origin')
  if (!origin) return true // navigation same-site sans en-tête Origin (anciens navigateurs)
  return origin === request.nextUrl.origin
}

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: 'Origine non autorisée' }, { status: 403 })
  }
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
