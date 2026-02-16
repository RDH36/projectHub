'use server'

import { authActionClient } from './safe-action'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { sendBatch } from '@/lib/email'

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

    let emails: { to: string; subject: string; html: string; senderName: string }[]

    if (selectedEmails && selectedEmails.length > 0) {
      emails = selectedEmails.map((email) => ({ to: email, subject, html, senderName }))
    } else {
      const { data: subscribers, error: subError } = await supabase
        .from('newsletter_subscribers')
        .select('email')
        .ilike('project', projectSlug)
        .eq('newsletter_approval', true)

      if (subError) throw new Error(subError.message)
      if (!subscribers || subscribers.length === 0)
        throw new Error('Aucun abonné trouvé')

      emails = subscribers.map((s) => ({ to: s.email, subject, html, senderName }))
    }

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
