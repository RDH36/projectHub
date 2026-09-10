'use server'

import { authActionClient } from './safe-action'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { sendBatch } from '@/lib/email'
import { likeExact } from '@/lib/utils'

export const saveTemplate = authActionClient
  .schema(z.object({
    project: z.string(),
    name: z.string().min(1),
    htmlContent: z.string().min(1),
  }))
  .action(async ({ parsedInput, ctx }) => {
    const { project, name, htmlContent } = parsedInput
    const { supabase } = ctx
    const { error } = await supabase
      .from('newsletter_templates')
      .insert({ project, name, html_content: htmlContent })
    if (error) throw new Error(error.message)
    revalidatePath(`/dashboard/${project}/newsletter`)
    return { success: true }
  })

export const sendNewsletter = authActionClient
  .schema(z.object({
    projectSlug: z.string(),
    subject: z.string().min(1),
    html: z.string().min(1),
    templateId: z.string().uuid().optional(),
    selectedEmails: z.array(z.string().email()).optional(),
  }))
  .action(async ({ parsedInput, ctx }) => {
    const { projectSlug, subject, html, templateId, selectedEmails } = parsedInput
    const { supabase } = ctx

    // Get project display name for sender
    const { data: project } = await supabase
      .from('projects')
      .select('name')
      .eq('slug', projectSlug)
      .single()
    const senderName = project?.name ?? projectSlug

    // Les destinataires sont toujours pris parmi les abonnés consentants du projet :
    // une sélection manuelle ne peut pas injecter d'adresses extérieures.
    const { data: subscribers, error: subError } = await supabase
      .from('newsletter_subscribers')
      .select('email')
      .ilike('project', likeExact(projectSlug))
      .eq('newsletter_approval', true)

    if (subError) throw new Error(subError.message)
    if (!subscribers || subscribers.length === 0) throw new Error('Aucun abonné trouvé')

    const allowed = new Set(subscribers.map((s) => s.email.toLowerCase()))
    const targets =
      selectedEmails && selectedEmails.length > 0
        ? selectedEmails.filter((email) => allowed.has(email.toLowerCase()))
        : subscribers.map((s) => s.email)
    if (targets.length === 0) throw new Error('Aucun destinataire valide dans la sélection')

    const emails = targets.map((to) => ({ to, subject, html, senderName }))

    await sendBatch(emails)

    await supabase.from('newsletter_sends').insert({
      project: projectSlug,
      template_id: templateId || null,
      subject,
      recipients_count: emails.length,
    })

    revalidatePath(`/dashboard/${projectSlug}/newsletter`)
    return { success: true, count: emails.length }
  })
