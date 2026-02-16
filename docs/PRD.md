# Product Requirements Document: ProjectHub

## Product Vision

**Problem Statement**
En tant que développeur solo gérant plusieurs projets connectés à Supabase, les feedbacks clients sont éparpillés dans des tables Supabase consultées manuellement, et l'envoi de newsletters nécessite d'exporter les emails à la main. Il n'existe aucune vue centralisée pour suivre les retours clients et communiquer avec les abonnés, projet par projet.

**Solution**
ProjectHub est un dashboard personnel qui centralise les feedbacks et la gestion des newsletters de tous les projets Supabase en un seul endroit. Il permet de switcher entre projets, traiter les feedbacks, et envoyer des newsletters via des templates HTML/CSS custom avec preview — le tout sans jamais ouvrir Supabase directement.

**Success Criteria**
- Zéro ouverture de Supabase pour consulter les feedbacks
- Envoi d'une newsletter en moins de 5 minutes (template → preview → envoi)
- 100% des feedbacks traités via le dashboard (plus aucun oublié dans les tables)

## Target Users

### Primary Persona: Raymond — Développeur Solo Multi-Projets
- **Role**: Développeur indépendant gérant 2+ projets SaaS/web
- **Pain Points**:
  - Consulte les feedbacks directement dans les tables Supabase (friction, pas de workflow)
  - Exporte manuellement les emails pour envoyer des newsletters
  - Aucune vue centralisée : doit switcher entre projets dans Supabase
  - Pas de suivi structuré des feedbacks (traité/non traité)
- **Motivations**: Gagner du temps, ne rien rater, communiquer efficacement avec ses utilisateurs
- **Goals**: Un seul outil pour lire les feedbacks, les traiter, et envoyer des newsletters par projet

## Core Features (MVP)

### Must-Have Features

#### 1. Project Switcher
**Description**: Permet de naviguer entre les différents projets depuis le dashboard. Chaque projet affiche ses propres feedbacks et abonnés. Le contexte (feedbacks, abonnés, templates) change dynamiquement selon le projet sélectionné.
**User Value**: Vue isolée par projet — plus besoin de filtrer manuellement dans Supabase.
**Success Metric**: Switch de projet en 1 clic, chargement < 1 seconde.

#### 2. Dashboard Feedbacks
**Description**: Affiche tous les feedbacks du projet sélectionné dans une liste structurée. Chaque feedback peut être marqué comme "traité" ou "non traité", et catégorisé (bug, feature request, question, autre). Filtres par statut et catégorie.
**User Value**: Workflow clair pour traiter les feedbacks — plus rien ne passe entre les mailles du filet.
**Success Metric**: 100% des feedbacks visibles et actionnables sans ouvrir Supabase.

#### 3. Gestion des Abonnés
**Description**: Liste les abonnés (emails) du projet sélectionné, récupérés depuis Supabase. Affiche le nombre total d'abonnés par projet. Permet de voir la liste complète pour vérification avant envoi.
**User Value**: Vision claire de l'audience de chaque projet avant d'envoyer une newsletter.
**Success Metric**: Liste des abonnés affichée en temps réel, synchronisée avec Supabase.

#### 4. Newsletter avec Templates HTML/CSS + Preview
**Description**: Permet d'uploader ou coller un template HTML/CSS par projet. Affiche un preview du rendu de l'email avant envoi. Envoi de la newsletter à tous les abonnés du projet sélectionné via Resend.
**User Value**: Contrôle total sur le design des emails, preview pour éviter les erreurs, envoi en quelques clics.
**Success Metric**: Envoi d'une newsletter complète en moins de 5 minutes (upload template → preview → envoi).

#### 5. Authentification
**Description**: Login sécurisé via Supabase Auth (email/password). Accès réservé à l'administrateur unique. Protection de toutes les routes du dashboard.
**User Value**: Dashboard sécurisé accessible depuis n'importe où.
**Success Metric**: Aucun accès non authentifié possible.

### Should-Have Features (Post-MVP)
- **Analytics email**: Taux d'ouverture, taux de clic, bounces via Resend webhooks
- **Scheduling**: Programmer l'envoi d'une newsletter à une date/heure précise
- **Réponse aux feedbacks**: Répondre directement à un feedback par email depuis le dashboard
- **Templates sauvegardés**: Bibliothèque de templates réutilisables par projet
- **Export des données**: Export CSV des feedbacks et abonnés

## User Flows

### Flow 1 : Consulter et traiter les feedbacks
1. Login au dashboard
2. Sélectionner un projet via le switcher
3. Voir la liste des feedbacks (les non traités en premier)
4. Cliquer sur un feedback pour voir le détail
5. Catégoriser (bug / feature request / question / autre)
6. Marquer comme traité

### Flow 2 : Envoyer une newsletter
1. Login au dashboard
2. Sélectionner un projet via le switcher
3. Aller dans la section Newsletter
4. Coller ou uploader le template HTML/CSS
5. Voir le preview du rendu
6. Confirmer et envoyer à tous les abonnés du projet
7. Voir la confirmation d'envoi

## Out of Scope (v1)

Explicitement NON inclus dans le MVP :
- Analytics d'emails (ouvertures, clics, bounces)
- Scheduling / programmation d'envoi
- Gestion d'équipe / multi-utilisateurs
- Éditeur drag & drop d'emails
- Réponse aux feedbacks depuis le dashboard
- Notifications push / temps réel
- Import/export de listes d'abonnés
- Gestion de désabonnement (géré côté projet)

## Open Questions
- Structure exacte des tables Supabase existantes (feedbacks, subscribers) — à mapper lors de l'architecture
- Limites de Resend sur le plan actuel (nombre d'emails/jour)
- Faut-il supporter plusieurs templates par projet ou un seul actif à la fois ?

## Success Metrics

**Primary Metrics**:
- **Zéro accès Supabase** : Toutes les consultations de feedbacks passent par ProjectHub
- **Temps d'envoi newsletter < 5 min** : Du template au send en moins de 5 minutes

**Secondary Metrics**:
- **Taux de feedbacks traités** : 100% des feedbacks marqués comme traités sous 48h
- **Fréquence d'utilisation** : Dashboard ouvert au moins 1x/jour

## Timeline & Milestones
- **MVP Completion**: Ce weekend (2 jours)
- **Jour 1**: Auth + Project Switcher + Dashboard Feedbacks
- **Jour 2**: Gestion Abonnés + Newsletter (templates + preview + envoi)

## Technical Stack
- **Frontend**: Next.js, Tailwind CSS, shadcn/ui
- **Backend/DB**: Supabase (PostgreSQL + Auth)
- **Email**: Resend
- **Deployment**: À définir (Vercel recommandé)
