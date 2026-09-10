import { LoginForm } from './login-form'

const PROJECT_MARKS = [
  { letter: 'M', hue: 40 },
  { letter: 'F', hue: 200 },
  { letter: 'C', hue: 150 },
]

export default function LoginPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      {/* Panneau éditorial */}
      <aside className="relative hidden overflow-hidden bg-sidebar lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(50rem 30rem at 0% 0%, color-mix(in oklch, var(--primary) 16%, transparent), transparent 70%), linear-gradient(to right, color-mix(in oklch, var(--foreground) 5%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklch, var(--foreground) 5%, transparent) 1px, transparent 1px)',
            backgroundSize: 'auto, 48px 48px, 48px 48px',
          }}
        />
        <div className="relative flex items-center gap-2.5">
          <span className="relative flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <span className="absolute inset-[6px] rounded-[3px] border-2 border-current opacity-90" />
            <span className="absolute right-[6px] bottom-[6px] size-2 rounded-[2px] bg-current" />
          </span>
          <span className="font-display text-xl font-bold tracking-tight">ProjectHub</span>
        </div>

        <div className="relative max-w-md">
          <p className="eyebrow mb-4">Tableau de bord personnel</p>
          <h1 className="font-display text-5xl leading-[1.05] font-semibold tracking-tight">
            Vos projets,
            <br />
            leurs utilisateurs,
            <br />
            <span className="text-primary">un seul endroit.</span>
          </h1>
          <p className="mt-6 text-base text-muted-foreground">
            Feedbacks, sondages, newsletters, usage produit et trafic web, projet par projet.
          </p>
        </div>

        <div className="relative flex items-center gap-3">
          <div className="flex -space-x-2">
            {PROJECT_MARKS.map((m) => (
              <span
                key={m.letter}
                className="flex size-9 items-center justify-center rounded-lg border-2 border-sidebar font-display text-sm font-bold"
                style={{
                  background: `oklch(0.92 0.06 ${m.hue})`,
                  color: `oklch(0.38 0.13 ${m.hue})`,
                }}
              >
                {m.letter}
              </span>
            ))}
          </div>
          <p className="eyebrow">Supabase · PostHog · Vercel</p>
        </div>
      </aside>

      <main className="flex items-center justify-center p-6 page-glow">
        <LoginForm />
      </main>
    </div>
  )
}
