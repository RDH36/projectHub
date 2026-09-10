'use client'

import { createPortal } from 'react-dom'

/**
 * Voile plein écran pour les transitions bloquantes (changement de projet,
 * déconnexion). Rendu dans un portail pour échapper à la sidebar.
 */
export function ScreenOverlay({
  eyebrow,
  title,
  icon,
}: {
  eyebrow: string
  title: string
  icon: React.ReactNode
}) {
  // Rendu uniquement après une interaction client : `document` est disponible.
  return createPortal(
    <div
      role="status"
      aria-live="polite"
      aria-label={`${eyebrow} : ${title}`}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-5 bg-background/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative">
        <span className="absolute -inset-3 animate-ping rounded-2xl bg-primary/15" />
        <div className="relative">{icon}</div>
      </div>
      <div className="text-center">
        <p className="eyebrow mb-1">{eyebrow}</p>
        <p className="font-display text-2xl font-semibold tracking-tight">{title}</p>
      </div>
      <div className="h-1 w-40 overflow-hidden rounded-full bg-muted">
        <div className="h-full w-1/2 animate-[slide_1.1s_ease-in-out_infinite] rounded-full bg-primary" />
      </div>
      <style>{`@keyframes slide { 0% { transform: translateX(-100%) } 100% { transform: translateX(200%) } }`}</style>
    </div>,
    document.body
  )
}
