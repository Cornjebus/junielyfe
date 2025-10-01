# Implementation Plan: Junielyfe MVP

**Branch**: `001-create-a-complete` | **Date**: 2025-09-29 | **Spec**: [spec.md](./spec.md)

---

## 🚀 Quick Start Runbook

```bash
# Initial setup
pnpm install
cp .env.example .env.local
# Add your environment variables to .env.local

# Development
pnpm dev              # Start all apps (web on :3000, worker on :3001)
pnpm db:migrate       # Run Supabase migrations
pnpm db:seed          # Seed development data
pnpm test             # Run all tests
pnpm lint             # Lint all packages
pnpm typecheck        # TypeScript checks

# Database
pnpm db:studio        # Open Supabase Studio (localhost:54323)
pnpm db:reset         # Reset database (dev only)

# Deployment
git push              # Triggers CI → Vercel preview deploy on PR
# Merge to main → auto-deploy to production
```

---

## Summary

Junielyfe is a career & finance copilot that helps users navigate the AI economy. It ingests LinkedIn data, résumé, and personal narrative, captures goals, asks adaptive questions (5/10/20 depth), generates 8–12 research-backed ideas, and creates 4-week actionable plans with auto-generated artifacts. Progress is gamified with XP, streaks, and badges. The MVP targets 40% activation rate (signup → plan) within first session, <20s LLM tasks with streaming, and full WCAG 2.1 AA accessibility.

**Tech Approach**: TypeScript monorepo (Turborepo) with Next.js 15 frontend (Vercel), Clerk authentication, Supabase backend (Postgres + Storage + RLS), background workers (Railway/Render + QStash), GPT-5-nano for MVP AI synthesis (swap to Perplexity Research API post-launch), PostHog analytics, Vitest + Playwright testing.

---

## Technical Context

**Language/Version**: TypeScript 5.3+, Node 20.x LTS
**Primary Dependencies**: Next.js 15 (App Router), React 19, Tailwind CSS, shadcn/ui, Supabase Client, OpenAI SDK, Zod, PostHog
**Storage**: Supabase Postgres 15 with Row-Level Security (RLS); Supabase Storage for résumés
**Testing**: Vitest (unit), Playwright (e2e), MSW (API mocks), golden fixtures for LLM outputs
**Target Platform**: Web (Vercel), background worker (Railway/Render)
**Project Type**: Web application (monorepo: frontend + shared packages + background worker)
**Performance Goals**: P95 <1.5s for interactive routes (non-LLM); LLM tasks <20s with streaming; first token <2s
**Constraints**: WCAG 2.1 AA compliance; PII redaction before LLM calls; export/delete within 10s/24h; 99.5% uptime target
**Scale/Scope**: MVP targets 100 users completing 4-week plans; 1000 req/min API capacity

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Constitutional Compliance Matrix

| Principle | Requirement | Compliance Strategy |
|-----------|-------------|---------------------|
| **I. User-Defined Goals** | Capture authentic goals in user's words; validate clarity but never reject ambition | Goal form with free-text + validation for vagueness (not limits); UI feedback "be more specific" not "too ambitious" |
| **II. Transparent Reasoning** | "Why this fits" cites specific user inputs + research evidence | Prompt engineering: reference `profile.skills`, `goal.target`, `research.sources[]`; display sources inline |
| **III. Realistic & Ethical Ideas** | Exclude MLM, crypto day-trading, gambling, unlicensed advice; flag >20 hrs/week | Hard-coded exclusion list in prompt system message; post-generation keyword filter; "intensive" badge for >20 hrs |
| **IV. Measurable Outcomes** | Concrete outcomes in 4–12 weeks (no vague "improve skills") | Prompt template enforces format: "Within [X] weeks, [measurable outcome]"; validation rejects vague outputs |
| **V. Companion Tone** | Supportive, non-judgmental microcopy; no corporate jargon | Microcopy review checklist; examples: "Let's map out..." not "Unlock your potential..." |
| **VI. Adaptive Questioning** | 5/10/20 depth choice; skip logic + clarifying follow-ups | Question engine in `packages/core/questionnaire`: branching logic based on `answer.length` and `goal.type` |
| **VII. Research-Backed Ideas** | Validate against BLS, LinkedIn data, case studies; cache ≥7 days; flag assumptions | Research cache table with `expires_at`; prompt includes `research.sources[]`; "exploratory" flag if incomplete |
| **VIII. 4-Week Plans** | Weekly milestones, artifacts, gamification; editable | Plan generator in `packages/agents`: 4-week template + task list; RLS allows user edits |
| **IX. Consent Per Data Source** | Explicit consent for LinkedIn, résumé, narrative; proceed with partial data | Consent checkboxes per source; DB `profiles.consents` JSONB; skip logic allows partial profiles |
| **X. PII Minimization** | Redact addresses, phone, SSN, birthdates before LLM calls | Server-side redaction function `redactPII()` in `packages/agents/utils`; unit tests verify removal |
| **XI. Per-User Data Isolation** | RLS on all tables; no cross-user queries | Supabase RLS policies: `auth.uid() = user_id` on every table; integration tests verify isolation |
| **XII. Export Anytime** | JSON/PDF export within 10s; no limits | API route `/api/export` generates bundle; async job if >10s; Resend email with link |
| **XIII. Delete My Data (24h)** | Permanent deletion within 24h; backup purge within 30 days | Soft delete → scheduled job purges after 24h; document backup purge SOP |
| **XIV. Audit Logs ≤30 Days** | Logs retained ≤30 days; no PII except hashed user_id | PostHog auto-purges after 30 days; custom logger redacts PII fields |
| **XV. WCAG 2.1 AA** | Color contrast ≥4.5:1; keyboard nav; screen reader compat | axe-core in CI; Tailwind tokens enforce contrast; semantic HTML + ARIA |
| **XVI. Mobile-First Design** | ≥375px viewport; ≥44px touch targets | Tailwind mobile-first breakpoints; button min-height: 44px |
| **XVII. Consistent Design Tokens** | Centralized colors, typography, spacing | Tailwind config + shadcn/ui theme; no hard-coded values |
| **XVIII. Clear Microcopy** | 8th-grade reading level; error messages with corrective action | Hemingway app review; error format: "Problem + how to fix" |
| **XIX. Low-Friction First Session** | Idea + plan within 10 min; interruptible; resumable | Auto-save every 30s (localStorage + DB); progress bar shows steps |
| **XX. Acceptance Criteria** | Given-When-Then per story; code review verifies | User stories doc already includes 47 ACs; PR template requires AC checklist |
| **XXI. CI Tests** | ≥70% coverage for business logic; integration tests for critical paths | Vitest coverage reports; Playwright for signup → questionnaire → ideas → plan |
| **XXII. LLM Golden Outputs** | Test fixtures with expected output patterns | `packages/agents/__tests__/fixtures/` with input/expected pairs; CI fails on degradation |
| **XXIII. Deterministic Scoring** | Same inputs → same scores; seeded randomness | Scoring functions in `packages/core/scoring` are pure; unit tests verify determinism |
| **XXIV. Canary Releases** | ≤10% rollout for major changes; 24h monitoring | Vercel feature flags + PostHog cohorts; rollback via revert + redeploy |
| **XXV. P95 <1.5s (Non-LLM)** | Interactive routes <1.5s P95; API <500ms | Vercel Analytics + PostHog tracks P95; optimize queries with indexes + caching |
| **XXVI. LLM <20s w/ Streaming** | First token <2s; complete <20s; cache repeated queries | OpenAI streaming + Server-Sent Events (SSE); Redis cache keyed by `hash(profile+goal)` |
| **XXVII. Offline Grace** | Detect offline; show cached data; preserve form inputs | `navigator.onLine` + service worker; localStorage for forms; graceful error states |
| **XXVIII. Lightweight LLM (MVP)** | GPT-5-nano for MVP; swap to Perplexity later | OpenAI SDK with model: `gpt-5-nano`; config flag for future swap |
| **XXIX. Document Sources** | Log research sources; flag assumptions | `ideas.sources` JSONB array; prompt includes `[Limited data: extrapolated from X]` |
| **XXX. Cache Research** | ≥7 days cache; invalidate after 30 days or user request | `research_cache` table with `expires_at`; cron job purges stale entries |
| **XXXI. Never Fabricate Facts** | No hallucinated stats; treat as critical bugs | Prompt system message: "Never fabricate statistics"; post-gen validation checks for suspiciously specific numbers |
| **XXXII. Core Metrics** | Activation, selection rate, time-to-outcome, 12-week retention, NPS | PostHog events + dashboards; daily batch jobs compute metrics |
| **XXXIII. No Dark Patterns** | No forced continuity, hidden costs, fake urgency, confusing unsubscribe | Design review checklist; 2-click unsubscribe; transparent pricing (free MVP) |
| **XXXIV. ADRs** | Architectural decisions documented | ADRs in `/docs/architecture/` with template; decision log in Git |
| **XXXV. Coding Standards** | ESLint + Prettier; no secrets in code; weekly npm audit | Husky pre-commit hooks; `.env.example` template; GitHub Actions runs Snyk |
| **XXXVI. Guardrails Review** | Ethical/legal review before new idea categories | Pre-launch: 2-person review of 100 sample idea sets; document findings |
| **XXXVII. MVP Scope Discipline** | Single user type; 1 core flow; no social features, no payments (except tip jar) | Backlog doc lists deferred features; PR template rejects out-of-scope additions |

**Gate Status**: ✅ PASS — No constitutional violations detected. All principles have concrete compliance strategies.

---

## Project Structure

### Documentation (this feature)
```
specs/001-create-a-complete/
├── plan.md                  # This file
├── spec.md                  # Product requirements
├── user-stories.md          # User stories + 47 acceptance criteria
├── flows.md                 # UX flows + wireframes
├── api.md                   # API specification
├── non-functional.md        # 87 NFRs
├── risk-mitigation.md       # Risks + guardrails + out-of-scope
├── metrics.md               # KPIs + analytics events
├── research.md              # Tech research (Phase 0 output — TBD)
├── data-model.md            # Database schema (Phase 1 output — TBD)
├── quickstart.md            # Developer guide (Phase 1 output — TBD)
└── contracts/               # API contracts (Phase 1 output — TBD)
```

### Source Code (repository root)
```
junielyfe/                   # Monorepo root
├── apps/
│   ├── web/                 # Next.js 15 (App Router) — Vercel
│   │   ├── app/             # Routes + layouts
│   │   ├── components/      # Page-level components
│   │   ├── lib/             # App-specific utilities
│   │   └── public/          # Static assets
│   └── worker/              # Background worker — Railway/Render
│       ├── src/
│       │   ├── jobs/        # QStash job handlers
│       │   └── index.ts     # Worker entry
│       └── package.json
├── packages/
│   ├── core/                # Business logic (idea engine, scoring, questionnaire)
│   │   ├── src/
│   │   │   ├── scoring/     # Idea scoring functions
│   │   │   ├── questionnaire/ # Adaptive question logic
│   │   │   └── utils/       # Shared utilities
│   │   └── package.json
│   ├── db/                  # Supabase types, Zod schemas, SQL helpers
│   │   ├── src/
│   │   │   ├── schema.ts    # Zod schemas
│   │   │   ├── types.ts     # Generated Supabase types
│   │   │   └── client.ts    # Supabase client wrapper
│   │   └── package.json
│   ├── agents/              # Research + artifact generators (LLM)
│   │   ├── src/
│   │   │   ├── idea-generator.ts
│   │   │   ├── plan-generator.ts
│   │   │   ├── artifact-generator.ts
│   │   │   ├── research-agent.ts
│   │   │   └── prompts/     # LLM prompt templates
│   │   └── package.json
│   └── ui/                  # Shared components (shadcn/ui + custom)
│       ├── src/
│       │   ├── components/  # Button, Input, Card, etc.
│       │   ├── hooks/       # useToast, useAuth, etc.
│       │   └── styles/      # Global CSS + Tailwind config
│       └── package.json
├── supabase/
│   ├── migrations/          # SQL migration files
│   ├── seed.sql             # Development seed data
│   └── config.toml          # Supabase config
├── .github/
│   └── workflows/
│       ├── ci.yml           # Lint + typecheck + test
│       └── deploy.yml       # Vercel + worker deploy
├── docs/
│   └── architecture/        # ADRs (Architecture Decision Records)
├── .env.example             # Environment variable template
├── turbo.json               # Turborepo pipeline config
├── package.json             # Root workspace config
└── pnpm-workspace.yaml      # pnpm workspace definition
```

**Structure Decision**: Web application architecture (Option 2) with Turborepo monorepo. `apps/web` (Next.js frontend) and `apps/worker` (background jobs) share logic via `packages/*`. Supabase handles auth, database (Postgres with RLS), and storage. Deployed separately: web on Vercel, worker on Railway/Render.

---

## 6-Week MVP Milestones

### Milestone 0: Project Setup & Guardrails (Week 1)
**Goal**: Initialize monorepo, CI/CD, database schema, auth, and compliance tooling

### Milestone 1: Ingest → Goal → Quick(5) → Idea Gen v1 (Weeks 2–3)
**Goal**: Core flow Part 1 — user can create profile, set goal, answer 5 questions, see 8–12 ideas

### Milestone 2: Selection → 4-Week Plan → Core Artifacts (Weeks 4–5)
**Goal**: Core flow Part 2 — user selects ideas, gets plan with tasks, and 5 auto-generated artifacts

### Milestone 3: Gamification, Check-ins, Analytics & Polish (Week 6)
**Goal**: XP/levels/streaks, weekly check-ins, analytics events, accessibility audit, launch readiness

---

## Milestone 0: Project Setup & Guardrails (Week 1)

### Epic 0.1: Monorepo Initialization
**Size**: M | **Priority**: P0 | **Labels**: `type:chore`, `area:infra`

**Issues**:
- [ ] **M0-001**: Initialize Turborepo with pnpm workspaces (apps/web, apps/worker, packages/core, packages/db, packages/agents, packages/ui)
  - Set up `turbo.json` pipeline (build, dev, lint, test, typecheck)
  - Configure TypeScript path aliases (`@junielyfe/core`, `@junielyfe/db`, etc.)
  - Add shared ESLint + Prettier configs (`eslint-config-custom`, `tsconfig`)
  - **Acceptance**: `pnpm dev` starts all apps; `pnpm lint` passes; `pnpm typecheck` passes

- [ ] **M0-002**: Set up Next.js 15 app (`apps/web`) with App Router, React 19, Tailwind CSS
  - Install shadcn/ui with theme config (light/dark support)
  - Create layout with navigation stub (Home, Dashboard, Settings)
  - Configure `next.config.js` for Vercel deployment (image optimization, headers)
  - **Acceptance**: `pnpm dev` opens http://localhost:3000 with themed landing page

- [ ] **M0-003**: Set up background worker app (`apps/worker`) with QStash integration
  - Express server for webhook endpoints (`POST /jobs/:jobName`)
  - QStash client for publishing jobs (`publishJob(name, data)`)
  - Health check endpoint (`GET /health`)
  - **Acceptance**: Worker starts on :3001; health check returns 200

**Dependencies**: None
**Risks**: Turborepo config complexity; Next.js 15 + React 19 bleeding edge
**Definition of Done**: All 3 apps run concurrently; CI passes (see M0-010)

---

### Epic 0.2: Supabase Setup & Database Schema
**Size**: L | **Priority**: P0 | **Labels**: `type:chore`, `area:infra`, `area:security`

**Issues**:
- [ ] **M0-004**: Initialize Supabase project and configure local development (database only)
  - Run `supabase init`, link to cloud project
  - Configure `supabase/config.toml` (disable auth; database + storage only)
  - Add environment variables to `.env.example` (Supabase DB URL, service role key)
  - **Note**: Clerk handles authentication; Supabase provides database + RLS + storage
  - **Acceptance**: `pnpm db:studio` opens Supabase Studio (localhost:54323)

- [ ] **M0-005**: Create initial database schema with RLS policies (migration 001)
  - Tables: `users` (with `clerk_user_id` column), `profiles`, `goals`, `questionnaire_sessions`, `answers`
  - RLS policies: `clerk_user_id = current_setting('request.jwt.claim.sub')` on all tables
  - Indexes: `users.clerk_user_id` (unique), `profiles.user_id`, `goals.user_id`
  - Create `clerk_webhook_events` table for webhook logging
  - **Acceptance**: Run `pnpm db:migrate`; tables created with RLS enabled; integration test verifies cross-user isolation with Clerk user IDs

- [ ] **M0-006**: Generate TypeScript types from Supabase schema (`packages/db`)
  - Run `supabase gen types typescript` → `packages/db/src/types.ts`
  - Create Zod schemas for validation (`packages/db/src/schema.ts`)
  - Export Supabase client wrapper with typed methods
  - **Acceptance**: Import `@junielyfe/db/client` in Next.js; autocomplete works for table names + columns

- [ ] **M0-007**: Configure Clerk webhooks to sync users to Supabase
  - Create webhook endpoint `/api/webhooks/clerk` in Next.js app
  - Handle `user.created`, `user.updated`, `user.deleted` events
  - Sync Clerk user data to Supabase `users` table (clerk_user_id, email, metadata)
  - Implement webhook signature verification with `CLERK_WEBHOOK_SECRET`
  - Add error handling + retry logic for failed syncs
  - Create background job to reconcile orphaned users (optional)
  - **Acceptance**: User signs up in Clerk → webhook delivers → user record created in Supabase with matching `clerk_user_id`; verify in Supabase Studio

**Dependencies**: M0-001 (monorepo init), M0-002 (Next.js app with Clerk)
**Risks**: RLS policy bugs causing data leaks; Clerk webhook delivery failures causing orphaned users; webhook signature verification bypass
**Definition of Done**: Database schema deployed; RLS tested with Clerk user context; webhook sync verified; Clerk → Supabase user flow functional

---

### Epic 0.3: CI/CD & Quality Gates
**Size**: M | **Priority**: P0 | **Labels**: `type:chore`, `area:infra`

**Issues**:
- [ ] **M0-008**: Set up GitHub Actions CI workflow (`ci.yml`)
  - Jobs: `lint`, `typecheck`, `test-unit`, `test-integration`, `build`
  - Run on PR open/push; cache pnpm store
  - Fail PR if any job fails
  - **Acceptance**: Push to PR triggers CI; all jobs pass; PR status check shows ✅

- [ ] **M0-009**: Configure Vercel preview deploys for PRs
  - Link GitHub repo to Vercel project
  - Set environment variables (Supabase, OpenAI, PostHog, etc.)
  - Enable automatic preview deploys on PR open
  - **Acceptance**: PR comment includes Vercel preview link; preview works

- [ ] **M0-010**: Set up Husky + commitlint for Conventional Commits
  - Install Husky, commitlint with `@commitlint/config-conventional`
  - Pre-commit hook: `pnpm lint-staged` (runs ESLint + Prettier on changed files)
  - Commit-msg hook: Validate format (e.g., `feat(area): message`)
  - **Acceptance**: Invalid commit message rejected; dirty files blocked until formatted

- [ ] **M0-011**: Configure Snyk for weekly dependency audits
  - Add Snyk GitHub Action to `ci.yml` (runs on schedule: weekly)
  - Set up Slack/email alerts for high/critical vulnerabilities
  - **Acceptance**: Snyk scan runs weekly; alerts received for test vulnerability

**Dependencies**: M0-001, M0-002
**Risks**: CI flakiness; Vercel env var misconfiguration
**Definition of Done**: CI passes on all PRs; preview deploys work; commits follow standards

---

### Epic 0.4: PII Redaction & Security Utils
**Size**: S | **Priority**: P0 | **Labels**: `type:feature`, `area:security`

**Issues**:
- [ ] **M0-012**: Implement server-side PII redaction function (`packages/agents/utils/redact-pii.ts`)
  - Redact: addresses (regex), phone numbers (regex), SSN (regex), full birthdates (keep year only)
  - Unit tests: 100 sample résumé texts (verify 100% PII removal)
  - Export `redactPII(text: string): string`
  - **Acceptance**: Unit tests pass; function removes all PII from test samples

- [ ] **M0-013**: Create secure secrets management utility (`packages/db/src/secrets.ts`)
  - Helper functions: `getEnvVar(key: string, required: boolean)`, `validateEnvVars()`
  - Throw error on missing required vars (fail fast at startup)
  - **Acceptance**: Missing `OPENAI_API_KEY` throws error on app start; all required vars validated

**Dependencies**: M0-001
**Risks**: Regex false positives/negatives; performance overhead
**Definition of Done**: PII redaction tested + integrated; env var validation enforced

---

### Epic 0.5: PostHog Analytics Setup
**Size**: XS | **Priority**: P1 | **Labels**: `type:chore`, `area:analytics`

**Issues**:
- [ ] **M0-014**: Integrate PostHog SDK (`apps/web`)
  - Install `posthog-js`, configure in `app/providers.tsx`
  - Set up event types (`clerk.signup`, `clerk.login`, `ingest.resume_uploaded`, etc.)
  - Add environment variables (POSTHOG_PUBLIC_KEY, POSTHOG_HOST)
  - Integrate with Clerk: track `clerk_user_id` on all events
  - **Acceptance**: `posthog.capture('test_event')` appears in PostHog dashboard with Clerk user ID

**Dependencies**: M0-002
**Risks**: Privacy concerns if PII logged (mitigate: review event payloads)
**Definition of Done**: PostHog tracks basic events (page views, signup, login)

---

## Milestone 1: Ingest → Goal → Quick(5) → Idea Gen v1 (Weeks 2–3)

### Epic 1.1: User Profile Ingestion (LinkedIn, Résumé, Narrative)
**Size**: L | **Priority**: P0 | **Labels**: `type:feature`, `area:ingest`

**Issues**:
- [ ] **M1-001**: LinkedIn OAuth integration (via Clerk)
  - Configure LinkedIn OAuth provider in Clerk dashboard
  - Add LinkedIn OAuth button using Clerk's `<SignIn>` component
  - Access LinkedIn data via Clerk's `user.externalAccounts` API
  - Store LinkedIn public profile URL in `profiles.linkedin_profile_url`
  - **Note**: Clerk handles OAuth flow; no custom callback route needed
  - **Acceptance**: User clicks "Connect LinkedIn" → Clerk OAuth flow → LinkedIn account linked → profile URL saved to database

- [ ] **M1-002**: Résumé upload + parsing
  - Upload form with drag-drop (PDF/DOCX, max 5MB)
  - Store file in Supabase Storage (`resumes/` bucket with RLS policy)
  - Call résumé parser (use library: `pdf-parse` for PDF, `mammoth` for DOCX)
  - Extract roles, skills, education → editable fields
  - **Acceptance**: User uploads résumé → parsing completes <10s → editable profile fields populated

- [ ] **M1-003**: Narrative text area
  - Text area component (200–2000 words, live character count)
  - Auto-save to `profiles.narrative` every 30s (debounced)
  - **Acceptance**: User types narrative → auto-saves → can navigate away + return → narrative persists

- [ ] **M1-004**: Consent checkboxes per data source
  - Checkboxes: "I consent to use my LinkedIn data", "résumé", "narrative"
  - Store in `profiles.consents` (JSONB: `{linkedin: true, resume: false, narrative: true}`)
  - Allow skip (proceed with partial data)
  - **Acceptance**: User can skip LinkedIn → still proceeds to goal step; consents stored in DB

**Dependencies**: M0-005, M0-007
**Risks**: Résumé parsing accuracy <80%; LinkedIn OAuth redirect issues
**Definition of Done**: User can ingest all 3 data sources; profile saved; consent tracked

---

### Epic 1.2: Goal Capture & Validation
**Size**: M | **Priority**: P0 | **Labels**: `type:feature`, `area:goals`

**Issues**:
- [ ] **M1-005**: Goal creation form
  - Type selector: "Career Goal" or "Financial Goal"
  - Fields (career): target role/title, horizon (dropdown: 3/6/12 months)
  - Fields (financial): target income delta, horizon, current income (optional)
  - Constraints: hours/week (slider 1–40), risk tolerance (low/med/high), remote-only (checkbox), budget, ethical/industry exclusions (multi-select)
  - **Acceptance**: User fills form → submits → goal saved to `goals` table

- [ ] **M1-006**: Goal validation logic
  - Reject vague goals (regex: "be successful", "get rich", "improve") with message: "Please be more specific"
  - Flag unrealistic goals (heuristic: income delta >$500k in <6 months) with warning: "This is ambitious! Consider smaller milestones."
  - **Acceptance**: Vague goal rejected with helpful message; unrealistic goal shows warning but allows submission

**Dependencies**: M0-005
**Risks**: Validation too strict (rejects valid goals); too lenient (allows useless goals)
**Definition of Done**: Goal form functional; validation tested with 20 sample inputs

---

### Epic 1.3: Adaptive Questionnaire (Quick: 5 Questions)
**Size**: L | **Priority**: P0 | **Labels**: `type:feature`, `area:questionnaire`

**Issues**:
- [ ] **M1-007**: Questionnaire engine (`packages/core/questionnaire`)
  - Load question template based on depth (5/10/20) + goal type (career/financial)
  - Implement skip logic: if `answer.length > 50` → skip follow-up; if `< 10` → add clarifying question
  - Export `getNextQuestion(sessionId, previousAnswer): Question | null`
  - **Acceptance**: Unit tests verify skip logic works; deterministic given same inputs

- [ ] **M1-008**: Questionnaire UI (5 questions for MVP)
  - Progress bar: "Question X of 5"
  - Question text + optional (i) tooltip "Why we ask"
  - Input: text area or select (depends on question type)
  - Auto-save answer to `answers` table on submit
  - **Acceptance**: User completes 5 questions → progress saved after each → can resume if interrupted

- [ ] **M1-009**: Protected attributes enforcement
  - Validate questions do NOT ask for: age, race, gender, disability, salary history
  - Unit test: assert question list contains none of these
  - **Acceptance**: All question templates reviewed; no protected attributes requested

**Dependencies**: M0-005, M1-005
**Risks**: Skip logic bugs (infinite loops); UI confusion (unclear progress)
**Definition of Done**: User can complete 5-question questionnaire; answers saved; resumable

---

### Epic 1.4: Idea Generation v1 (LLM + Scoring)
**Size**: XL | **Priority**: P0 | **Labels**: `type:feature`, `area:ideas`

**Issues**:
- [ ] **M1-010**: Idea generator agent (`packages/agents/idea-generator.ts`)
  - LLM prompt template: input (profile, goal, answers) → output (8–12 ideas with scores, explanations, steps)
  - Prompt system message includes ethical exclusions (MLM, crypto, gambling, unlicensed advice)
  - Call OpenAI API with streaming (SSE)
  - **Acceptance**: Given test profile + goal → generates 8–12 ideas in <20s; first token <2s

- [ ] **M1-011**: Ethical filter (post-generation)
  - Keyword filter: ["MLM", "multi-level marketing", "forex", "crypto day-trading", "gambling", "sports betting", "tax preparation without CPA"]
  - Flag ideas matching keywords for manual review (pre-launch: fail; post-launch: log + skip)
  - **Acceptance**: Test idea set with "Join this MLM scheme" → filtered out; user sees 11 ideas (not 12)

- [ ] **M1-012**: Idea diversity enforcement
  - Validate generated ideas have ≥1 "employee" (full-time/part-time), ≥1 "freelance", ≥1 "builder" (micro-SaaS, content)
  - If missing category → retry generation with amended prompt
  - **Acceptance**: 100 test generations → 100% meet diversity rule (logged in CI)

- [ ] **M1-013**: Idea scoring (`packages/core/scoring`)
  - Deterministic scoring functions: `fitScore(profile, idea)`, `marketScore(idea)`, `speedScore(idea)`, `riskScore(idea)`
  - Scores 0–100; unit tested with edge cases
  - **Acceptance**: Same inputs → same scores (100 test runs); edge cases covered (empty profile, vague idea)

- [ ] **M1-014**: Idea results UI (Next.js)
  - Grid of idea cards (2 cols desktop, 1 col mobile)
  - Card: title, category badge, 4 scores (bar charts), "Why this fits" (expandable), first 3 steps (expandable), select checkbox
  - Sticky footer: "X ideas selected" + [Create Plan] button (disabled if 0 or >3)
  - **Acceptance**: User views ideas → expands "Why this fits" → selects 2 → button enabled

**Dependencies**: M0-012 (PII redaction), M1-008 (questionnaire complete)
**Risks**: LLM timeout/failure; ethical filter false positives; diversity rule unmet (retry loop)
**Definition of Done**: User sees 8–12 ideas with scores + explanations; can select 1–3; diversity + ethics enforced

---

### Epic 1.5: Research Caching
**Size**: M | **Priority**: P1 | **Labels**: `type:feature`, `area:ideas`

**Issues**:
- [ ] **M1-015**: Create `research_cache` table (migration 002)
  - Columns: `id`, `query_hash` (unique), `data` (JSONB), `sources` (TEXT[]), `expires_at` (TIMESTAMPTZ), `created_at`
  - Index: `query_hash`
  - **Acceptance**: Migration runs; table created

- [ ] **M1-016**: Implement research cache in idea generator
  - Before LLM call: check cache (`SELECT * FROM research_cache WHERE query_hash = hash(profile+goal) AND expires_at > NOW()`)
  - If hit: use cached data; if miss: call LLM + insert cache (expires_at = NOW() + 7 days)
  - **Acceptance**: First idea gen → cache miss → LLM called; second gen (same profile+goal) → cache hit → no LLM call

**Dependencies**: M1-010
**Risks**: Cache key collisions; stale data
**Definition of Done**: Research cache reduces LLM calls by >50% for repeated queries

---

## Milestone 2: Selection → 4-Week Plan → Core Artifacts (Weeks 4–5)

### Epic 2.1: Idea Selection & Plan Generation
**Size**: L | **Priority**: P0 | **Labels**: `type:feature`, `area:plans`

**Issues**:
- [ ] **M2-001**: Idea selection validation
  - Frontend: disable [Create Plan] if 0 or >3 ideas selected
  - Backend: API route `/api/plans` validates 1–3 ideas (return 400 if invalid)
  - **Acceptance**: User selects 0 ideas → button disabled; selects 4 → button disabled; selects 2 → button enabled

- [ ] **M2-002**: Plan generator agent (`packages/agents/plan-generator.ts`)
  - LLM prompt: input (selected ideas, user constraints) → output (4-week plan: 10–20 tasks, weekly milestones, resource links)
  - Respect constraints: tasks fit within `goal.hours_per_week`; weekly time budgets
  - Output format: JSON with tasks array (title, description, week, estimated_hours, xp_value, resources[])
  - **Acceptance**: Given 2 selected ideas + 10 hrs/week constraint → generates 15 tasks totaling ~40 hrs (10/week)

- [ ] **M2-003**: Plan creation API + UI
  - API route: `POST /api/plans` (body: `{selectedIdeaIds: string[]}`)
  - Background job: publish to QStash → worker generates plan → saves to `plans` + `tasks` tables
  - UI: Loading state with progress (stream updates via SSE or poll `/api/plans/:id/status`)
  - **Acceptance**: User clicks [Create Plan] → loading <20s → plan displayed with 10–20 tasks + weekly milestones

**Dependencies**: M1-014
**Risks**: Plan generation timeout; tasks don't fit time budget
**Definition of Done**: User can select ideas → create plan → see 4-week plan with tasks

---

### Epic 2.2: Core Artifacts Generation
**Size**: XL | **Priority**: P0 | **Labels**: `type:feature`, `area:artifacts`

**Issues**:
- [ ] **M2-004**: Artifact generator agent (`packages/agents/artifact-generator.ts`)
  - LLM prompts for 5 artifacts:
    1. **Résumé rewrite** (input: original résumé, selected ideas → output: optimized résumé emphasizing transferable skills)
    2. **LinkedIn headline** (≤220 chars, tailored to target roles)
    3. **LinkedIn About** (≤2000 chars, narrative + goals)
    4. **5 outreach templates** (recruiter, hiring manager, client, mentor, alumni with placeholders [Name], [Company])
    5. **Learning plan** (8–12 weeks, skills to learn, resources, milestones)
  - (Portfolio brief: conditional on "builder" idea selected)
  - **Acceptance**: Given plan → generates 5 artifacts in <30s total; artifacts are editable

- [ ] **M2-005**: Artifact storage & versioning
  - Create `artifacts` table (migration 003): `id`, `plan_id`, `type` (enum: resume, linkedin_headline, etc.), `content` (TEXT), `version` (INT), `created_at`
  - On edit: INSERT new row with `version = version + 1` (keep history)
  - **Acceptance**: User edits résumé artifact → new version saved; version history accessible

- [ ] **M2-006**: Artifact UI (view + edit)
  - Artifact list page: card per artifact with preview + [View/Edit] button
  - Editor: rich text editor (TipTap or Lexical) for résumé; textarea for templates
  - Actions: [Save], [Export PDF], [Copy to Clipboard], [Version History]
  - **Acceptance**: User views artifact → clicks [Edit] → makes changes → saves → new version created

- [ ] **M2-007**: Artifact export (PDF/DOCX)
  - Use `jsPDF` for PDF generation (résumé, learning plan)
  - Use `docx` npm package for DOCX (templates)
  - API route: `GET /api/artifacts/:id/export?format=pdf`
  - **Acceptance**: User clicks [Export PDF] → downloads PDF within 5s; opens correctly

**Dependencies**: M2-003
**Risks**: Artifact quality depends on LLM output; export formatting issues
**Definition of Done**: User has 5 editable artifacts with version history + export

---

### Epic 2.3: Plan Editing & Task Management
**Size**: M | **Priority**: P1 | **Labels**: `type:feature`, `area:plans`

**Issues**:
- [ ] **M2-008**: Task completion UI
  - Task card with checkbox + [Mark Complete] button
  - On complete: update `tasks.status = 'completed'`, award XP (see M3-001)
  - Anti-gaming: 15-second delay before XP awarded (prevent rapid mark/unmark)
  - **Acceptance**: User marks task complete → status updates → XP awarded after 15s

- [ ] **M2-009**: Plan editing (add/remove/reorder tasks)
  - UI: [Add Task] button → modal with form (title, description, week, hours)
  - Drag-drop reorder (use `dnd-kit`)
  - [Delete Task] button (soft delete: set `deleted_at`)
  - **Acceptance**: User adds custom task → saves → appears in plan; reorders tasks → order persists

**Dependencies**: M2-003
**Risks**: Concurrent edits (multiple devices) causing conflicts
**Definition of Done**: User can edit plan (add/remove/reorder tasks); changes saved

---

## Milestone 3: Gamification, Check-ins, Analytics & Polish (Week 6)

### Epic 3.1: Gamification (XP, Levels, Streaks, Badges)
**Size**: M | **Priority**: P0 | **Labels**: `type:feature`, `area:gamification`

**Issues**:
- [ ] **M3-001**: XP & level system
  - Create `progress` table (migration 004): `user_id` (FK), `xp`, `level`, `streak`, `last_active_date`
  - XP awarded on task completion (value from `tasks.xp_value`)
  - Level thresholds: L1=0, L2=100, L3=300, L4=600, L5=1000 XP (exponential)
  - API route: `GET /api/progress` returns current XP, level, next level threshold
  - **Acceptance**: User completes task worth 10 XP → `progress.xp` increments → level-up animation if threshold crossed

- [ ] **M3-002**: Streak tracking
  - Update `progress.streak` daily: if user completes ≥1 task today → increment; else reset to 0
  - Scheduled job (cron): runs daily at midnight UTC
  - **Acceptance**: User completes task 3 days in a row → streak = 3; misses day 4 → streak resets to 0

- [ ] **M3-003**: Badge system
  - Create `badges` table: `id`, `name`, `description`, `icon_url`, `criteria` (JSONB)
  - Create `user_badges` table: `user_id`, `badge_id`, `earned_at`
  - Badges: "First Task", "Week 1 Complete", "3 Outreach Sent", "Portfolio Published"
  - Award badges via trigger or background job (check criteria after task completion)
  - **Acceptance**: User completes first task → earns "First Task" badge → badge appears in profile

- [ ] **M3-004**: Progress dashboard UI
  - Dashboard: display XP, level (with progress bar to next level), streak (with 🔥 icon), badges (grid)
  - Weekly milestone progress: "Week 2: 3/5 tasks complete"
  - **Acceptance**: User views dashboard → sees accurate XP, level, streak, badges

**Dependencies**: M2-008
**Risks**: Cron job fails (streak not updated); badge criteria bugs (false awards)
**Definition of Done**: Gamification functional (XP, levels, streaks, badges); UI displays progress

---

### Epic 3.2: Weekly Check-Ins (Email + In-App)
**Size**: M | **Priority**: P1 | **Labels**: `type:feature`, `area:gamification`

**Issues**:
- [ ] **M3-005**: Weekly check-in email (Resend)
  - Install `resend` npm package; configure API key
  - Email template: "How's your week going?" with summary (tasks completed, XP earned) + CTA link to in-app check-in
  - Scheduled job (cron): runs weekly (Day 7, 14, 21, 28 after plan creation)
  - Opt-out link in email footer
  - **Acceptance**: User creates plan → 7 days later → receives check-in email; clicks opt-out → no more emails

- [ ] **M3-006**: In-app check-in page
  - Form: checklist of week's tasks (mark completed), textarea for "win" (optional), [Adjust Plan] link
  - Submit → updates `tasks.status`, increments XP, logs check-in event
  - **Acceptance**: User submits check-in → tasks marked complete → XP awarded → success message

**Dependencies**: M3-001
**Risks**: Email deliverability; opt-out doesn't work (violates CAN-SPAM)
**Definition of Done**: Weekly check-in emails sent; in-app check-in functional; opt-out works

---

### Epic 3.3: Analytics Events & Dashboards
**Size**: M | **Priority**: P1 | **Labels**: `type:feature`, `area:analytics`

**Issues**:
- [ ] **M3-007**: Implement core analytics events (PostHog)
  - Events per `metrics.md`: `clerk.signup`, `clerk.login`, `ingest.complete`, `goal.created`, `questionnaire.completed`, `ideas.generated`, `ideas.selected`, `plan.created`, `task.completed`, `artifact.generated`, `checkin.submitted`
  - Add event calls throughout codebase (Clerk webhook, idea gen, plan gen, etc.)
  - Track `clerk_user_id` on all events for user attribution
  - **Acceptance**: User completes signup → questionnaire → plan → PostHog dashboard shows funnel with Clerk user IDs

- [ ] **M3-008**: Create PostHog dashboards
  - Dashboard 1: KPI dashboard (activation rate, selection rate, 12-week retention, NPS)
  - Dashboard 2: Funnel (signup → profile → goal → questionnaire → ideas → plan)
  - Dashboard 3: Engagement (tasks completed, XP earned, streaks, badges)
  - **Acceptance**: Dashboards created in PostHog; metrics populate with test data

**Dependencies**: M0-014
**Risks**: Event payload contains PII (mitigate: review all event properties)
**Definition of Done**: Analytics events tracked; dashboards display metrics

---

### Epic 3.4: Data Export & Account Deletion
**Size**: M | **Priority**: P0 | **Labels**: `type:feature`, `area:security`

**Issues**:
- [ ] **M3-009**: Data export API (`GET /api/export?format=json|pdf`)
  - Fetch all user data: profile, goals, questionnaire answers, ideas, plans, tasks, artifacts
  - JSON format: return as downloadable file
  - PDF format: generate multi-page PDF with all data (use `jsPDF`)
  - If >10s: publish to QStash job → email link when ready
  - **Acceptance**: User clicks [Export My Data] → JSON downloads immediately; PDF generates + emails link

- [ ] **M3-010**: Account deletion flow
  - Settings page: [Delete My Account] button → confirmation modal (type "DELETE" to confirm)
  - API route: `DELETE /api/account` → soft delete (set `users.deleted_at`)
  - Scheduled job: purges soft-deleted accounts after 24h (runs hourly)
  - Send confirmation email: "Your account has been deleted"
  - **Acceptance**: User requests deletion → soft deleted immediately → purged after 24h → email sent

**Dependencies**: M0-005
**Risks**: Export too slow (>10s); deletion job fails (data not purged)
**Definition of Done**: User can export data (JSON/PDF) and delete account; deletion confirmed

---

### Epic 3.5: Accessibility Audit & Fixes
**Size**: M | **Priority**: P0 | **Labels**: `type:chore`, `area:ui`, `area:a11y`

**Issues**:
- [ ] **M3-011**: Run axe-core accessibility audit in CI
  - Install `@axe-core/playwright` for Playwright tests
  - Add accessibility tests for key pages (landing, signup, questionnaire, ideas, plan)
  - Fail CI if Level A or AA violations found
  - **Acceptance**: CI runs accessibility tests; 0 violations on key pages

- [ ] **M3-012**: Fix accessibility issues
  - Ensure color contrast ≥4.5:1 (use contrast checker on all text/button combos)
  - Add keyboard navigation: all interactive elements reachable via Tab; focus indicators visible
  - Add ARIA labels to icon buttons; semantic HTML (`<nav>`, `<main>`, `<section>`)
  - **Acceptance**: Manual keyboard nav test passes; screen reader (VoiceOver/NVDA) can navigate app

**Dependencies**: All UI epics
**Risks**: Fixing accessibility breaks existing UI; time-consuming
**Definition of Done**: WCAG 2.1 AA compliance verified; axe-core CI passes

---

### Epic 3.6: Performance Optimization
**Size**: M | **Priority**: P1 | **Labels**: `type:chore`, `area:infra`

**Issues**:
- [ ] **M3-013**: Optimize API response times
  - Add database indexes on frequently queried fields (already in M0-005; verify with `EXPLAIN ANALYZE`)
  - Cache static data (question templates, badge definitions) in Redis (optional for MVP; use in-memory cache first)
  - **Acceptance**: P95 API response time <500ms (measured via Vercel Analytics)

- [ ] **M3-014**: Optimize Next.js bundle size
  - Enable Next.js bundle analyzer (`@next/bundle-analyzer`)
  - Code-split heavy components (TipTap editor, PDF generator) with dynamic imports
  - **Acceptance**: Initial JS bundle <300KB (gzipped); Lighthouse score >90

**Dependencies**: All feature epics
**Risks**: Premature optimization; breaking changes
**Definition of Done**: P95 <1.5s for non-LLM routes; bundle size optimized

---

### Epic 3.7: Launch Readiness
**Size**: M | **Priority**: P0 | **Labels**: `type:chore`, `area:infra`

**Issues**:
- [ ] **M3-015**: Security audit
  - Review: RLS policies, env var security, PII redaction, ethical filters
  - Run Snyk scan; fix high/critical vulnerabilities
  - Penetration test: attempt cross-user access, SQL injection, XSS
  - **Acceptance**: Security checklist 100% complete; penetration test finds 0 critical issues

- [ ] **M3-016**: Pre-launch manual testing
  - Test full user flow (signup → ingest → goal → questionnaire → ideas → plan → artifacts → gamification)
  - Test edge cases (résumé upload failure, LLM timeout, offline mode)
  - Test on mobile (iOS Safari, Android Chrome)
  - **Acceptance**: Manual testing checklist 100% complete; 0 blocking bugs

- [ ] **M3-017**: Documentation & runbook
  - Update `README.md` with setup instructions, architecture overview
  - Create `docs/runbook.md` with common issues + fixes (e.g., "LLM timeout", "RLS policy error")
  - Document environment variables in `.env.example` with descriptions
  - **Acceptance**: New developer can clone repo, follow README, and run app locally within 15 minutes

**Dependencies**: All previous epics
**Risks**: Bugs discovered late (blocker); documentation incomplete
**Definition of Done**: Security audit passed; manual testing complete; docs updated

---

## Label Taxonomy

### Type Labels
- `type:feature`: New feature implementation
- `type:chore`: Infrastructure, tooling, config (not user-facing)
- `type:bug`: Bug fix
- `type:test`: Test-only changes
- `type:docs`: Documentation updates

### Area Labels
- `area:ingest`: Profile ingestion (LinkedIn, résumé, narrative)
- `area:goals`: Goal capture + validation
- `area:questionnaire`: Adaptive questionnaire
- `area:ideas`: Idea generation + scoring
- `area:plans`: Plan generation + editing
- `area:artifacts`: Artifact generation + export
- `area:gamification`: XP, levels, streaks, badges, check-ins
- `area:analytics`: PostHog events + dashboards
- `area:security`: Auth, RLS, PII redaction, deletion
- `area:infra`: CI/CD, deployment, monitoring
- `area:ui`: UI components, accessibility, design
- `area:a11y`: Accessibility-specific

### Priority Labels
- `priority:P0`: Critical (blocks launch)
- `priority:P1`: High (important for MVP)
- `priority:P2`: Medium (nice-to-have)

### Size Labels
- `size:XS`: <2 hours (trivial)
- `size:S`: 2–4 hours (small)
- `size:M`: 4–8 hours (medium)
- `size:L`: 1–2 days (large)
- `size:XL`: 2–4 days (extra large)

---

## Branch Strategy

### Main Branches
- `main`: Production (auto-deploys to Vercel prod + Railway worker prod)
- `develop`: Staging (optional; not used for MVP — merge PRs directly to main)

### Feature Branches
- Format: `feature/M{milestone}-{issue-number}-{short-description}`
- Example: `feature/M1-007-questionnaire-engine`
- Merge via PR with squash commits; delete branch after merge

### Hotfix Branches
- Format: `hotfix/{issue-number}-{short-description}`
- Merge directly to `main`; cherry-pick to `develop` if applicable

---

## CI Gates

### PR Checks (GitHub Actions)
1. **Lint**: `pnpm lint` (ESLint across all packages)
2. **Typecheck**: `pnpm typecheck` (TypeScript across all packages)
3. **Unit Tests**: `pnpm test:unit` (Vitest; requires ≥70% coverage for new code)
4. **Integration Tests**: `pnpm test:integration` (Playwright; key user flows)
5. **Accessibility Tests**: `pnpm test:a11y` (axe-core; 0 Level A/AA violations)
6. **Build**: `pnpm build` (all apps must build successfully)

### Merge Requirements
- All CI checks pass
- ≥1 approval (code review)
- No merge conflicts
- Branch up-to-date with `main`

---

## ADR Template Reference

Architecture Decision Records (ADRs) MUST be created for:
- Database schema changes (new tables, major migrations)
- Third-party service integrations (Supabase, OpenAI, PostHog, QStash, Resend)
- Authentication method changes
- Deployment architecture changes (Vercel, Railway, edge functions)

**ADR Template** (`docs/architecture/ADR-{number}-{title}.md`):
```markdown
# ADR-{number}: {Title}

**Status**: Proposed | Accepted | Deprecated | Superseded by ADR-{number}
**Date**: YYYY-MM-DD
**Deciders**: [names]

## Context
[What problem are we solving? Why now?]

## Decision
[What we chose]

## Consequences
**Pros**:
- [benefit 1]
- [benefit 2]

**Cons**:
- [trade-off 1]
- [trade-off 2]

**Risks**:
- [risk 1 + mitigation]

## Alternatives Considered
- **Option A**: [description] — Rejected because [reason]
- **Option B**: [description] — Rejected because [reason]
```

---

## Data Model & Migration Checklist

### Migration Process
1. Create migration file: `supabase migration new {description}`
2. Write SQL (up + down)
3. Test locally: `pnpm db:migrate`, verify with `pnpm db:studio`
4. Add RLS policies for all new tables
5. Update TypeScript types: `pnpm db:types`
6. Update Zod schemas in `packages/db/src/schema.ts`
7. Commit migration + types together

### Required RLS Policies (per table)
```sql
-- Example for `profiles` table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- No DELETE policy (soft delete via updated_at)
```

### Tables Required (Migrations 001–004)

**Migration 001**: Core tables
- `users` (extends `auth.users`): `id`, `email`, `created_at`, `updated_at`, `deleted_at`
- `profiles`: `id`, `user_id` (FK), `linkedin_profile_url`, `resume_file_path`, `narrative`, `consents` (JSONB), `parsed_data` (JSONB), `created_at`, `updated_at`
- `goals`: `id`, `user_id` (FK), `type` (enum: career, financial), `target`, `horizon`, `constraints` (JSONB), `created_at`
- `questionnaire_sessions`: `id`, `user_id` (FK), `goal_id` (FK), `template_id`, `depth` (INT), `created_at`, `completed_at`
- `answers`: `id`, `session_id` (FK), `question_id`, `answer` (TEXT), `created_at`

**Migration 002**: Idea + cache tables
- `research_cache`: `id`, `query_hash` (unique), `data` (JSONB), `sources` (TEXT[]), `expires_at`, `created_at`
- `idea_sets`: `id`, `user_id` (FK), `session_id` (FK), `created_at`
- `ideas`: `id`, `idea_set_id` (FK), `title`, `category` (enum: employee, freelance, builder), `scores` (JSONB), `explanation`, `steps` (TEXT[]), `sources` (TEXT[])

**Migration 003**: Plan + artifact tables
- `plans`: `id`, `user_id` (FK), `idea_set_id` (FK), `duration` (INT weeks), `created_at`
- `tasks`: `id`, `plan_id` (FK), `title`, `description`, `week` (INT), `estimated_hours`, `xp_value`, `resources` (TEXT[]), `status` (enum: pending, in_progress, completed), `completed_at`, `deleted_at`
- `artifacts`: `id`, `plan_id` (FK), `type` (enum: resume, linkedin_headline, linkedin_about, outreach_template, portfolio_brief, learning_plan), `content` (TEXT), `version` (INT), `created_at`

**Migration 004**: Gamification tables
- `progress`: `user_id` (FK, PK), `xp` (INT), `level` (INT), `streak` (INT), `last_active_date`, `updated_at`
- `badges`: `id`, `name`, `description`, `icon_url`, `criteria` (JSONB)
- `user_badges`: `id`, `user_id` (FK), `badge_id` (FK), `earned_at`

### Indexes Required
```sql
-- Migration 001
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_goals_user_id ON goals(user_id);
CREATE INDEX idx_questionnaire_sessions_user_id ON questionnaire_sessions(user_id);
CREATE INDEX idx_answers_session_id ON answers(session_id);

-- Migration 002
CREATE UNIQUE INDEX idx_research_cache_query_hash ON research_cache(query_hash);
CREATE INDEX idx_idea_sets_user_id ON idea_sets(user_id);
CREATE INDEX idx_ideas_idea_set_id ON ideas(idea_set_id);

-- Migration 003
CREATE INDEX idx_plans_user_id ON plans(user_id);
CREATE INDEX idx_tasks_plan_id ON tasks(plan_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_artifacts_plan_id ON artifacts(plan_id);

-- Migration 004
CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);
```

---

## Security & Privacy Review Checklist

### Pre-Launch Security Review
- [ ] **RLS Policies**: All tables have RLS enabled; policies enforce `auth.uid() = user_id`
- [ ] **Cross-User Test**: Integration test attempts User A accessing User B's data → fails with 403
- [ ] **PII Redaction**: Unit tests verify 100% PII removal from 100 sample résumés
- [ ] **Secrets**: No secrets in code; all in `.env`; `.env.example` documents all vars
- [ ] **Ethical Filters**: Keyword filter tested with 100 sample ideas; 0 false negatives (MLM, crypto, gambling pass through)
- [ ] **SQL Injection**: Parameterized queries only (Supabase client abstracts this)
- [ ] **XSS**: React auto-escapes; rich text editor sanitized (TipTap has built-in sanitization)
- [ ] **CSRF**: Next.js CSRF protection enabled (default in App Router)
- [ ] **HTTPS**: Vercel enforces HTTPS; HTTP redirects enabled
- [ ] **OAuth Redirects**: LinkedIn OAuth redirect URLs whitelisted (localhost:3000, app.junielyfe.com)
- [ ] **Rate Limiting**: Vercel Edge Config rate limits (100 req/min per IP); QStash retries limited
- [ ] **Dependency Audit**: Snyk scan passes (0 high/critical vulnerabilities)

### Privacy Compliance Checklist
- [ ] **Consent**: Checkboxes per data source; stored in `profiles.consents`
- [ ] **Data Export**: API route functional; JSON + PDF formats; <10s or async email
- [ ] **Account Deletion**: Soft delete + 24h purge job; confirmation email sent
- [ ] **Audit Logs**: PostHog logs purge after 30 days (auto-configured)
- [ ] **PII in Events**: Review all PostHog event payloads; no PII logged (use `user_id` hash only)
- [ ] **Privacy Policy**: Draft privacy policy (link in footer); covers GDPR, CCPA, data retention

---

## Accessibility & Performance Budgets

### Accessibility Targets (WCAG 2.1 AA)
- [ ] **Color Contrast**: ≥4.5:1 for normal text, ≥3:1 for large text (automated check: axe-core)
- [ ] **Keyboard Navigation**: All interactive elements reachable via Tab; focus visible (outline: 2px solid)
- [ ] **Screen Reader**: Semantic HTML (`<nav>`, `<main>`, `<section>`); ARIA labels on icon buttons
- [ ] **Touch Targets**: ≥44×44px (Tailwind: `min-h-[44px]`)
- [ ] **Animations**: ≤3 flashes/second; respect `prefers-reduced-motion`
- [ ] **Forms**: Labels for all inputs; error messages associated via `aria-describedby`

### Performance Budgets
- [ ] **FCP (First Contentful Paint)**: <2s on 4G, <3s on 3G
- [ ] **LCP (Largest Contentful Paint)**: <2.5s
- [ ] **CLS (Cumulative Layout Shift)**: <0.1
- [ ] **FID (First Input Delay)**: <100ms
- [ ] **P95 API Response**: <500ms (non-LLM routes)
- [ ] **LLM First Token**: <2s
- [ ] **LLM Complete**: <20s
- [ ] **Bundle Size**: <300KB (initial JS, gzipped)
- [ ] **Lighthouse Score**: >90 (Performance, Accessibility, Best Practices, SEO)

### Monitoring Tools
- **Vercel Analytics**: P95 response times, error rates
- **PostHog**: User flows, session recordings, heatmaps
- **Sentry** (optional): Error tracking with stack traces
- **Lighthouse CI**: Run on every PR; fail if score <80

---

## Backlog (Nice-to-Have, Not MVP)

### Post-MVP Features (Prioritized)
1. **Standard (10) & In-Depth (20) Questionnaires** (M1.5): Expand beyond Quick (5)
2. **Portfolio Brief for Builder Ideas** (M2.5): Conditional artifact generation
3. **Perplexity Research API Integration** (M1.5): Swap from GPT-5-nano for better research
4. **LinkedIn Headline/About Auto-Update** (M2.5): One-click publish to LinkedIn
5. **NPS Surveys** (M3.5): Automated surveys at 4-week + 12-week marks
6. **Canary Release System** (M3.5): Feature flags + cohort targeting
7. **Sentry Integration** (M0.5): Error tracking with user context
8. **Redis Caching** (M3.5): Cache question templates, badge definitions, research data
9. **Service Worker** (M3.5): Offline mode with cached data
10. **Social Features** (Post-MVP): Peer sharing, commenting, leaderboards
11. **Payments/Monetization** (Post-MVP): Stripe integration, premium tiers
12. **Mobile Apps** (Post-MVP): React Native (iOS/Android)
13. **Multi-Language Support** (Post-MVP): i18n (Spanish, French)
14. **Advanced Analytics** (Post-MVP): Cohort analysis, A/B testing (PostHog Experiments)

### Known Limitations (Accept for MVP)
- Only Quick (5) questionnaire depth (Standard 10, In-Depth 20 deferred)
- GPT-5-nano instead of Perplexity Research API (cost optimization)
- No auto-apply to job boards (ethical concerns + complexity)
- No CRM/ATS integrations (Greenhouse, Lever, etc.)
- No social features (no peer sharing, commenting, public profiles)
- No monetization (free MVP; donation/tip jar acceptable)
- English-only (i18n-ready but not localized)

---

## Proposed Issues (GitHub)

**Do NOT create these issues yet**. This is a checklist for manual issue creation post-planning.

### Milestone 0 (14 issues)
- [ ] M0-001: Initialize Turborepo with pnpm workspaces
- [ ] M0-002: Migrate existing Next.js 15 app with Clerk auth into apps/web
- [ ] M0-003: Set up background worker app with QStash
- [ ] M0-004: Initialize Supabase project (database only; Clerk handles auth)
- [ ] M0-005: Create initial database schema with RLS policies (clerk_user_id column)
- [ ] M0-006: Generate TypeScript types from Supabase schema (`packages/db`)
- [ ] M0-007: Configure Clerk webhooks to sync users to Supabase
- [ ] M0-008: Set up GitHub Actions CI workflow (`ci.yml`)
- [ ] M0-009: Configure Vercel preview deploys for PRs
- [ ] M0-010: Set up Husky + commitlint for Conventional Commits
- [ ] M0-011: Configure Snyk for weekly dependency audits
- [ ] M0-012: Implement server-side PII redaction function
- [ ] M0-013: Create secure secrets management utility
- [ ] M0-014: Integrate PostHog SDK (`apps/web`)

### Milestone 1 (16 issues)
- [ ] M1-001: LinkedIn OAuth integration (via Clerk)
- [ ] M1-002: Résumé upload + parsing
- [ ] M1-003: Narrative text area with auto-save
- [ ] M1-004: Consent checkboxes per data source
- [ ] M1-005: Goal creation form (career/financial)
- [ ] M1-006: Goal validation logic (reject vague, flag unrealistic)
- [ ] M1-007: Questionnaire engine (`packages/core/questionnaire`)
- [ ] M1-008: Questionnaire UI (5 questions for MVP)
- [ ] M1-009: Protected attributes enforcement (no age, race, gender, salary)
- [ ] M1-010: Idea generator agent (`packages/agents/idea-generator.ts`)
- [ ] M1-011: Ethical filter (post-generation keyword filter)
- [ ] M1-012: Idea diversity enforcement (≥1 employee, freelance, builder)
- [ ] M1-013: Idea scoring (`packages/core/scoring`)
- [ ] M1-014: Idea results UI (grid, cards, selection)
- [ ] M1-015: Create `research_cache` table (migration 002)
- [ ] M1-016: Implement research cache in idea generator

### Milestone 2 (10 issues)
- [ ] M2-001: Idea selection validation (1–3 ideas)
- [ ] M2-002: Plan generator agent (`packages/agents/plan-generator.ts`)
- [ ] M2-003: Plan creation API + UI (background job + SSE progress)
- [ ] M2-004: Artifact generator agent (5 artifacts: résumé, LinkedIn, templates, learning plan)
- [ ] M2-005: Artifact storage & versioning (migration 003)
- [ ] M2-006: Artifact UI (view + edit with rich text editor)
- [ ] M2-007: Artifact export (PDF/DOCX)
- [ ] M2-008: Task completion UI (checkbox, mark complete, XP award)
- [ ] M2-009: Plan editing (add/remove/reorder tasks)

### Milestone 3 (17 issues)
- [ ] M3-001: XP & level system (migration 004)
- [ ] M3-002: Streak tracking (daily cron job)
- [ ] M3-003: Badge system (badges table, criteria, awards)
- [ ] M3-004: Progress dashboard UI (XP, level, streak, badges)
- [ ] M3-005: Weekly check-in email (Resend + cron)
- [ ] M3-006: In-app check-in page (form + submit)
- [ ] M3-007: Implement core analytics events (PostHog)
- [ ] M3-008: Create PostHog dashboards (KPI, funnel, engagement)
- [ ] M3-009: Data export API (`GET /api/export?format=json|pdf`)
- [ ] M3-010: Account deletion flow (soft delete + 24h purge)
- [ ] M3-011: Run axe-core accessibility audit in CI
- [ ] M3-012: Fix accessibility issues (contrast, keyboard nav, ARIA)
- [ ] M3-013: Optimize API response times (indexes, caching)
- [ ] M3-014: Optimize Next.js bundle size (code-splitting)
- [ ] M3-015: Security audit (RLS, env vars, PII redaction, pentesting)
- [ ] M3-016: Pre-launch manual testing (full user flow + edge cases)
- [ ] M3-017: Documentation & runbook (README, runbook, .env.example)

**Total Issues**: 52 (9 + 16 + 10 + 17)

---

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy** (for `/tasks` command):
- Load `.specify/templates/tasks-template.md` as base
- Generate tasks from Milestones 0–3 epics above
- Each epic → 1–5 implementation tasks (depending on size)
- Each issue → 1 task with acceptance criteria as checklist
- Order: Milestone 0 → M1 → M2 → M3 (sequential); within milestone, parallelize where possible

**Ordering Strategy**:
- **Sequential Milestones**: M0 must complete before M1, M1 before M2, M2 before M3
- **Parallel within Milestone**: Mark [P] for tasks with no dependencies (e.g., M0-002, M0-003, M0-014 can run parallel)
- **TDD Order**: Tests written before implementation where applicable (e.g., M1-013 scoring tests before M1-010 idea generator)

**Estimated Output**: 52 tasks (matching 52 issues above), numbered T001–T052

**IMPORTANT**: This phase is executed by the `/tasks` command, NOT by `/plan`

---

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (`/tasks` command creates `tasks.md` with T001–T052)
**Phase 4**: Implementation (execute tasks sequentially/parallel per dependencies)
**Phase 5**: Validation (CI passes, manual testing complete, launch)

---

## Complexity Tracking

*No constitutional violations detected. All complexity is justified by MVP scope and constitutional compliance strategies documented in Constitution Check section.*

---

## Progress Tracking

**Phase Status**:
- [x] Phase 0: Research complete (N/A for MVP — tech stack pre-defined)
- [x] Phase 1: Design complete (this plan document)
- [x] Phase 2: Task planning complete (approach documented above; `/tasks` command will generate `tasks.md`)
- [ ] Phase 3: Tasks generated (`/tasks` command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS (all 37 principles have compliance strategies)
- [x] Post-Design Constitution Check: PASS (no violations introduced)
- [x] All NEEDS CLARIFICATION resolved (tech stack pre-defined in command args)
- [x] Complexity deviations documented (none)

---

*Based on Junielyfe Constitution v1.0.0 (2025-09-29) — See `.specify/memory/constitution.md`*

**Next Steps**:
1. Run `/tasks` command to generate `tasks.md` with 52 numbered tasks
2. Create GitHub issues from "Proposed Issues" checklist above
3. Apply labels (type, area, priority, size) per taxonomy
4. Begin Milestone 0: Project Setup & Guardrails (Week 1)

**Estimated Launch**: 6 weeks from start (assuming 1 developer full-time or 2–3 part-time)

**Success Criteria for Launch**:
- ✅ All 52 issues closed
- ✅ CI passes (lint, typecheck, tests, accessibility)
- ✅ Security audit passed
- ✅ Manual testing complete (critical path + edge cases)
- ✅ Deployed to production (Vercel + Railway)
- ✅ Monitoring active (PostHog, Vercel Analytics, Sentry optional)
- ✅ Documentation complete (README, runbook, ADRs)