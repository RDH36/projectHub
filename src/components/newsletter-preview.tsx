'use client'

export function NewsletterPreview({ html }: { html: string }) {
  if (!html) {
    return (
      <div className="flex h-[500px] items-center justify-center rounded-md border bg-muted/30 text-sm text-muted-foreground">
        Collez votre HTML pour voir le preview
      </div>
    )
  }

  return (
    <iframe
      srcDoc={html}
      sandbox="allow-same-origin"
      className="h-[500px] w-full rounded-md border bg-white"
      title="Preview"
    />
  )
}
