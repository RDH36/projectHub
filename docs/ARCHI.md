# Technical Architecture: ProjectHub

## Architecture Overview

**Philosophy**: Architecture minimale pour un dashboard personnel. Zéro abstraction inutile — on utilise Supabase pour tout (DB, Auth, Storage) puisque les données y sont déjà. L'objectif est de livrer en 2 jours, pas de construire une plateforme scalable.

**Tech Stack Summary**:
- Framework: Next.js 15 avec App Router
- Deployment: Vercel (serverless)
- Database: Supabase PostgreSQL (instance existante `Newsletter-assembly`)
- Data Access: @supabase/supabase-js (pas d'ORM)
- Authentication: Supabase Auth (email/password, admin unique)
- Email: Resend API
- UI: shadcn/ui + Tailwind CSS

---

## Frontend Architecture

### Core Stack

- **Framework**: Next.js 15 (App Router)
  - **Why**: Déjà défini dans le PRD. Server Components pour le data fetching, Server Actions pour les mutations. SSR natif.
  - **Trade-off**: App Router ajoute de la complexité vs Pages Router, mais les Server Components éliminent le besoin de TanStack Query pour ce cas simple.

- **UI Components**: shadcn/ui + Tailwind CSS
  - **Why**: Composants prêts à l'emploi (Table, Dialog, Badge, Select, Tabs) qui couvrent 90% des besoins du dashboard. Customisable sans vendor lock-in.
  - **Trade-off**: Pas de composants "email preview" — le rendu HTML sera fait via iframe/dangerouslySetInnerHTML.

- **Icônes**: Lucide React (inclus avec shadcn/ui)

### State Management

- **Global State**: React hooks uniquement (`useState`, `useContext`)
  - **Why**: Dashboard single-user avec peu d'état côté client. Le projet sélectionné sera dans l'URL. Zustand serait du over-engineering ici.
  - **Challenge "Do you really need Zustand?"**: Non. Le seul état global est le projet actif, géré par l'URL.

- **Server State**: Server Components + `revalidatePath`
  - **Why**: Les données (feedbacks, subscribers) sont lues via Server Components. Les mutations via Server Actions appellent `revalidatePath` pour rafraîchir. Pas besoin de TanStack Query.
  - **Challenge "Do you really need TanStack Query?"**: Non. Pas de pagination infinie, pas de cache complexe, pas de polling. `revalidatePath` suffit.

- **URL State**: Paramètres de route natifs Next.js
  - **Why**: Le projet actif = segment d'URL (`/dashboard/[project]/feedbacks`). Les filtres (statut, catégorie) = search params. Pas besoin de nuqs pour ce niveau de complexité.
  - **Challenge "Do you really need nuqs?"**: Non. `useSearchParams` natif + `useRouter` suffisent pour les filtres simples.

### Data Fetching Strategy

```
Server Components (lecture) → Supabase JS client (service_role côté serveur)
Server Actions (écriture) → Supabase JS client → revalidatePath
```

Pattern : **Server-first**. Les pages sont des Server Components qui fetch les données directement. Aucun client-side fetching sauf pour le preview HTML de la newsletter (interaction locale).

---

## Backend Architecture

### API Layer

- **Pattern**: Server Actions uniquement (pas d'API Routes)
  - **Why**: Toutes les mutations sont des actions utilisateur (marquer un feedback, envoyer une newsletter). Server Actions = co-localisées avec les composants, typées de bout en bout, pas de fetch client à écrire.
  - **Trade-off**: Pas d'API externe exposée. Si besoin futur d'une API publique, il faudra ajouter des Route Handlers.
  - **Challenge "Why not API Routes?"**: Pas de consommateur externe. Les Server Actions sont plus simples et sécurisées par défaut.

- **Validation**: Zod v4
  - **Why**: Validation des inputs Server Actions (template HTML, catégorie feedback). Léger, standard dans l'écosystème Next.js.

- **Sécurité Server Actions**: next-safe-action
  - **Why**: Middleware d'authentification centralisé pour toutes les Server Actions. Évite de répéter le check auth dans chaque action.
  - **Trade-off**: Dépendance supplémentaire, mais élimine une classe entière de bugs (actions non protégées).

### Authentication & Authorization

- **Provider**: Supabase Auth
  - **Why**: Déjà actif sur l'instance existante. Zéro configuration supplémentaire. Cookie-based auth avec le middleware `@supabase/ssr`.
  - **Trade-off**: Couplage à Supabase. Mais comme toute la data est dans Supabase, c'est cohérent.
  - **Challenge "Why not Better Auth?"**: Better Auth nécessiterait une DB séparée pour les sessions et ajouterait de la complexité pour un cas d'usage trivial (un seul utilisateur).

- **Method**: Email/password (admin unique)
  - Création du compte admin manuellement dans Supabase Dashboard
  - Pas de page d'inscription — login uniquement

- **Authorization**: Middleware Next.js + RLS Supabase
  - Middleware Next.js : redirige vers `/login` si pas de session
  - RLS Supabase : protection au niveau DB (l'utilisateur authentifié accède à tout)
  - Pas de rôles, pas de RBAC — un seul admin

### Database & Data Layer

- **Database**: Supabase PostgreSQL (instance `Newsletter-assembly`, projet `cfjvbeinhpykvtkkpwmy`)
  - **Why**: Les données existent déjà. Les tables `feedback` et `newsletter_subscribers` sont en production avec des données réelles.
  - **Trade-off**: Dépendance totale à une seule instance Supabase. Acceptable pour un outil personnel.

- **Data Access**: @supabase/supabase-js + @supabase/ssr
  - **Why**: Client natif, typé, supporte RLS, intégré avec l'auth. Pas besoin d'ORM — les requêtes sont simples (SELECT avec filtres, UPDATE status).
  - **Challenge "Why not Prisma/Drizzle?"**: Les requêtes sont toutes simples (pas de joins complexes). Un ORM ajouterait un schéma à maintenir en sync avec Supabase, un build step, et de la complexité pour zéro bénéfice.

- **Types**: Générés automatiquement via `supabase gen types typescript`

#### Schéma de données existant

```
newsletter_subscribers (existante - 45 rows)
├── id: uuid (PK)
├── email: text (unique)
├── first_name: text (nullable)
├── project: text
├── newsletter_approval: boolean (default true)
└── created_at: timestamptz

feedback (existante - 3 rows)
├── id: uuid (PK)
├── message: text
├── email: text (nullable)
├── app_version: text
├── device_platform: text (nullable)
├── project: text (default 'mitsitsy')
└── created_at: timestamptz
```

#### Migrations nécessaires

**Migration 1 : Ajouter status et category à feedback**
```sql
ALTER TABLE feedback
  ADD COLUMN status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'treated')),
  ADD COLUMN category text DEFAULT NULL
    CHECK (category IN ('bug', 'feature', 'question', 'other'));
```

**Migration 2 : Créer la table newsletter_templates**
```sql
CREATE TABLE newsletter_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project text NOT NULL,
  name text NOT NULL,
  html_content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE newsletter_templates ENABLE ROW LEVEL SECURITY;
```

**Migration 3 : Créer la table projects (registre des projets)**
```sql
CREATE TABLE projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Seed avec le projet existant
INSERT INTO projects (slug, name) VALUES ('mitsitsy', 'Mitsitsy');
```

**Migration 4 : Table newsletter_sends (historique d'envoi)**
```sql
CREATE TABLE newsletter_sends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project text NOT NULL,
  template_id uuid REFERENCES newsletter_templates(id),
  subject text NOT NULL,
  recipients_count integer NOT NULL,
  sent_at timestamptz DEFAULT now()
);

ALTER TABLE newsletter_sends ENABLE ROW LEVEL SECURITY;
```

### Email Integration

- **Provider**: Resend API (temporaire — MVP uniquement)
  - **Why**: API simple, SDK TypeScript, rapide à intégrer pour le MVP.
  - **Trade-off**: Dépendance externe payante à terme. Sera remplacé par un système d'envoi custom (SMTP direct ou AWS SES) dans une version future.
  - **Future**: Construire notre propre système d'envoi d'emails pour éliminer la dépendance à Resend. Prévoir une abstraction légère dès le MVP pour faciliter la migration.

- **Pattern d'envoi**:
  - Batch send via `resend.batch.send()` (jusqu'à 100 emails par appel API)
  - Envoi depuis une Server Action avec progress feedback
  - Pas de queue/background job pour le MVP — envoi synchrone acceptable pour < 100 destinataires

- **Abstraction email** : Créer un `lib/email.ts` avec une interface simple (`sendBatch(emails, subject, html)`) pour découpler le code métier du provider. La migration future vers un système custom ne touchera que ce fichier.

---

## Infrastructure & Deployment

- **Platform**: Vercel
  - **Why**: Déploiement natif Next.js, preview deployments, serverless functions. Free tier suffisant.
  - **Trade-off**: Vendor lock-in léger sur les optimisations Next.js. Acceptable.

- **Region Strategy**: Single region (eu-central-1, même région que Supabase)
  - **Why**: Un seul utilisateur, latence non critique. Multi-region = complexité inutile.

- **Environment Variables**:
  ```
  NEXT_PUBLIC_SUPABASE_URL=https://cfjvbeinhpykvtkkpwmy.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
  SUPABASE_SERVICE_ROLE_KEY=xxx
  RESEND_API_KEY=xxx
  RESEND_FROM_EMAIL=xxx
  ```

- **Background Jobs**: Pas nécessaire pour le MVP
  - **Challenge "Do you need Inngest?"**: Non. L'envoi de newsletter à < 100 destinataires est synchrone. Si scaling post-MVP (scheduling, webhooks), alors Inngest deviendra pertinent.

- **Monitoring**: Vercel Analytics (intégré) + Sentry (optionnel post-MVP)
  - **Why**: Vercel Analytics = gratuit et zéro config. Sentry = overkill pour un outil perso en MVP.

---

## Architecture Decision Records

### ADR-001: Supabase JS client plutôt qu'un ORM

- **Context**: Les données existent dans Supabase. Il faut choisir comment y accéder depuis Next.js.
- **Decision**: Utiliser `@supabase/supabase-js` directement, sans ORM.
- **Alternatives**: Prisma (DX supérieure avec autocomplétion), Drizzle (performances).
- **Rationale**: Les requêtes sont simples (SELECT/UPDATE avec filtres). Un ORM ajouterait un schéma dupliqué à maintenir, un build step supplémentaire (`prisma generate`), et une couche d'abstraction sans valeur ajoutée. Les types Supabase générés via CLI donnent le même niveau de type-safety.
- **Consequences**: Pas d'autocomplétion des requêtes dans l'IDE (mitigé par les types générés). Migration vers un ORM possible si les requêtes se complexifient.

### ADR-002: Server Actions uniquement, pas d'API Routes

- **Context**: ProjectHub est un dashboard sans consommateur externe.
- **Decision**: Toutes les mutations passent par des Server Actions protégées via next-safe-action.
- **Alternatives**: API Routes (REST), tRPC.
- **Rationale**: Server Actions = co-localisées, typées, pas de fetch client à écrire. next-safe-action centralise l'auth et la validation Zod. Aucun client externe n'a besoin d'une API.
- **Consequences**: Pas d'API réutilisable. Si besoin futur (app mobile, intégrations), il faudra ajouter des Route Handlers.

### ADR-003: Pas de TanStack Query ni Zustand

- **Context**: Dashboard simple, single-user, pas de real-time.
- **Decision**: Server Components pour la lecture, `revalidatePath` pour la mise à jour, URL params pour les filtres.
- **Alternatives**: TanStack Query (cache + revalidation), Zustand (état global).
- **Rationale**: Zéro état client complexe. Le seul "état global" est le projet actif (dans l'URL). Les Server Components fetch les données à chaque navigation — le cache Next.js suffit.
- **Consequences**: Pas d'optimistic updates. Après une mutation, la page revalide côté serveur. Acceptable pour un outil perso avec un seul utilisateur.

### ADR-004: Projet actif dans l'URL plutôt qu'en state

- **Context**: Le project switcher change le contexte de tout le dashboard.
- **Decision**: Le projet actif est un segment d'URL dynamique : `/dashboard/[projectSlug]/feedbacks`.
- **Alternatives**: Context React, Zustand store, cookie.
- **Rationale**: URL = bookmarkable, shareable, pas de state perdu au refresh. Les Server Components accèdent directement au `params.projectSlug` sans client-side state.
- **Consequences**: Chaque switch de projet = navigation (pas instantané). Acceptable car chargement < 1s (objectif PRD).

### ADR-005: Preview newsletter via iframe sandboxé

- **Context**: L'utilisateur colle du HTML/CSS custom pour sa newsletter et veut voir un preview.
- **Decision**: Rendu dans un `<iframe srcDoc={html} sandbox>` côté client.
- **Alternatives**: `dangerouslySetInnerHTML` (risque XSS), service de rendu externe.
- **Rationale**: iframe sandboxé isole le CSS/JS du template du reste de l'app. Pas de risque d'injection. Rendu fidèle.
- **Consequences**: Certains email clients rendent différemment d'un iframe — le preview n'est pas parfait. Acceptable pour le MVP.

---

## Folder Structure

```
project-hub/
├── docs/
│   ├── PRD.md
│   └── ARCHI.md
├── src/
│   ├── app/
│   │   ├── layout.tsx                    # Root layout (fonts, providers)
│   │   ├── login/
│   │   │   └── page.tsx                  # Page de login
│   │   └── dashboard/
│   │       └── [projectSlug]/
│   │           ├── layout.tsx            # Sidebar + Project Switcher
│   │           ├── page.tsx              # Redirect vers feedbacks
│   │           ├── feedbacks/
│   │           │   └── page.tsx          # Liste + détail feedbacks
│   │           ├── subscribers/
│   │           │   └── page.tsx          # Liste des abonnés
│   │           └── newsletter/
│   │               └── page.tsx          # Templates + preview + envoi
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts                # Client navigateur (anon key)
│   │   │   ├── server.ts                # Client serveur (service_role)
│   │   │   └── middleware.ts             # Helper auth middleware
│   │   ├── resend.ts                     # Client Resend configuré
│   │   └── types/
│   │       └── database.ts              # Types générés par Supabase CLI
│   ├── actions/
│   │   ├── feedback.actions.ts           # Marquer traité, catégoriser
│   │   ├── newsletter.actions.ts         # Envoyer newsletter, sauver template
│   │   └── safe-action.ts               # Config next-safe-action (auth middleware)
│   ├── components/
│   │   ├── ui/                           # shadcn/ui components
│   │   ├── project-switcher.tsx          # Sélecteur de projet (sidebar)
│   │   ├── feedback-list.tsx             # Table des feedbacks avec filtres
│   │   ├── feedback-detail.tsx           # Détail d'un feedback (dialog)
│   │   ├── subscriber-list.tsx           # Table des abonnés
│   │   ├── newsletter-editor.tsx         # Zone de saisie HTML + sauvegarde template
│   │   ├── newsletter-preview.tsx        # iframe sandboxé pour preview
│   │   └── newsletter-send.tsx           # Confirmation + envoi
│   └── middleware.ts                     # Auth check global (redirect /login)
├── .env.local
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Cost Estimation

### Monthly Cost (MVP, usage actuelle)

| Service | Plan | Coût |
|---------|------|------|
| Supabase | Free (déjà en cours) | $0 |
| Vercel | Hobby (gratuit) | $0 |
| Resend | Free (100 emails/jour, 3000/mois) | $0 |
| **Total** | | **$0/mois** |

### Limites du Free Tier

| Service | Limite | Impact |
|---------|--------|--------|
| Supabase Free | 500 MB DB, 1 GB storage, 50k auth users | Largement suffisant |
| Vercel Hobby | 100 GB bandwidth, 10s serverless timeout | OK pour single-user |
| Resend Free | 100 emails/jour, 3000/mois | OK pour < 100 abonnés par newsletter |

### Scaling (si besoin futur)

| Service | Plan Pro | Coût |
|---------|----------|------|
| Supabase Pro | 8 GB DB, daily backups | $25/mois |
| Vercel Pro | Higher limits | $20/mois |
| Resend Pro | 50k emails/mois | $20/mois |
| **Total scalé** | | **~$65/mois** |

---

## Implementation Priority

### Phase 1 : Foundation (Jour 1 — matin)
1. Initialiser le projet Next.js 15 + Tailwind + shadcn/ui
2. Configurer Supabase client (`@supabase/supabase-js` + `@supabase/ssr`)
3. Générer les types TypeScript depuis Supabase
4. Implémenter l'authentification (login page + middleware)
5. Appliquer les migrations DB (status/category sur feedback, table projects, table templates)

### Phase 2 : Core Features (Jour 1 — après-midi)
1. Layout dashboard avec sidebar + project switcher
2. Page feedbacks : liste, filtres (statut/catégorie), marquer comme traité, catégoriser
3. Page subscribers : liste des abonnés du projet avec compteur

### Phase 3 : Newsletter (Jour 2)
1. Éditeur HTML : zone de saisie + sauvegarde en template
2. Preview iframe sandboxé
3. Intégration Resend : envoi batch à tous les abonnés du projet
4. Historique d'envoi (table newsletter_sends)
5. Confirmation d'envoi + feedback utilisateur

### Phase 4 : Polish (Jour 2 — fin)
1. Responsive / UX ajustements
2. Gestion d'erreurs (toast notifications)
3. Deploy sur Vercel
4. Test end-to-end du flow complet

---

## Dependencies

```json
{
  "dependencies": {
    "next": "^15",
    "react": "^19",
    "react-dom": "^19",
    "@supabase/supabase-js": "^2",
    "@supabase/ssr": "^0.5",
    "next-safe-action": "^7",
    "zod": "^3",
    "resend": "^4",
    "lucide-react": "latest",
    "class-variance-authority": "latest",
    "clsx": "latest",
    "tailwind-merge": "latest"
  },
  "devDependencies": {
    "typescript": "^5",
    "tailwindcss": "^4",
    "@tailwindcss/postcss": "latest",
    "supabase": "latest"
  }
}
```
