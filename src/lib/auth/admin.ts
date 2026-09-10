/**
 * Liste blanche des administrateurs (ADMIN_EMAILS, séparés par des virgules).
 * Sans cette variable, tout compte Supabase authentifié est accepté : à
 * renseigner en production, car les inscriptions publiques Supabase créent
 * sinon des comptes ayant accès au dashboard.
 */
const admins = (process.env.ADMIN_EMAILS ?? '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean)

export function isAdminEmail(email: string | null | undefined) {
  if (admins.length === 0) return true
  return Boolean(email && admins.includes(email.toLowerCase()))
}
