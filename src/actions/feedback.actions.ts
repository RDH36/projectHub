'use server'

import { authActionClient } from './safe-action'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

export const updateFeedbackStatus = authActionClient
  .schema(z.object({
    feedbackId: z.string().uuid(),
    status: z.enum(['pending', 'treated']),
    projectSlug: z.string(),
  }))
  .action(async ({ parsedInput, ctx }) => {
    const { feedbackId, status, projectSlug } = parsedInput
    const { supabase } = ctx
    const { error } = await supabase
      .from('feedback')
      .update({ status })
      .eq('id', feedbackId)
    if (error) throw new Error(error.message)
    revalidatePath(`/dashboard/${projectSlug}/feedbacks`)
    return { success: true }
  })

export const updateFeedbackCategory = authActionClient
  .schema(z.object({
    feedbackId: z.string().uuid(),
    category: z.enum(['bug', 'feature', 'question', 'other']),
    projectSlug: z.string(),
  }))
  .action(async ({ parsedInput, ctx }) => {
    const { feedbackId, category, projectSlug } = parsedInput
    const { supabase } = ctx
    const { error } = await supabase
      .from('feedback')
      .update({ category })
      .eq('id', feedbackId)
    if (error) throw new Error(error.message)
    revalidatePath(`/dashboard/${projectSlug}/feedbacks`)
    return { success: true }
  })
