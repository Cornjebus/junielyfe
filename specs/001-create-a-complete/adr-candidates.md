# Architecture Decision Record (ADR) Candidates: Junielyfe MVP

**Feature Branch**: `001-create-a-complete`
**Date**: 2025-09-30
**Version**: 1.0.0
**Purpose**: Identify architectural decisions requiring formal documentation before implementation

---

## Executive Summary

This document lists **Architecture Decision Record (ADR) candidates** for the Junielyfe MVP. Each candidate represents a significant architectural choice that affects system design, performance, cost, or maintainability. ADRs should be created for these decisions **before implementation** to document context, options, trade-offs, and rationale.

**ADR Template Location**: `/docs/architecture/ADR-{number}-{title}.md`

**ADR Numbering**: Sequential (ADR-001, ADR-002, etc.)

**ADR Status**: Proposed → Accepted → Deprecated → Superseded by ADR-{number}

**Priority Ranking**:
1. **ADR-001**: Monorepo vs Multi-Repo (CRITICAL — affects all development)
2. **ADR-002**: Background Jobs (QStash vs Supabase Cron) (HIGH — affects scalability)
3. **ADR-005**: Row-Level Security (RLS) vs Application-Level Access Control (CRITICAL — affects security)
4. **ADR-003**: LLM Provider (GPT-5-nano vs Perplexity Research API) (HIGH — affects cost/quality)
5. **ADR-004**: Artifact Storage (DB TEXT vs Supabase Storage) (MEDIUM — affects performance)
6. **ADR-006**: Analytics Provider (PostHog vs Mixpanel vs Amplitude) (MEDIUM — affects observability)

---

## ADR Template (For Reference)

```markdown
# ADR-{number}: {Title}

**Status**: Proposed | Accepted | Deprecated | Superseded by ADR-{number}
**Date**: YYYY-MM-DD
**Deciders**: [names]

## Context

[What problem are we solving? Why now? What constraints exist?]

## Decision

[What we chose and why]

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

### Option A: [Name]
**Description**: [Brief description]
**Pros**: [benefits]
**Cons**: [drawbacks]
**Rejected because**: [reason]

### Option B: [Name]
**Description**: [Brief description]
**Pros**: [benefits]
**Cons**: [drawbacks]
**Rejected because**: [reason]

## Implementation Notes

[Any specific guidance for developers implementing this decision]

## References

[Links to documentation, benchmarks, or discussions]
```

---

## ADR-001: Monorepo vs Multi-Repo

**Priority**: CRITICAL (affects all development workflows)
**Status**: Proposed
**Decision Required By**: Milestone 0, Week 1 (before any code written)

### Problem

Junielyfe has multiple interdependent components (web app, background worker, shared packages: core, db, agents, ui). Should we organize code as a **monorepo** (single repository with multiple packages) or **multi-repo** (separate repositories per component)?

### Options

#### Option A: Turborepo Monorepo (Recommended)
**Description**: Single Git repository with pnpm workspaces and Turborepo for task orchestration. Structure:
```
junielyfe/
├── apps/
│   ├── web/              # Next.js 15 frontend
│   └── worker/           # Background worker
├── packages/
│   ├── core/             # Business logic
│   ├── db/               # Supabase client, types
│   ├── agents/           # LLM agents
│   └── ui/               # Shared components
└── turbo.json            # Turborepo pipeline
```

**Pros**:
- **Single Source of Truth**: All code in one repo → easier code search, refactoring
- **Atomic Changes**: Update shared package + consumers in single PR → no version drift
- **Simplified CI/CD**: Single pipeline builds all packages → faster iteration
- **Developer Experience**: `pnpm dev` starts all apps → no juggling multiple repos
- **Dependency Management**: pnpm workspaces dedupe dependencies → smaller node_modules

**Cons**:
- **Larger Repo Size**: Clone time increases as codebase grows
- **CI Complexity**: Need caching strategies (Turborepo) to avoid rebuilding everything
- **Access Control**: Cannot grant per-package access (entire repo or nothing)

**Risks**:
- **Build Time**: As repo grows, CI time may increase → Mitigate: Turborepo caching, remote caching (Vercel)
- **Merge Conflicts**: Multiple developers working in same repo → Mitigate: Clear package boundaries, trunk-based development

---

#### Option B: Multi-Repo (Separate Repos per Component)
**Description**: Separate Git repositories for each component:
- `junielyfe-web` (Next.js frontend)
- `junielyfe-worker` (Background worker)
- `junielyfe-core` (Business logic npm package)
- `junielyfe-db` (Supabase client npm package)
- `junielyfe-agents` (LLM agents npm package)
- `junielyfe-ui` (Shared components npm package)

**Pros**:
- **Independent Versioning**: Packages can version independently → semantic versioning (1.0.0, 1.1.0, etc.)
- **Access Control**: Fine-grained permissions per repo
- **Smaller Clones**: Developers only clone repos they need

**Cons**:
- **Dependency Hell**: Updating shared package requires coordinated PRs across repos
- **Version Drift**: Web app may use `core@1.0.0` while worker uses `core@1.1.0` → inconsistency
- **Complex CI/CD**: Separate pipelines per repo → harder to orchestrate cross-repo changes
- **Developer Friction**: Clone 6 repos, manage 6 node_modules, juggle 6 terminals

**Risks**:
- **Breaking Changes**: Updating shared package breaks consumers → Mitigate: Strict semantic versioning, changelogs

---

#### Option C: Hybrid (Monorepo + Published Packages)
**Description**: Monorepo for development, publish shared packages (`core`, `db`, `agents`, `ui`) to npm for external consumers (if needed).

**Pros**:
- **Best of Both Worlds**: Monorepo developer experience + npm distribution if needed
- **Future-Proof**: Can open-source shared packages later

**Cons**:
- **Complexity**: Additional publish step, version management
- **Overhead**: Not needed for MVP (no external consumers)

**Rejected because**: Unnecessary complexity for MVP; revisit if open-sourcing packages post-launch

---

### Trade-Offs

| Aspect | Monorepo (A) | Multi-Repo (B) | Hybrid (C) |
|--------|-------------|---------------|-----------|
| **Developer Experience** | ⭐⭐⭐⭐⭐ (single clone, `pnpm dev`) | ⭐⭐ (multiple clones, juggle repos) | ⭐⭐⭐ (monorepo dev + npm publish) |
| **CI/CD Simplicity** | ⭐⭐⭐⭐ (single pipeline, Turborepo caching) | ⭐⭐ (multiple pipelines, coordination) | ⭐⭐⭐ (single pipeline + publish step) |
| **Refactoring Ease** | ⭐⭐⭐⭐⭐ (atomic cross-package changes) | ⭐⭐ (coordinated PRs) | ⭐⭐⭐⭐ (atomic + external versioning) |
| **Access Control** | ⭐⭐ (all-or-nothing) | ⭐⭐⭐⭐ (per-repo) | ⭐⭐⭐ (per-repo if open-sourced) |
| **Build Time (CI)** | ⭐⭐⭐ (grows with repo size) | ⭐⭐⭐⭐ (smaller builds) | ⭐⭐⭐ (grows with repo size) |

### Recommended Next Step

**ACCEPT Option A (Turborepo Monorepo)**:
1. Create monorepo structure with Turborepo + pnpm workspaces
2. Document in ADR-001 (create `/docs/architecture/ADR-001-monorepo-structure.md`)
3. Add to README.md: "Monorepo managed by Turborepo (see ADR-001)"
4. Revisit after 6 months: If repo size >1GB or CI time >10 min, consider optimization strategies

---

## ADR-002: Background Jobs (QStash vs Supabase Cron)

**Priority**: HIGH (affects scalability, reliability)
**Status**: Proposed
**Decision Required By**: Milestone 0, Week 1 (before worker app implemented)

### Problem

Long-running tasks (idea generation, plan generation, artifact generation, weekly check-in emails) should run as **background jobs** (not blocking HTTP requests). What job queue system should we use?

### Options

#### Option A: Upstash QStash (Recommended)
**Description**: Cloud-based HTTP job queue with webhooks. Worker app (Railway/Render) receives webhook requests from QStash.

**Architecture**:
```
[Next.js] --(publish job)--> [QStash] --(webhook)--> [Worker App] --> [Supabase]
```

**Pros**:
- **Horizontal Scaling**: Multiple worker instances can process jobs in parallel
- **Built-in Retries**: Exponential backoff (3 attempts: 1s → 10s → 60s)
- **Observability**: QStash dashboard shows job status, latency, failures
- **Separation of Concerns**: Worker app isolated from web app → easier debugging
- **Cost Visibility**: Separate billing for job processing (predictable costs)

**Cons**:
- **Extra Infrastructure**: Requires worker app deployment (Railway/Render)
- **Vendor Lock-In**: QStash-specific API (not portable to other job queues)
- **Cost**: Free tier (500 req/day), $10/month for 10K requests

**Risks**:
- **Webhook Delivery Failures**: Network issues → job lost → Mitigate: Dead letter queue, retry logic
- **Cold Starts**: Worker app may have cold start latency (1–2s) → Mitigate: Keep-alive pings

---

#### Option B: Supabase Cron (pg_cron)
**Description**: Postgres-native cron jobs (pg_cron extension) + Supabase Edge Functions for execution.

**Architecture**:
```
[Supabase Cron] --> [Edge Function] --> [OpenAI API] --> [Supabase DB]
```

**Pros**:
- **Simplicity**: No extra infrastructure (uses Supabase ecosystem)
- **Cost**: Included with Supabase (no extra cost)
- **Portability**: pg_cron is standard Postgres extension (not vendor-specific)

**Cons**:
- **Limited Scalability**: pg_cron runs on single DB instance → no horizontal scaling
- **No Built-in Retries**: Manual retry logic required (SQL or Edge Function)
- **Observability**: Limited logging (Supabase logs only, no dashboard)
- **Cold Starts**: Edge Functions have cold start latency (1–3s)

**Risks**:
- **Database Connection Pool**: Cron jobs consume DB connections → may exhaust pool → Mitigate: Limit concurrent cron jobs
- **Complex Retry Logic**: Manual implementation error-prone → Mitigate: Use Supabase Edge Function retries (if available)

---

#### Option C: Railway Cron (Built-in Scheduler)
**Description**: Railway's built-in cron scheduler triggers worker app endpoints.

**Architecture**:
```
[Railway Cron] --> [Worker App /cron/:jobName] --> [OpenAI API] --> [Supabase]
```

**Pros**:
- **Simplicity**: Railway manages scheduling (no external service)
- **Cost**: Included with Railway hosting

**Cons**:
- **Vendor Lock-In**: Railway-specific (not portable)
- **Limited Features**: No retries, no observability dashboard
- **Single Point of Failure**: If Railway Cron fails, all jobs fail

**Rejected because**: Less mature than QStash, limited features

---

### Trade-Offs

| Aspect | QStash (A) | Supabase Cron (B) | Railway Cron (C) |
|--------|-----------|------------------|-----------------|
| **Scalability** | ⭐⭐⭐⭐⭐ (horizontal) | ⭐⭐ (single DB) | ⭐⭐⭐ (worker scaling) |
| **Retries** | ⭐⭐⭐⭐⭐ (built-in) | ⭐⭐ (manual) | ⭐⭐ (manual) |
| **Observability** | ⭐⭐⭐⭐ (dashboard) | ⭐⭐ (logs only) | ⭐⭐ (logs only) |
| **Cost (MVP)** | ⭐⭐⭐ ($10/month) | ⭐⭐⭐⭐⭐ ($0) | ⭐⭐⭐⭐ ($5/month) |
| **Complexity** | ⭐⭐⭐ (extra deploy) | ⭐⭐⭐⭐ (simpler) | ⭐⭐⭐⭐ (simpler) |

### Recommended Next Step

**ACCEPT Option A (QStash)** for MVP:
1. Implement worker app with QStash webhooks (Milestone 0)
2. Document in ADR-002 (create `/docs/architecture/ADR-002-background-jobs-qstash.md`)
3. **Revisit Post-Launch**: If cost becomes issue (>$50/month), migrate to Supabase Cron
4. **Migration Path**: Abstract job queue interface (`packages/core/queue`) → swap implementations without changing business logic

---

## ADR-003: LLM Provider (GPT-5-nano vs Perplexity Research API)

**Priority**: HIGH (affects cost, quality, latency)
**Status**: Proposed
**Decision Required By**: Milestone 1, Week 2 (before idea generator implemented)

### Problem

Idea generation, plan generation, and artifact generation require LLM-powered synthesis. Which LLM provider should we use for MVP?

### Options

#### Option A: OpenAI GPT-5-nano (Recommended for MVP)
**Description**: Lightweight LLM optimized for structured generation tasks.

**Specs**:
- **Cost**: $0.15/1M input tokens, $0.60/1M output tokens
- **Latency**: <2s first token, <20s complete (with streaming)
- **Quality**: Good for structured outputs (JSON, bullet points)

**Pros**:
- **Low Cost**: ~$0.01 per user journey (profile → ideas → plan → artifacts)
- **Fast Latency**: First token <2s → good perceived performance
- **Streaming**: SSE support for progressive display
- **Familiar API**: OpenAI SDK well-documented, stable

**Cons**:
- **Research Quality**: Requires manual research data → no automatic web search
- **Citation Gaps**: No automatic source attribution → must prompt for citations
- **Rate Limits**: 100 req/min (free tier), 10K req/min (paid)

**Risks**:
- **Idea Quality**: Generic outputs if prompts not tuned → Mitigate: Golden fixtures, human review
- **API Downtime**: OpenAI outages → Mitigate: Fallback to cached ideas, error messaging

---

#### Option B: Perplexity Research API
**Description**: LLM with built-in web search and citations.

**Specs**:
- **Cost**: $5/1K searches (includes web search + LLM synthesis)
- **Latency**: 10–15s per search (no streaming)
- **Quality**: Excellent for research-backed ideas (automatic citations)

**Pros**:
- **Research Quality**: Automatic web search → verifiable sources
- **Citation Included**: Every idea includes source URLs → transparency
- **Reduced Prompt Engineering**: Less manual research data ingestion

**Cons**:
- **High Cost**: $5/user journey vs $0.01 (500x more expensive)
- **Slower Latency**: 10–15s (no streaming) vs <2s first token
- **Less Mature API**: Fewer features, less documentation vs OpenAI

**Risks**:
- **Cost Overruns**: 100 users × $5 = $500/month → Mitigate: Caching, rate limiting
- **Latency**: 15s feels slow vs 2s → Mitigate: Better progress indicators

---

#### Option C: Hybrid (GPT-5-nano + Manual Research Cache)
**Description**: Use GPT-5-nano for synthesis, pre-fetch research data (BLS, LinkedIn Economic Graph) separately, cache for 7 days.

**Pros**:
- **Best of Both Worlds**: Low cost + research quality
- **Caching**: Research data cached → reduces redundant fetches

**Cons**:
- **Complexity**: Two-step process (fetch research → LLM synthesis)
- **Manual Curation**: Research data requires manual updates

**Rejected for MVP**: Too complex; revisit if Perplexity cost becomes prohibitive

---

### Trade-Offs

| Aspect | GPT-5-nano (A) | Perplexity (B) | Hybrid (C) |
|--------|---------------|---------------|-----------|
| **Cost (100 users)** | ⭐⭐⭐⭐⭐ ($1) | ⭐ ($500) | ⭐⭐⭐⭐ ($10) |
| **Latency** | ⭐⭐⭐⭐⭐ (<2s) | ⭐⭐ (10–15s) | ⭐⭐⭐⭐ (<5s) |
| **Research Quality** | ⭐⭐ (manual) | ⭐⭐⭐⭐⭐ (auto) | ⭐⭐⭐⭐ (cached) |
| **Citations** | ⭐⭐ (prompt-based) | ⭐⭐⭐⭐⭐ (automatic) | ⭐⭐⭐⭐ (manual) |
| **Streaming** | ⭐⭐⭐⭐⭐ (SSE) | ⭐ (none) | ⭐⭐⭐⭐ (SSE) |

### Recommended Next Step

**ACCEPT Option A (GPT-5-nano) for MVP**:
1. Implement idea generator with GPT-5-nano + prompt engineering for citations (Milestone 1)
2. Document in ADR-003 (create `/docs/architecture/ADR-003-llm-provider-gpt5-nano.md`)
3. **Revisit After 100 Users**: If idea quality <70% "helpful" rating, migrate to Perplexity
4. **Migration Path**: Abstract LLM interface (`packages/agents/llm-client`) → swap providers without changing business logic

---

## ADR-004: Artifact Storage (DB TEXT vs Supabase Storage)

**Priority**: MEDIUM (affects performance, cost)
**Status**: Proposed
**Decision Required By**: Milestone 2, Week 4 (before artifact generator implemented)

### Problem

Auto-generated artifacts (résumé rewrite, LinkedIn copy, outreach templates, portfolio brief, learning plan) need storage. Should we store in **database TEXT fields** or **Supabase Storage** (S3-like file storage)?

### Options

#### Option A: Database TEXT Fields (Recommended)
**Description**: Store artifacts as TEXT in `artifacts` table with row-per-version.

**Schema**:
```sql
CREATE TABLE artifacts (
  id UUID PRIMARY KEY,
  plan_id UUID REFERENCES plans(id),
  type TEXT, -- 'resume', 'linkedin_headline', etc.
  content TEXT, -- Full artifact content
  version INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Pros**:
- **Simplicity**: Single source of truth (database), no separate file storage layer
- **Query Performance**: Can query artifact content (full-text search, grep)
- **Versioning**: Row-per-version (simple INSERT)
- **Export Simplicity**: Simple SQL query → JSON/PDF export
- **Cost**: Included in Supabase DB quota (no extra storage cost)

**Cons**:
- **File Size Limits**: Postgres TEXT max ~1GB (typical artifact <100KB, acceptable)
- **Large Artifacts**: If artifacts >1MB, may impact query performance

**Risks**:
- **Database Bloat**: 1000 users × 5 artifacts × 100KB = 500MB → Mitigate: Archive old versions, compress TEXT

---

#### Option B: Supabase Storage (S3-like)
**Description**: Store artifacts as files in Supabase Storage buckets with metadata in `artifacts` table.

**Schema**:
```sql
CREATE TABLE artifacts (
  id UUID PRIMARY KEY,
  plan_id UUID REFERENCES plans(id),
  type TEXT,
  file_path TEXT, -- 'artifacts/<user_id>/<artifact_id>/v1.txt'
  version INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Pros**:
- **No File Size Limits**: Store artifacts of any size
- **CDN Caching**: Supabase Storage uses CDN (faster downloads)

**Cons**:
- **Complexity**: Two systems (DB + Storage) to manage
- **Query Performance**: Cannot query file contents easily (must download first)
- **Export Complexity**: Generate signed URLs, download files, bundle
- **Cost**: $0.021/GB/month storage + bandwidth

**Risks**:
- **Storage Policy Bugs**: Misconfigured RLS → cross-user access → Mitigate: Integration tests

---

#### Option C: Hybrid (DB for Small, Storage for Large)
**Description**: Store small artifacts (<100KB) in DB TEXT, large artifacts (>100KB) in Storage.

**Pros**:
- **Optimal for Each Size**: Small artifacts fast (DB), large artifacts scalable (Storage)

**Cons**:
- **Complexity**: Conditional logic (size threshold), two storage paths

**Rejected for MVP**: Unnecessary complexity; revisit if artifacts >1MB

---

### Trade-Offs

| Aspect | DB TEXT (A) | Supabase Storage (B) | Hybrid (C) |
|--------|------------|---------------------|-----------|
| **Simplicity** | ⭐⭐⭐⭐⭐ (single source) | ⭐⭐ (two systems) | ⭐⭐ (conditional logic) |
| **Query Performance** | ⭐⭐⭐⭐⭐ (full-text search) | ⭐⭐ (download first) | ⭐⭐⭐⭐ (small: fast) |
| **File Size Limits** | ⭐⭐⭐ (1GB max) | ⭐⭐⭐⭐⭐ (no limit) | ⭐⭐⭐⭐⭐ (no limit) |
| **Cost (MVP)** | ⭐⭐⭐⭐⭐ ($0) | ⭐⭐⭐ ($2/month) | ⭐⭐⭐⭐ ($1/month) |
| **Versioning** | ⭐⭐⭐⭐⭐ (row-per-version) | ⭐⭐⭐ (file versioning) | ⭐⭐⭐⭐ (mixed) |

### Recommended Next Step

**ACCEPT Option A (DB TEXT) for MVP**:
1. Implement artifacts table with TEXT fields (Milestone 2)
2. Document in ADR-004 (create `/docs/architecture/ADR-004-artifact-storage-db-text.md`)
3. **Revisit After Launch**: If artifacts >1MB (e.g., portfolio PDFs), migrate large artifacts to Storage
4. **Migration Path**: Add `storage_file_path` column → conditional logic (`if content.length > 100KB → upload to Storage`)

---

## ADR-005: Row-Level Security (RLS) vs Application-Level Access Control

**Priority**: CRITICAL (affects security, data isolation)
**Status**: Proposed
**Decision Required By**: Milestone 0, Week 1 (before database schema finalized)

### Problem

User data (profiles, goals, plans, tasks, artifacts) must be isolated per user. Should we enforce access control at the **database level** (Row-Level Security) or **application level** (API route checks)?

### Options

#### Option A: Row-Level Security (RLS) in Supabase with Clerk Integration (Recommended)
**Description**: Postgres RLS policies enforce user isolation using `clerk_user_id` column. Requires Clerk webhook to sync users and middleware to inject Clerk user ID into Supabase context.

**Note**: This project uses **Clerk** for authentication, not Supabase Auth. RLS policies reference `clerk_user_id` column synced from Clerk via webhooks.

**Example Policy**:
```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (clerk_user_id = current_setting('request.jwt.claim.sub', true));

-- Or simpler: store user_id from Clerk session in app, pass to queries
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (clerk_user_id = current_setting('app.current_user_id', true));
```

**Integration Requirements**:
1. **Webhook Sync**: Clerk `user.created` → Supabase `users.clerk_user_id`
2. **Middleware**: Inject Clerk user ID into Supabase client context
3. **Schema**: All user tables have `clerk_user_id` column (references `users.clerk_user_id`)

**Pros**:
- **Defense in Depth**: Even if API route bug allows unauthorized request, RLS blocks at DB level
- **No Cross-User Leaks**: Impossible to query another user's data (enforced by Postgres)
- **Automatic Enforcement**: All queries (even raw SQL) respect RLS policies
- **Clerk + Supabase Pattern**: Well-established pattern used by Cal.com, Resend, Trigger.dev

**Cons**:
- **Query Performance**: RLS adds overhead (~5–10% latency) → Mitigate: Indexes on `clerk_user_id`
- **Debugging Complexity**: RLS errors (0 rows returned) harder to debug than API errors
- **Webhook Dependency**: User sync depends on Clerk webhook reliability → Mitigate: Retry logic + reconciliation job

**Risks**:
- **Policy Bugs**: Misconfigured RLS policy allows cross-user access → Mitigate: Integration tests, code review by 2 developers
- **Webhook Failures**: Clerk webhook fails → orphaned users → Mitigate: Background reconciliation job, `clerk_webhook_events` logging

---

#### Option B: Application-Level Access Control (API Routes)
**Description**: API routes (Next.js Server Actions) check `session.user.id === resource.user_id` before returning data.

**Example Code**:
```typescript
// app/api/plans/[id]/route.ts
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  const plan = await db.query('SELECT * FROM plans WHERE id = $1', [params.id]);

  if (plan.user_id !== session.user.id) {
    return new Response('Unauthorized', { status: 403 });
  }

  return Response.json(plan);
}
```

**Pros**:
- **Flexibility**: Custom logic (e.g., admin access, shared resources)
- **No DB Overhead**: No RLS query overhead

**Cons**:
- **Human Error**: Forgot to check `user_id` → cross-user leak
- **Inconsistent Enforcement**: Each route must implement checks → easy to miss
- **Raw SQL Risk**: Direct DB queries bypass application checks

**Risks**:
- **Security Bugs**: Single missed check → data breach → Mitigate: Code review, linting rules

---

#### Option C: Hybrid (RLS + Application Checks)
**Description**: RLS as baseline + application checks for custom logic (e.g., admin access).

**Pros**:
- **Defense in Depth**: RLS prevents leaks + application checks add flexibility

**Cons**:
- **Redundancy**: Duplicate checks (RLS + application) → maintenance overhead

**Recommended for Production**: After MVP, add application checks for audit logging, rate limiting

---

### Trade-Offs

| Aspect | RLS (A) | Application (B) | Hybrid (C) |
|--------|---------|----------------|-----------|
| **Security** | ⭐⭐⭐⭐⭐ (DB-enforced) | ⭐⭐ (human error-prone) | ⭐⭐⭐⭐⭐ (defense in depth) |
| **Query Performance** | ⭐⭐⭐⭐ (5–10% overhead) | ⭐⭐⭐⭐⭐ (no overhead) | ⭐⭐⭐⭐ (5–10% overhead) |
| **Flexibility** | ⭐⭐ (limited) | ⭐⭐⭐⭐⭐ (full control) | ⭐⭐⭐⭐ (RLS + custom) |
| **Debugging** | ⭐⭐⭐ (RLS errors) | ⭐⭐⭐⭐ (API errors) | ⭐⭐⭐ (mixed) |
| **Maintenance** | ⭐⭐⭐⭐⭐ (automatic) | ⭐⭐ (each route) | ⭐⭐⭐ (RLS + checks) |

### Recommended Next Step

**ACCEPT Option A (RLS) for MVP**:
1. Enable RLS on all user tables (Milestone 0)
2. Document in ADR-005 (create `/docs/architecture/ADR-005-row-level-security.md`)
3. **Integration Tests**: Verify cross-user access fails (User A cannot query User B's data)
4. **Revisit Post-MVP**: Add application-level checks for admin access, audit logging

---

## ADR-006: Analytics Provider (PostHog vs Mixpanel vs Amplitude)

**Priority**: MEDIUM (affects observability, product iteration)
**Status**: Proposed
**Decision Required By**: Milestone 0, Week 1 (before analytics SDK integrated)

### Problem

Product analytics (funnels, cohorts, retention) are critical for measuring success (activation rate, selection rate, NPS). Which analytics provider should we use?

### Options

#### Option A: PostHog (Recommended)
**Description**: Open-source, self-hostable product analytics with free tier (1M events/month).

**Pros**:
- **Free Tier**: 1M events/month (sufficient for MVP)
- **All-in-One**: Funnels, cohorts, session recordings, feature flags, experiments
- **Privacy-Friendly**: Self-hostable (EU data residency if needed)
- **Open Source**: Can inspect code, contribute features
- **No Vendor Lock-In**: Export data anytime (CSV, API)

**Cons**:
- **Less Mature**: Fewer features vs Mixpanel/Amplitude (no AI insights, limited integrations)
- **Self-Hosting Complexity**: If self-hosting, requires DevOps overhead (not needed for MVP cloud version)

**Risks**:
- **Feature Gaps**: May lack advanced features (cohort lookalike, predictive analytics) → Mitigate: Revisit if needed

---

#### Option B: Mixpanel
**Description**: Mature product analytics with focus on user behavior tracking.

**Pros**:
- **Mature Features**: Advanced funnels, cohort analysis, AI insights
- **Integrations**: 100+ integrations (Slack, Salesforce, etc.)
- **Support**: Dedicated customer success team (paid plans)

**Cons**:
- **Cost**: Free tier (100K events/month, limited features), $25/month for 1M events
- **Vendor Lock-In**: Proprietary (cannot self-host)
- **Privacy Concerns**: US-based (GDPR compliance requires careful config)

**Risks**:
- **Cost Overruns**: If events >1M/month, cost scales quickly → Mitigate: Event sampling, rate limiting

---

#### Option C: Amplitude
**Description**: Enterprise-grade product analytics with focus on growth teams.

**Pros**:
- **Mature Features**: Advanced cohort analysis, behavioral cohorting, predictive analytics
- **Scalability**: Handles billions of events/month

**Cons**:
- **Cost**: Free tier (10M events/month, limited features), $49/month for unlimited
- **Complexity**: Steep learning curve (designed for enterprise teams)
- **Vendor Lock-In**: Proprietary (cannot self-host)

**Risks**:
- **Overkill for MVP**: Enterprise features unnecessary for 100 users → Mitigate: Start simple, upgrade if needed

---

### Trade-Offs

| Aspect | PostHog (A) | Mixpanel (B) | Amplitude (C) |
|--------|------------|-------------|-------------|
| **Cost (MVP)** | ⭐⭐⭐⭐⭐ ($0) | ⭐⭐⭐ ($25/month) | ⭐⭐⭐⭐ ($0 starter) |
| **Features** | ⭐⭐⭐⭐ (good) | ⭐⭐⭐⭐⭐ (advanced) | ⭐⭐⭐⭐⭐ (enterprise) |
| **Privacy** | ⭐⭐⭐⭐⭐ (self-host) | ⭐⭐⭐ (US-based) | ⭐⭐⭐ (US-based) |
| **Ease of Use** | ⭐⭐⭐⭐ (simple) | ⭐⭐⭐⭐ (mature UI) | ⭐⭐⭐ (complex) |
| **Vendor Lock-In** | ⭐⭐⭐⭐⭐ (open source) | ⭐⭐ (proprietary) | ⭐⭐ (proprietary) |

### Recommended Next Step

**ACCEPT Option A (PostHog) for MVP**:
1. Integrate PostHog SDK in web app (Milestone 0)
2. Document in ADR-006 (create `/docs/architecture/ADR-006-analytics-provider-posthog.md`)
3. **Revisit After 1000 Users**: If PostHog lacks features (AI insights, predictive analytics), migrate to Mixpanel
4. **Migration Path**: Abstract analytics interface (`packages/core/analytics`) → swap providers without changing event calls

---

## Summary Table: ADR Candidates

| ADR # | Title | Priority | Decision By | Recommended Option | Status |
|-------|-------|----------|-------------|-------------------|--------|
| **ADR-001** | Monorepo vs Multi-Repo | CRITICAL | M0, Week 1 | Turborepo Monorepo (A) | Proposed |
| **ADR-002** | Background Jobs (QStash vs Cron) | HIGH | M0, Week 1 | Upstash QStash (A) | Proposed |
| **ADR-003** | LLM Provider (GPT-5-nano vs Perplexity) | HIGH | M1, Week 2 | GPT-5-nano (A) | Proposed |
| **ADR-004** | Artifact Storage (DB vs Storage) | MEDIUM | M2, Week 4 | DB TEXT (A) | Proposed |
| **ADR-005** | RLS vs Application Access Control | CRITICAL | M0, Week 1 | Row-Level Security (A) | Proposed |
| **ADR-006** | Analytics Provider (PostHog vs Mixpanel) | MEDIUM | M0, Week 1 | PostHog (A) | Proposed |

---

## Next Steps

1. **Week 1 (Milestone 0)**: Create ADRs 001, 002, 005, 006 (critical/high priority)
2. **Week 2 (Milestone 1)**: Create ADR-003 (LLM provider)
3. **Week 4 (Milestone 2)**: Create ADR-004 (artifact storage)
4. **Post-Launch**: Review all ADRs, mark as "Accepted" or "Superseded", iterate as needed

**ADR Template**: Use template at top of this document for all ADRs
**ADR Storage**: `/docs/architecture/ADR-{number}-{title}.md`
**ADR Review**: Weekly during Milestones 0–2, monthly post-launch

---

**Document Owner**: Eng Lead
**Last Updated**: 2025-09-30
**Next Review**: Week 1 (Milestone 0 kickoff)