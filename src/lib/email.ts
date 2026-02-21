import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface EmailPayload {
  to: string
  subject: string
  html: string
  senderName?: string
}

export async function sendBatch(emails: EmailPayload[]) {
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
  const batches = chunk(emails, 100)
  const results = []
  for (const batch of batches) {
    const result = await resend.batch.send(
      batch.map((e) => ({
        from: e.senderName ? `${e.senderName} <${fromEmail}>` : fromEmail,
        to: e.to,
        subject: e.subject,
        html: e.html,
        text: htmlToPlainText(e.html),
        replyTo: fromEmail,
        headers: {
          'List-Unsubscribe': `<mailto:${fromEmail}?subject=unsubscribe>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
          'X-Entity-Ref-ID': crypto.randomUUID(),
        },
      }))
    )
    results.push(result)
  }
  return results
}

function htmlToPlainText(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
}

function chunk<T>(arr: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  )
}
