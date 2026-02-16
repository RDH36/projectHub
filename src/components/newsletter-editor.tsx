'use client'

import { useState } from 'react'
import { useAction } from 'next-safe-action/hooks'
import { toast } from 'sonner'
import { Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { NewsletterPreview } from '@/components/newsletter-preview'
import { NewsletterSend } from '@/components/newsletter-send'
import { SubscriberSelector, type SendMode } from '@/components/subscriber-selector'
import { saveTemplate } from '@/actions/newsletter.actions'
import type { Tables } from '@/lib/types/database'

type Template = Tables<'newsletter_templates'>
type Subscriber = Tables<'newsletter_subscribers'>

export function NewsletterEditor({
  templates,
  projectSlug,
  subscribers,
}: {
  templates: Template[]
  projectSlug: string
  subscribers: Subscriber[]
}) {
  const [subject, setSubject] = useState('')
  const [templateName, setTemplateName] = useState('')
  const [html, setHtml] = useState('')
  const [sendMode, setSendMode] = useState<SendMode>('all')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const { execute: executeSave, isPending: isSaving } = useAction(saveTemplate, {
    onSuccess: () => toast.success('Template sauvegardé'),
    onError: ({ error }) =>
      toast.error(error.serverError || 'Erreur lors de la sauvegarde'),
  })

  function handleLoadTemplate(templateId: string) {
    const t = templates.find((tpl) => tpl.id === templateId)
    if (!t) return
    setHtml(t.html_content)
    setTemplateName(t.name)
  }

  function handleSave() {
    executeSave({ project: projectSlug, name: templateName, htmlContent: html })
  }

  const recipientCount =
    sendMode === 'all' ? subscribers.length : selectedIds.size
  const selectedEmails =
    sendMode === 'selected'
      ? subscribers.filter((s) => selectedIds.has(s.id)).map((s) => s.email)
      : undefined

  return (
    <div className="mt-4 space-y-6">
      {/* Template loader */}
      {templates.length > 0 && (
        <div className="flex items-end gap-3">
          <div className="space-y-1.5">
            <Label>Charger un template</Label>
            <Select onValueChange={handleLoadTemplate}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Sélectionner un template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Subject */}
      <div className="space-y-1.5">
        <Label htmlFor="subject">Objet</Label>
        <Input
          id="subject"
          placeholder="Objet de la newsletter"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
      </div>

      {/* Editor + Preview side by side */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="html-editor">HTML</Label>
          <Textarea
            id="html-editor"
            placeholder="Collez votre HTML ici..."
            className="h-[500px] resize-none font-mono text-sm"
            value={html}
            onChange={(e) => setHtml(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Preview</Label>
          <NewsletterPreview html={html} />
        </div>
      </div>

      {/* Save template */}
      <div className="flex items-end gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="template-name">Nom du template</Label>
          <Input
            id="template-name"
            placeholder="Mon template"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            className="w-[250px]"
          />
        </div>
        <Button
          variant="outline"
          onClick={handleSave}
          disabled={isSaving || !templateName || !html}
        >
          {isSaving ? <Loader2 className="animate-spin" /> : <Save />}
          Sauvegarder
        </Button>
      </div>

      <Separator />

      {/* Subscriber selector */}
      <SubscriberSelector
        subscribers={subscribers}
        sendMode={sendMode}
        onSendModeChange={setSendMode}
        selectedIds={selectedIds}
        onSelectedIdsChange={setSelectedIds}
      />

      <Separator />

      {/* Send */}
      <NewsletterSend
        projectSlug={projectSlug}
        recipientCount={recipientCount}
        subject={subject}
        html={html}
        selectedEmails={selectedEmails}
      />
    </div>
  )
}
