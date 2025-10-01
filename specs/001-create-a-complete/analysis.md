# Comprehensive Analysis: Junielyfe MVP

**Feature Branch**: `001-create-a-complete`
**Analysis Date**: 2025-09-30
**Version**: 1.0.0
**Status**: Ready for Implementation

---

## Executive Summary

**Problem**: Job seekers and career transitioners lack personalized, actionable guidance for navigating the AI economy. Existing solutions are either too generic (job boards) or too expensive (career coaches at $150+/hour).

**Solution**: Junielyfe—an AI-powered career copilot that ingests user profiles (LinkedIn, résumé, narrative), captures goals, asks adaptive questions (5/10/20 depth), generates 8–12 research-backed ideas, and creates 4-week actionable plans with auto-generated artifacts (résumé, templates, learning plans). Progress is gamified with XP, streaks, and badges.

**Target Outcome**: First-session activation (questionnaire → plan) ≥40%; 12-week retention ≥30%; measurable milestone (interview, client, portfolio, first dollar) within 4–12 weeks for ≥50% of users.

**Tech Approach**: TypeScript monorepo (Turborepo) with Next.js 15 (Vercel), Supabase (Postgres + Auth + Storage + RLS), background workers (Railway + QStash), GPT-5-nano for MVP synthesis, PostHog analytics. 6-week MVP timeline with 52 tasks across 4 milestones.

**Key Risks** (see [risk-register.md](./risk-register.md)):
1. **HIGH**: Idea quality below user expectations (L4×I4=16) → Mitigate: golden fixtures, human review
2. **HIGH**: LLM cost/latency overruns (L4×I3=12) → Mitigate: caching, streaming, lightweight model
3. **MEDIUM**: User motivation drop-off (L5×I2=10) → Mitigate: gamification, weekly check-ins

**Critical Success Factors**:
- Activation rate ≥40% (questionnaire → plan in first session)
- P95 latency <1.5s (non-LLM), <20s (LLM with streaming)
- WCAG 2.1 AA compliance (automated + manual testing)
- Zero constitutional violations (37 principles enforced)

**Go/No-Go Criteria**: All 21 critical (P0) tasks in Milestone 0 (Project Setup) must pass CI + security review before proceeding to Milestone 1.

---

## 1. Problem Framing & Value

### Jobs-to-be-Done (JTBD)

#### Primary Job
**When** I feel stuck in my career or want to increase my income, **I want to** discover personalized, actionable opportunities that leverage my existing skills **so that** I can make tangible progress within 4–12 weeks without spending months researching or paying for expensive coaching.

#### Supporting Jobs
1. **Validate Ideas**: "Help me assess if this career move is realistic given my background"
2. **Build Artifacts**: "Give me a résumé/portfolio/pitch that positions me for this new direction"
3. **Stay Accountable**: "Keep me on track with structured milestones and encouragement"

#### Anti-Jobs (What Users Don't Want)
- Generic advice ("update your LinkedIn") without personalization
- Overwhelming 6-month plans with 100+ tasks
- Judgment or gatekeeping ("you're not qualified for that")
- Dark patterns (forced subscriptions, fake urgency)

### Target Outcomes

**First Session** (8–15 minutes):
- User completes profile + goal + questionnaire
- Receives 8–12 personalized ideas with scores + explanations
- Selects ≥1 idea
- Gets 4-week plan with 10–20 tasks + 5 artifacts

**4–12 Weeks**:
- User completes ≥50% of plan tasks
- Achieves first measurable milestone:
  - **Career**: Interview scheduled, informational meeting, portfolio published, certification earned
  - **Financial**: First freelance client, first dollar earned, savings goal milestone

**6 Months**:
- Career transitioned (new role secured or career pivot validated)
- Income trajectory changed ($X additional monthly income or path to it)
- User becomes self-sufficient (internalized framework for future decisions)

### Opportunity Tree

```
User Goal
│
├── INPUTS → Profile (LinkedIn + résumé + narrative) + Goal + Questionnaire (5/10/20)
│   ├── Constraint: Consent per source, PII redaction
│   └── Quality Gate: Validation rejects vague goals, enforces protected attribute exclusion
│
├── IDEAS → 8–12 research-backed opportunities (employee, freelance, builder)
│   ├── Scoring: Fit, Market, Speed, Risk (0–100)
│   ├── Explainability: "Why this fits" with citations
│   └── Quality Gate: Diversity rule (≥1 of each category), ethical exclusions (MLM, crypto, gambling)
│
├── PLANS → 4-week structured plan (10–20 tasks, weekly milestones)
│   ├── Constraint: Respects hours/week, budget
│   └── Quality Gate: Measurable outcomes, editable
│
├── ARTIFACTS → Auto-generated materials (résumé, LinkedIn, templates, portfolio brief, learning plan)
│   ├── Editing: Rich text editor, version history
│   └── Export: PDF/DOCX, copy-to-clipboard
│
└── OUTCOMES → XP/levels, streaks, badges, weekly check-ins
    ├── Measurement: Task completion, milestone achievement, NPS
    └── Retention: 12-week retention ≥30%, time-to-first-outcome ≤14 days
```

### Value Hypothesis

**Hypothesis**: If we provide personalized, research-backed ideas with actionable 4-week plans, then ≥40% of users will complete the critical path (signup → plan) in their first session, and ≥50% will achieve a measurable milestone within 4–12 weeks.

**Leading Indicators**:
- Activation rate (daily): % signup → plan
- Selection rate (daily): Avg # ideas selected per user
- Task completion rate (weekly): % of tasks marked complete by week
- Engagement (daily): Return rate within 7 days

**Lagging Indicators**:
- Time-to-first-outcome (monthly cohort): Median days to milestone
- 12-week retention (cohort): % return weeks 9–12
- NPS (survey): Promoters (9–10) − Detractors (0–6)

---

## 2. User, Data, and Ethics

### Persona Fit

**Primary Persona 1: Career Switcher "Alex"**
- **Demographics**: 28–40 years old, 5–10 years experience, mid-career
- **Context**: Feels stuck in current role/industry; wants to leverage existing skills in new direction
- **Goals**: Transition to remote-friendly, higher-paying, or more fulfilling role within 6 months
- **Constraints**: 10–15 hrs/week available, risk-averse (can't quit immediately), family obligations
- **Resonance**: HIGH—Junielyfe's 4-week plans with transferable skills emphasis fit perfectly

**Primary Persona 2: Freelancer/Solopreneur "Jordan"**
- **Demographics**: 25–45 years old, currently employed or underemployed
- **Context**: Wants side income or to go full-time independent; unsure how to start
- **Goals**: Land first 3 freelance clients or validate micro-SaaS idea within 3 months
- **Constraints**: 5–10 hrs/week, limited budget for tools, needs clear steps
- **Resonance**: HIGH—Outreach templates, portfolio brief, and learning plan remove friction

**Primary Persona 3: Public Sector Professional "Sam"**
- **Demographics**: 30–50 years old, law enforcement, government, teaching
- **Context**: Burnout, limited growth, wants career mobility without starting from scratch
- **Goals**: Leverage analytical/interpersonal skills into private sector roles (compliance, security, training)
- **Constraints**: 10 hrs/week, risk-averse, needs clear validation
- **Resonance**: HIGH—Idea validation + artifact generation build confidence

### Anti-Personas (Who We Don't Serve in MVP)

1. **Executive Seeking C-Suite Role**: Needs high-touch executive coaching, not self-serve tool
2. **Student Without Work History**: Lacks experience data for meaningful idea generation
3. **Entrepreneur Building VC-Backed Startup**: Needs product-market fit validation, not 4-week plans
4. **User Seeking Get-Rich-Quick Schemes**: Misaligned expectations; ethical exclusions reject these

### Edge Cases

| Scenario | User Action | System Response | Priority |
|----------|-------------|-----------------|----------|
| **Résumé in unsupported format** | Upload .pages or .txt | Error: "Unsupported format. Upload PDF/DOCX" | P0 |
| **LinkedIn OAuth denial** | Denies permissions | "LinkedIn optional—continue with manual entry" | P0 |
| **Vague goal** | Types "be successful" | Validation: "Please be more specific—target role?" | P0 |
| **Unrealistic goal** | "$1M in 1 week" | Warning: "Ambitious! Break into milestones?" | P1 |
| **0 or >3 ideas selected** | Clicks "Create Plan" | Validation: "Select 1–3 ideas" (button disabled) | P0 |
| **LLM timeout** | Idea generation fails | Error: "Trouble generating. Retry?" + partial results | P0 |
| **Mid-questionnaire abandon** | Closes browser | Auto-save → resume from last question | P1 |
| **Rapid task mark/unmark** | Games XP system | Anti-gaming: 15-second delay, no duplicate XP | P2 |

### Data Classification Matrix

| Data Type | Classification | Collection | Processing | Retention | Deletion |
|-----------|----------------|------------|------------|-----------|----------|
| **Email, Name** | PII | Signup (consent) | Auth, notifications | 30 days post-delete | 24h + 30d backup |
| **LinkedIn Profile URL** | Public | OAuth (consent) | Idea generation | 30 days post-delete | 24h + 30d backup |
| **Résumé (full text)** | Confidential + PII | Upload (consent) | Parsing, PII redaction → LLM | 30 days post-delete | 24h + 30d backup |
| **Narrative (freeform text)** | Confidential | Text area (consent) | PII redaction → LLM | 30 days post-delete | 24h + 30d backup |
| **Questionnaire Answers** | Confidential | Form submissions | Idea generation | 30 days post-delete | 24h + 30d backup |
| **Generated Ideas** | Internal | LLM generation | Display, selection | 7 days cached | N/A (regeneratable) |
| **Plans, Tasks, Artifacts** | Confidential | User creation + LLM | Display, editing, export | 30 days post-delete | 24h + 30d backup |
| **XP, Streaks, Badges** | Internal | Gamification logic | Display, progress tracking | 30 days post-delete | 24h + 30d backup |
| **Analytics Events** | Anonymous (hashed user_id) | PostHog SDK | Aggregate metrics | 30 days auto-purge | Automatic |
| **Server Logs** | Internal (hashed user_id) | Application runtime | Debugging | 30 days auto-purge | Automatic |

**PII Redaction** (server-side before LLM calls):
- **Remove**: Street addresses, phone numbers, SSN, full birthdates
- **Keep**: Year only (for experience calculations), job titles, employers, skills, city/state

### Consent Journeys

**LinkedIn Consent** (OAuth flow):
1. User clicks "Connect LinkedIn"
2. Redirect to LinkedIn OAuth with scopes: `r_liteprofile`, `r_emailaddress`
3. LinkedIn consent screen: "Junielyfe wants to access your name, email, and public profile URL"
4. User approves → redirected back with data
5. App stores: name, email, profile URL + sets `profiles.consents.linkedin = true`
6. User can disconnect anytime (Settings → Privacy → "Disconnect LinkedIn")

**Résumé Consent** (upload):
1. User reaches résumé upload step
2. Consent text: "We'll use your résumé to personalize ideas. We'll remove sensitive info (addresses, phone numbers) before analysis. You can export or delete anytime."
3. User uploads → parsing → editable fields
4. App stores: résumé file in Supabase Storage + parsed data in `profiles.parsed_data` + sets `profiles.consents.resume = true`

**Narrative Consent** (text area):
1. User reaches narrative step
2. Consent text: "Tell us your story. We'll use this to understand your background and goals. You can export or delete anytime."
3. User writes → auto-save every 30s
4. App stores: narrative in `profiles.narrative` + sets `profiles.consents.narrative = true`

**Skip Logic**: User can skip any data source → proceed with partial data → ideas adapted to available data

### Export & Delete Flows

**Export Flow**:
1. User: Settings → Privacy → "Export My Data"
2. Choice: JSON (raw) or PDF (readable)
3. System: Fetches all user data (profile, goals, answers, ideas, plans, tasks, artifacts)
4. If <10s: Immediate download link
5. If >10s: Background job → email link when ready
6. Export bundle includes: timestamp, data format, privacy policy link

**Delete Flow**:
1. User: Settings → Account → "Delete My Account"
2. Warning modal: "All data deleted within 24h. Cannot undo. Type DELETE to confirm."
3. User types "DELETE" → confirms
4. System: Soft delete (sets `users.deleted_at = NOW()`) → logout
5. Scheduled job (hourly): Purges soft-deleted accounts after 24h
6. Confirmation email: "Account deleted. Data removed from production. Backups purged within 30 days."

### Ethical Guardrails

**Excluded Idea Categories** (hard-coded filter):
- Multi-level marketing (MLM), pyramid schemes
- Day-trading, cryptocurrency speculation strategies
- Gambling, sports betting, games of chance as income
- Unlicensed professional services (legal/medical/financial advice without credentials)
- Illegal activities (dark web, piracy, drug trafficking)

**Keyword Filter** (post-generation):
```typescript
const EXCLUSION_KEYWORDS = [
  'MLM', 'multi-level marketing', 'pyramid scheme', 'network marketing',
  'forex', 'crypto day-trading', 'cryptocurrency trading',
  'gambling', 'sports betting', 'poker',
  'tax preparation without CPA', 'legal advice without license', 'medical diagnosis'
];
```

**Intensive Idea Flagging**: Ideas requiring >20 hrs/week tagged as "intensive" with warning: "This may require more time than typical side projects"

**Fabricated Facts Prevention**:
- Prompt system message: "Never fabricate statistics, success rates, or case studies. If data unavailable, use qualified statements or flag as exploratory."
- Post-generation validation: Check for suspiciously specific numbers (e.g., "87.3% of users report...") → flag for human review

---

## 3. Architecture & Technical Options

### C4 Context Diagram (Level 1)

```
┌─────────────────────────────────────────────────────────────────┐
│                         EXTERNAL SYSTEMS                        │
├─────────────────────────────────────────────────────────────────┤
│  [User]                                                         │
│    │                                                            │
│    ├──> [Junielyfe Web App] (Next.js 15, Vercel)               │
│    │         ├──> [Supabase] (Auth, DB, Storage)               │
│    │         ├──> [OpenAI API] (GPT-5-nano for idea/plan gen)  │
│    │         ├──> [LinkedIn OAuth] (Profile data)              │
│    │         └──> [PostHog] (Analytics events)                 │
│    │                                                            │
│    └──> [Background Worker] (Railway, QStash)                  │
│              ├──> [Supabase] (DB access)                       │
│              └──> [OpenAI API] (Idea/plan generation)          │
│                                                                 │
│  [Admin/Support]                                               │
│    └──> [Supabase Studio] (Database admin)                    │
│    └──> [PostHog Dashboard] (Metrics, cohorts)                │
└─────────────────────────────────────────────────────────────────┘
```

### C4 Container Diagram (Level 2)

```
┌────────────────────── Junielyfe System ──────────────────────────┐
│                                                                  │
│  [Web App] (Next.js 15 App Router, React 19, TypeScript)        │
│  ├── /app/auth                  # Auth routes (login, OAuth)    │
│  ├── /app/ingest                # Profile setup                 │
│  ├── /app/goal                  # Goal definition               │
│  ├── /app/questionnaire         # Adaptive questions            │
│  ├── /app/ideas                 # Idea results                  │
│  ├── /app/plan                  # Plan dashboard                │
│  ├── /app/artifacts             # Artifact editor               │
│  └── /app/api                   # API routes (Server Actions)   │
│                                                                  │
│  [Worker] (Node.js, Express, QStash)                            │
│  ├── /jobs/generate-ideas.ts    # Idea generation job           │
│  ├── /jobs/generate-plan.ts     # Plan generation job           │
│  ├── /jobs/generate-artifacts.ts # Artifact generation job      │
│  └── /jobs/send-checkin-email.ts # Weekly check-in email        │
│                                                                  │
│  [Shared Packages] (TypeScript)                                 │
│  ├── @junielyfe/core            # Business logic (scoring, etc) │
│  ├── @junielyfe/db              # Supabase client, types, Zod   │
│  ├── @junielyfe/agents          # LLM agents (idea/plan gen)    │
│  └── @junielyfe/ui              # Shared components (shadcn/ui) │
│                                                                  │
│  [Supabase] (Managed Services)                                  │
│  ├── Postgres 15 (with RLS)     # User data, plans, artifacts  │
│  ├── Supabase Auth               # JWT tokens, OAuth            │
│  └── Supabase Storage            # Résumé files (PDF/DOCX)      │
│                                                                  │
│  [OpenAI API] (GPT-5-nano)                                      │
│  └── Streaming completion endpoint                             │
│                                                                  │
│  [PostHog] (SaaS Analytics)                                     │
│  └── Event ingestion + dashboards                              │
└──────────────────────────────────────────────────────────────────┘
```

### Architectural Options & Trade-Offs

#### Option 1: Background Jobs (QStash vs Supabase Cron)

| Aspect | QStash (Upstash) | Supabase Cron (pg_cron) | Recommendation |
|--------|------------------|-------------------------|----------------|
| **Complexity** | Requires separate worker app + Railway deploy | Simpler: SQL-based cron + edge functions | QStash (better separation) |
| **Scalability** | Horizontal scaling (multiple workers) | Limited by DB connection pool | QStash |
| **Retries** | Built-in retries with exponential backoff | Manual retry logic required | QStash |
| **Cost** | Free tier: 500 req/day; $10/mo for 10K req | Included with Supabase (no extra cost) | Supabase Cron (MVP cost) |
| **Observability** | QStash dashboard + logs | Supabase logs | QStash |
| **Migration Risk** | Vendor lock-in (QStash-specific API) | Portable (pg_cron standard) | Tie |

**Decision**: Start with **QStash** for MVP (better retries, observability) → evaluate Supabase Cron post-launch if cost becomes issue

#### Option 2: Research Source (GPT-5-nano vs Perplexity Research API)

| Aspect | GPT-5-nano | Perplexity Research API | Recommendation |
|--------|-----------|------------------------|----------------|
| **Cost** | $0.15/1M input tokens, $0.60/1M output | $5/1K searches (citations included) | GPT-5-nano (MVP) |
| **Latency** | <2s first token, <20s complete | 10–15s per search (no streaming) | GPT-5-nano |
| **Research Quality** | Requires prompt engineering for citations | Automatic web search + citations | Perplexity (long-term) |
| **Caching** | Manual caching required | Built-in caching? (TBD) | Tie |
| **Vendor Lock-In** | OpenAI ecosystem | Perplexity-specific API | Tie |

**Decision**: Start with **GPT-5-nano** (MVP cost/latency優先) → swap to **Perplexity** post-launch for better research quality + citations

#### Option 3: Artifact Storage (DB TEXT vs Supabase Storage)

| Aspect | DB TEXT (Postgres) | Supabase Storage (S3-like) | Recommendation |
|--------|-------------------|---------------------------|----------------|
| **Simplicity** | Single source of truth (DB) | Separate file storage layer | DB TEXT |
| **Query Performance** | Can query artifact content (full-text search) | Cannot query file contents easily | DB TEXT |
| **Versioning** | Row-per-version (simple) | Requires custom version management | DB TEXT |
| **Cost** | Included in Supabase DB quota | $0.021/GB/month storage + bandwidth | DB TEXT (MVP) |
| **File Size Limits** | Postgres max row: 1GB (TEXT field ~1MB typical) | No practical limit | Storage (if >1MB) |
| **Export Complexity** | Simple SQL query | Requires signed URL generation | DB TEXT |

**Decision**: Use **DB TEXT** for all artifacts (MVP). Résumés use Supabase Storage (binary files). Artifacts (résumé rewrite, templates) use DB TEXT.

### Performance Budgets

| Metric | Target | Measurement |
|--------|--------|-------------|
| **P95 Response Time (Non-LLM)** | <1.5s | Vercel Analytics, PostHog RUM |
| **P95 API Response (Backend)** | <500ms | Server logs, APM |
| **LLM First Token** | <2s | Server logs, streaming events |
| **LLM Complete (Idea Gen)** | <20s | Server logs, PostHog events |
| **LLM Complete (Plan Gen)** | <20s | Server logs, PostHog events |
| **LLM Complete (Artifacts)** | <30s | Server logs, PostHog events |
| **First Contentful Paint (FCP)** | <2s on 4G | Lighthouse, WebPageTest |
| **Largest Contentful Paint (LCP)** | <2.5s | Lighthouse, Core Web Vitals |
| **Cumulative Layout Shift (CLS)** | <0.1 | Lighthouse, Core Web Vitals |
| **First Input Delay (FID)** | <100ms | Lighthouse, Core Web Vitals |
| **Bundle Size (Initial JS)** | <300KB (gzipped) | Next.js Bundle Analyzer |

### Caching & Streaming Strategy

**Caching Layers**:
1. **Research Cache** (`research_cache` table):
   - Key: `hash(profile + goal)`
   - TTL: 7 days (invalidate after 30 days or user request)
   - Reduces LLM calls by >50% for repeated queries

2. **Idea Cache** (`idea_sets` table):
   - Key: `user_id + session_id`
   - TTL: 7 days
   - Avoid regenerating ideas on repeated views

3. **Static Assets** (Next.js):
   - Versioned URLs with far-future expiry (1 year)
   - CDN caching (Vercel Edge Network)

**Streaming Strategy**:
- **Server-Sent Events (SSE)** for LLM progress:
  ```typescript
  // API route: /api/ideas/generate
  export async function POST(req: Request) {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        controller.enqueue(encoder.encode('event: progress\ndata: {"status":"analyzing"}\n\n'));
        // ... LLM streaming ...
        controller.enqueue(encoder.encode('event: done\ndata: {"ideas":[...]}\n\n'));
        controller.close();
      }
    });
    return new Response(stream, { headers: { 'Content-Type': 'text/event-stream' } });
  }
  ```

### Proposed ADRs (see [adr-candidates.md](./adr-candidates.md))

1. **ADR-001**: Turborepo Monorepo vs Multi-Repo
2. **ADR-002**: QStash vs Supabase Cron for Background Jobs
3. **ADR-003**: GPT-5-nano vs Perplexity Research API
4. **ADR-004**: Artifact Storage (DB TEXT vs Supabase Storage)
5. **ADR-005**: Row-Level Security (RLS) vs Application-Level Access Control
6. **ADR-006**: PostHog vs Mixpanel vs Amplitude for Analytics

---

## 4. Security & Privacy Threat Model

### STRIDE Threat Analysis

| Threat Category | Attack Vector | Mitigation | Priority |
|----------------|---------------|------------|----------|
| **Spoofing** | User A impersonates User B by guessing JWT | JWT expiry (7 days), HTTP-only cookies, refresh tokens | P0 |
| **Tampering** | User modifies plan_id in API request to access User B's plan | RLS policies: `auth.uid() = user_id` on all tables | P0 |
| **Repudiation** | User denies deleting own data | Audit log: deletion requests logged for 90 days | P1 |
| **Information Disclosure** | Cross-user data leak via SQL injection | Supabase parameterized queries (no raw SQL), RLS | P0 |
| **Information Disclosure** | PII leakage to LLM training data | Server-side PII redaction before API calls | P0 |
| **Denial of Service** | Attacker floods idea generation endpoint | Rate limiting: 100 req/min per user, 5 idea gen/hour | P1 |
| **Elevation of Privilege** | User escalates to admin via API manipulation | No admin endpoints in production; Supabase RLS enforced | P0 |

### RLS Attack Surface Review

**Attack Surface**: All user-facing tables (`profiles`, `goals`, `questionnaire_sessions`, `answers`, `idea_sets`, `ideas`, `plans`, `tasks`, `artifacts`, `progress`, `user_badges`)

**RLS Policy Template** (applied to every table):
```sql
-- Example: profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- SELECT policy
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

-- UPDATE policy
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- INSERT policy
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- No DELETE policy (soft delete via deleted_at column)
```

**Integration Test** (cross-user access):
```typescript
test('RLS prevents cross-user access', async () => {
  const userA = await createUser('a@example.com');
  const userB = await createUser('b@example.com');

  await createProfile(userA, { narrative: 'User A narrative' });

  const supabaseB = createClient(userB.token);
  const { data, error } = await supabaseB.from('profiles').select('*').eq('user_id', userA.id);

  expect(data).toHaveLength(0); // User B cannot see User A's profile
  expect(error).toBeNull(); // Not an error, just 0 rows returned
});
```

### Storage Policies

**Supabase Storage Buckets**:
- **`resumes/`**: User-uploaded résumé files (PDF/DOCX)
  - RLS Policy: `auth.uid() = <user_id_from_path>`
  - Max file size: 5MB
  - Allowed MIME types: `application/pdf`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`

**Storage Policy**:
```sql
-- resumes bucket: users can only access own files
CREATE POLICY "Users can upload own résumés"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'resumes' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can read own résumés"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'resumes' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own résumés"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'resumes' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

### LINDDUN Privacy Assessment (Lite)

| Privacy Threat | Scenario | Mitigation | Priority |
|----------------|----------|------------|----------|
| **Linkability** | Attacker links user's narrative to LinkedIn profile via writing style | Consent per source; user controls what to share | P2 |
| **Identifiability** | Hashed user_id in logs can be reverse-engineered | Use UUIDs (not sequential IDs); rotate log encryption keys | P1 |
| **Non-repudiation** | User cannot deny deleting account (email confirmation proves intent) | Acceptable; deletion audit log for compliance | P2 |
| **Detectability** | Attacker infers user activity via analytics events | Anonymized events (hashed user_id only); no PII | P1 |
| **Disclosure of Information** | PII leaked via LLM prompt logs | Server-side redaction before API calls; OpenAI zero-retention mode | P0 |
| **Unawareness** | User unaware data is used for LLM training | Privacy policy: "We do not share data with third parties for training" | P0 |
| **Non-compliance** | GDPR/CCPA violations (no export, no delete) | Export within 10s, delete within 24h; privacy policy updated | P0 |

### Prompt Redaction Strategy

**PII Redaction Function** (server-side):
```typescript
// packages/agents/src/utils/redact-pii.ts
export function redactPII(text: string): string {
  let redacted = text;

  // Phone numbers
  redacted = redacted.replace(/(\+?1[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/g, '[PHONE]');

  // SSN
  redacted = redacted.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN]');

  // Full birthdates (keep year only)
  redacted = redacted.replace(/\b(\d{1,2}[-/]\d{1,2}[-/]\d{4})\b/g, (match) => {
    const year = match.match(/\d{4}/)?.[0];
    return year ? `[DATE-${year}]` : '[DATE]';
  });

  // Street addresses
  redacted = redacted.replace(/\b\d+\s+[A-Z][a-z]+(\s+[A-Z][a-z]+)*\s+(Street|St|Avenue|Ave|Road|Rd)\b/gi, '[ADDRESS]');

  return redacted;
}
```

**Unit Test Coverage**: 100% PII removal verified with 100 sample résumé texts

### Secrets Management & Key Rotation

**Environment Variables** (`.env.example`):
```bash
# Auth
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJhb... (public key)
SUPABASE_SERVICE_ROLE_KEY=eyJhb... (⚠️ SECRET - server-only)

# AI
OPENAI_API_KEY=sk-proj-... (⚠️ SECRET)

# Analytics
NEXT_PUBLIC_POSTHOG_KEY=phc_... (public key)
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

# Background Jobs
QSTASH_CURRENT_SIGNING_KEY=... (⚠️ SECRET)
QSTASH_NEXT_SIGNING_KEY=... (⚠️ SECRET)
QSTASH_URL=https://qstash.upstash.io/v2/publish/...

# Email
RESEND_API_KEY=re_... (⚠️ SECRET)
```

**Key Rotation Policy**:
- **Quarterly**: Rotate `OPENAI_API_KEY`, `QSTASH_*_SIGNING_KEY`
- **Annually**: Rotate `SUPABASE_SERVICE_ROLE_KEY` (coordinate with Supabase support)
- **Immediately**: Rotate any key exposed in logs, commits, or public repos

**Secrets Storage**:
- **Development**: `.env.local` (gitignored)
- **Production**: Vercel Environment Variables + Railway Secrets (encrypted at rest)

### Supply Chain Security

**Dependency Auditing**:
- **Snyk** (GitHub Action): Weekly scans for high/critical vulnerabilities
- **npm audit**: Pre-commit hook blocks commits with known vulnerabilities
- **Dependabot**: Auto-creates PRs for security updates

**Lockfile Integrity**:
- `pnpm-lock.yaml` committed to repo
- CI fails if lockfile out of sync with `package.json`

**Trusted Dependencies Only**:
- Avoid dependencies with <100 GitHub stars or <1 year history
- Review `postinstall` scripts (potential supply chain attacks)

---

## 5. Data Flows & Compliance

### End-to-End Data Flow Diagram (DFD)

```
┌──────────────────────── USER BROWSER ────────────────────────┐
│                                                               │
│  1. User signs up (email/password OR Google/LinkedIn OAuth)  │
│     └──> POST /api/auth/signup                               │
│          ├──> Supabase Auth (JWT token issued)               │
│          └──> Create `users` row (id, email, created_at)     │
│                                                               │
│  2. User connects LinkedIn (OAuth)                           │
│     └──> GET /auth/linkedin/callback?code=...                │
│          ├──> LinkedIn API (fetch profile: name, email, URL) │
│          ├──> Create/update `profiles` row (linkedin_url)    │
│          └──> Set `profiles.consents.linkedin = true`        │
│                                                               │
│  3. User uploads résumé (PDF/DOCX)                           │
│     └──> POST /api/profile/upload-resume                     │
│          ├──> Supabase Storage (save file: resumes/<uid>/*)  │
│          ├──> Parse résumé (pdf-parse, mammoth)              │
│          ├──> PII redaction (remove phone, address, SSN)     │
│          ├──> Update `profiles.parsed_data` (roles, skills)  │
│          └──> Set `profiles.consents.resume = true`          │
│                                                               │
│  4. User writes narrative (auto-save every 30s)              │
│     └──> PATCH /api/profile/narrative                        │
│          ├──> Update `profiles.narrative`                    │
│          └──> Set `profiles.consents.narrative = true`       │
│                                                               │
│  5. User defines goal + constraints                          │
│     └──> POST /api/goals                                     │
│          └──> Insert `goals` row (type, target, constraints) │
│                                                               │
│  6. User completes questionnaire (5/10/20 questions)         │
│     └──> POST /api/questionnaire/sessions (create session)   │
│          └──> POST /api/questionnaire/answers (per question) │
│               └──> Insert `answers` rows (session_id, answer)│
│                                                               │
│  7. User clicks "Generate Ideas"                             │
│     └──> POST /api/ideas/generate                            │
│          ├──> Check `research_cache` (hit → return cached)   │
│          ├──> PII redaction (profile + narrative + answers)  │
│          ├──> LLM API call (OpenAI GPT-5-nano, streaming)    │
│          │    Prompt: {redacted_profile, goal, answers}      │
│          │    System message: ethical exclusions, no fabrication│
│          ├──> Ethical filter (keyword check: MLM, crypto)    │
│          ├──> Diversity enforcement (≥1 employee/freelance/builder)│
│          ├──> Scoring (fit, market, speed, risk)             │
│          ├──> Insert `idea_sets`, `ideas` rows               │
│          ├──> Insert `research_cache` (TTL 7 days)           │
│          └──> Return ideas (streaming SSE)                   │
│                                                               │
│  8. User selects 1–3 ideas → clicks "Create Plan"            │
│     └──> POST /api/plans/create                              │
│          ├──> Validate selection (1–3 ideas)                 │
│          ├──> Publish QStash job: generate-plan              │
│          └──> Return job_id (polling endpoint for progress)  │
│                                                               │
│  9. Background Worker: Generate Plan                         │
│     └──> QStash webhook: /worker/jobs/generate-plan          │
│          ├──> Fetch profile, goal, selected ideas            │
│          ├──> LLM API call (plan generation, 4 weeks, 10-20 tasks)│
│          ├──> Insert `plans`, `tasks` rows                   │
│          ├──> Publish QStash job: generate-artifacts         │
│          └──> Send webhook: plan_ready event                 │
│                                                               │
│  10. Background Worker: Generate Artifacts                   │
│      └──> QStash webhook: /worker/jobs/generate-artifacts    │
│           ├──> Fetch profile, plan, selected ideas           │
│           ├──> LLM API call (5 artifacts: résumé, LinkedIn, templates, brief, learning)│
│           ├──> Insert `artifacts` rows (content TEXT)        │
│           └──> Send webhook: artifacts_ready event           │
│                                                               │
│  11. User views plan dashboard                               │
│      └──> GET /api/plans/<plan_id>                           │
│           └──> Fetch `plans`, `tasks` (RLS: only own data)   │
│                                                               │
│  12. User marks task complete                                │
│      └──> PATCH /api/tasks/<task_id>/complete                │
│           ├──> Update `tasks.status = completed`             │
│           ├──> Award XP: update `progress.xp += task.xp_value`│
│           ├──> Check level-up: if xp >= threshold → increment level│
│           ├──> PostHog event: task.completed                 │
│           └──> Return updated progress (XP, level, streak)   │
│                                                               │
│  13. User exports data (JSON/PDF)                            │
│      └──> GET /api/export?format=json                        │
│           ├──> Fetch all user data (profile, goals, plans, artifacts)│
│           ├──> Generate JSON or PDF bundle                   │
│           ├──> If <10s: return download link                 │
│           └──> If >10s: publish QStash job → email link      │
│                                                               │
│  14. User requests account deletion                          │
│      └──> DELETE /api/account                                │
│           ├──> Set `users.deleted_at = NOW()`                │
│           ├──> Logout (invalidate JWT)                       │
│           ├──> Send email: "Deletion scheduled (24h)"        │
│           └──> Hourly job: purge soft-deleted accounts after 24h│
└───────────────────────────────────────────────────────────────┘

┌──────────────────── ANALYTICS & LOGS ────────────────────────┐
│  PostHog Events (anonymized, hashed user_id):                │
│  - auth.signup, auth.login                                   │
│  - ingest.linkedin_connected, ingest.resume_uploaded         │
│  - goal.created, questionnaire.completed                     │
│  - ideas.generated, ideas.selected                           │
│  - plan.created, task.completed                              │
│  - artifact.viewed, artifact.exported                        │
│  - export.requested, account.deletion_requested             │
│                                                               │
│  Server Logs (structured JSON, ≤30 days retention):          │
│  - API request/response (no PII except hashed user_id)       │
│  - LLM API calls (prompt hash, token count, latency)         │
│  - Errors (stack traces, request context)                    │
└───────────────────────────────────────────────────────────────┘
```

### PII Map (Collection → Processing → Retention → Deletion)

| PII Type | Collection Point | Processing | Retention | Deletion |
|----------|------------------|------------|-----------|----------|
| **Email** | Signup form | Auth, notifications | 30 days post-delete | 24h + 30d backup |
| **Name** | LinkedIn OAuth | Profile display | 30 days post-delete | 24h + 30d backup |
| **Phone** | Résumé upload | Redacted before LLM | N/A (redacted) | N/A |
| **Address** | Résumé upload | Redacted before LLM | N/A (redacted) | N/A |
| **SSN** | Résumé upload | Redacted before LLM | N/A (redacted) | N/A |
| **Birthdate (full)** | Résumé upload | Year extracted, day/month redacted | Year only stored | 24h + 30d backup |
| **Narrative (freeform)** | Text area | Redacted, passed to LLM | 30 days post-delete | 24h + 30d backup |
| **Job titles, employers** | Résumé, LinkedIn | Passed to LLM (not redacted) | 30 days post-delete | 24h + 30d backup |

### Log Retention Policy

**Application Logs**:
- **Retention**: ≤30 days (auto-purged)
- **Contents**: API requests, errors, LLM calls (no PII except hashed user_id)
- **Format**: Structured JSON (timestamp, level, user_id_hash, message, context)

**Analytics Events** (PostHog):
- **Retention**: 30 days (auto-purged by PostHog)
- **Contents**: Event name, hashed user_id, timestamp, properties (no PII)
- **Aggregation**: Daily batch jobs compute metrics → stored indefinitely (no user_id)

**Security Logs** (Audit Trail):
- **Retention**: 90 days (compliance requirement)
- **Contents**: Failed logins, password resets, data exports, account deletions
- **Format**: Structured JSON (user_id, IP, action, timestamp, outcome)

**Database Backups**:
- **Retention**: 30 days (Supabase managed)
- **Purge Policy**: Backups containing deleted user data purged after 30 days OR anonymized (user_id replaced with `deleted_<timestamp>`)

---

## 6. Risks & Assumptions (RAID)

See detailed [risk-register.md](./risk-register.md) for full RAID log with scoring.

**Top 5 Risks (by score = Likelihood × Impact)**:

1. **Idea Quality Below Expectations** (L4×I4=16, HIGH)
   - User expectations: "Give me the perfect career path"
   - Reality: LLM-generated ideas may be generic or off-target
   - **Mitigation**: Golden fixtures, human review of 100 sample idea sets pre-launch

2. **LLM Cost/Latency Overruns** (L4×I3=12, HIGH)
   - Assumption: GPT-5-nano <$0.01/user journey
   - Risk: Unexpected usage spikes → $1000+/day cost
   - **Mitigation**: Caching (7-day TTL), rate limiting (5 gen/hour), cost alerts ($100/day threshold)

3. **User Motivation Drop-Off** (L5×I2=10, MEDIUM)
   - Assumption: Gamification sustains engagement
   - Risk: Users abandon plan after Week 1 (motivation decay)
   - **Mitigation**: Weekly check-ins, supportive microcopy, adjustable plans

4. **OAuth Friction** (L3×I3=9, MEDIUM)
   - Assumption: Users trust LinkedIn OAuth
   - Risk: User denies permissions → incomplete profile
   - **Mitigation**: Skip logic (proceed with partial data), manual entry option

5. **Résumé Parsing Accuracy <80%** (L4×I2=8, MEDIUM)
   - Assumption: pdf-parse + mammoth extract 80% of roles/skills
   - Risk: Poor extraction → bad ideas
   - **Mitigation**: Editable fields, manual correction, parser fallback

**Key Assumptions**:
- Users have LinkedIn profiles (mitigate: manual entry)
- Users can commit 5–20 hrs/week (mitigate: adjustable constraints)
- Users want structured plans (mitigate: editable plans)
- GPT-5-nano sufficient for MVP (mitigate: swap to GPT-4o or Perplexity if needed)

---

## 7. Experiment & Measurement Plan

### Hypotheses & Leading Indicators

**Hypothesis 1: Personalization Drives Activation**
- **Claim**: If we provide 8–12 personalized ideas (vs generic job board), then ≥40% of users will select ≥1 idea in first session
- **Leading Indicator**: Selection rate (daily): % users selecting ≥1 idea; distribution (0/1/2/3 ideas)
- **Rollback Criteria**: If selection rate <30% after 100 users, redesign idea presentation

**Hypothesis 2: Gamification Sustains Engagement**
- **Claim**: If we award XP + streaks, then ≥60% of users will return within 7 days (Week 2)
- **Leading Indicator**: Week 2 return rate (daily): % users active in days 8–14 post-signup
- **Rollback Criteria**: If Week 2 return <40% after 100 users, reduce XP friction or add push notifications

**Hypothesis 3: Artifacts Accelerate Outcomes**
- **Claim**: If we auto-generate résumé + templates, then median time-to-first-outcome ≤14 days (vs 21 days without artifacts)
- **Leading Indicator**: Artifact usage (daily): % users editing/exporting artifacts
- **Rollback Criteria**: If <50% of users use artifacts, simplify artifact UI or reduce count

### Metrics Instrumentation

**PostHog Events** (see [metrics.md](./metrics.md) for full list):
```typescript
// Critical path events
posthog.capture('auth.signup', { method: 'email', userId, timestamp });
posthog.capture('ingest.complete', { dataSourcesUsed: ['linkedin', 'resume', 'narrative'], userId, timestamp });
posthog.capture('goal.created', { type: 'career', horizon: 6, userId, timestamp });
posthog.capture('questionnaire.completed', { depth: 10, durationSeconds: 320, userId, timestamp });
posthog.capture('ideas.generated', { ideaCount: 10, durationSeconds: 18, userId, timestamp });
posthog.capture('ideas.selected', { selectedCount: 2, userId, timestamp });
posthog.capture('plan.created', { taskCount: 15, userId, timestamp });
posthog.capture('task.completed', { taskId, xpEarned: 10, userId, timestamp });
```

**Dashboards** (PostHog):
1. **KPI Dashboard**: Activation, selection rate, 12-week retention, NPS
2. **Funnel**: Signup → profile → goal → questionnaire → ideas → plan (conversion rate per step)
3. **Engagement**: Tasks completed, XP earned, streaks, badges

### SLI/SLO + Error Budget Policy

See detailed [slis-slos.md](./slis-slos.md) for full SLI/SLO definitions.

**Key SLOs**:
- **Availability**: ≥99.5% uptime (excludes planned maintenance)
- **Latency**: P95 <1.5s for non-LLM routes, P95 <20s for LLM routes
- **Idea Generation Success Rate**: ≥95% (within 20s, no errors)
- **Activation Rate**: ≥40% (signup → plan in first session)

**Error Budget**: 0.5% downtime = 3.6 hours/month
- **Policy**: If error budget exhausted, freeze non-critical feature work → focus on reliability

### Rollback Criteria

| Feature | Metric | Threshold | Action |
|---------|--------|-----------|--------|
| **Idea Generation** | Success rate <90% after 100 users | <90% | Rollback to manual curation, debug LLM prompts |
| **Gamification** | Week 2 return <40% after 100 users | <40% | Simplify XP system, add push notifications |
| **Artifacts** | Usage rate <50% after 100 users | <50% | Reduce artifact count, simplify UI |
| **Weekly Check-Ins** | Email open rate <10% | <10% | Revise subject lines, reduce frequency |

---

## 8. Test Strategy

### Unit Tests (Vitest)

**Coverage Target**: ≥70% for business logic (packages/core, packages/agents, packages/db)

**Key Test Areas**:
1. **Scoring Functions** (`packages/core/scoring`):
   - Deterministic: same inputs → same outputs
   - Edge cases: empty profile, vague idea, missing constraints
   ```typescript
   test('fitScore is deterministic', () => {
     const profile = { skills: ['Python', 'SQL'], experience: 5 };
     const idea = { requiredSkills: ['Python'], title: 'Data Analyst' };
     const score1 = fitScore(profile, idea);
     const score2 = fitScore(profile, idea);
     expect(score1).toBe(score2);
   });
   ```

2. **PII Redaction** (`packages/agents/utils/redact-pii.ts`):
   - 100 sample résumé texts → 100% PII removal
   ```typescript
   test('redacts phone numbers', () => {
     const input = 'Call me at (555) 123-4567';
     const output = redactPII(input);
     expect(output).not.toContain('555-123-4567');
     expect(output).toContain('[PHONE]');
   });
   ```

3. **Questionnaire Engine** (`packages/core/questionnaire`):
   - Skip logic: detailed answer → skips follow-up
   - Adaptive depth: 5/10/20 questions render correctly

4. **Zod Schemas** (`packages/db/schema.ts`):
   - Valid inputs pass validation
   - Invalid inputs fail with clear errors

### Integration Tests (Vitest + Supabase)

**Coverage Target**: Critical user paths (signup → plan creation)

**Key Test Areas**:
1. **RLS Isolation**:
   ```typescript
   test('User A cannot access User B data', async () => {
     const userA = await createUser('a@example.com');
     const userB = await createUser('b@example.com');
     await createProfile(userA, { narrative: 'User A' });

     const supabaseB = createClient(userB.token);
     const { data } = await supabaseB.from('profiles').select('*').eq('user_id', userA.id);

     expect(data).toHaveLength(0); // User B cannot see User A's profile
   });
   ```

2. **Idea Generation Workflow**:
   - Create profile → goal → questionnaire → generate ideas
   - Verify: 8–12 ideas, diversity rule, ethical filter

3. **Plan Generation Workflow**:
   - Select 2 ideas → create plan
   - Verify: 10–20 tasks, respects hours/week constraint

### E2E Tests (Playwright)

**Coverage Target**: Critical paths + edge cases

**Key Test Scenarios**:
1. **Happy Path (Full Flow)**:
   ```typescript
   test('User can create plan from scratch', async ({ page }) => {
     await page.goto('/auth/signup');
     await page.fill('[name="email"]', 'test@example.com');
     await page.fill('[name="password"]', 'P@ssw0rd123');
     await page.click('button:text("Sign Up")');

     // Profile setup
     await page.click('button:text("Skip LinkedIn")');
     await page.click('button:text("Skip Résumé")');
     await page.fill('textarea[name="narrative"]', 'I am a law enforcement officer...');
     await page.click('button:text("Continue")');

     // Goal
     await page.click('button:text("Career Goal")');
     await page.fill('[name="target"]', 'Transition to fraud analyst');
     await page.selectOption('[name="horizon"]', '6');
     await page.click('button:text("Continue")');

     // Questionnaire (Quick: 5)
     await page.click('button:text("Quick")');
     for (let i = 0; i < 5; i++) {
       await page.fill('textarea[name="answer"]', 'Sample answer...');
       await page.click('button:text("Next")');
     }

     // Idea generation
     await page.click('button:text("Generate Ideas")');
     await page.waitForSelector('h1:text("We found")', { timeout: 25000 });

     // Idea selection
     await page.click('input[type="checkbox"]', { count: 2 });
     await page.click('button:text("Create My Plan")');

     // Plan ready
     await page.waitForSelector('h1:text("Your plan is ready")', { timeout: 25000 });
     expect(page.url()).toContain('/plan');
   });
   ```

2. **Edge Cases**:
   - LinkedIn OAuth failure → manual entry fallback
   - LLM timeout → retry with partial results
   - 0 or >3 ideas selected → validation error
   - Vague goal → rejection with helpful message

### MSW Mocks (API)

**Mock External APIs**:
1. **OpenAI API** (idea/plan generation):
   ```typescript
   server.use(
     rest.post('https://api.openai.com/v1/chat/completions', (req, res, ctx) => {
       return res(ctx.json({
         choices: [{ message: { content: JSON.stringify(mockIdeas) } }]
       }));
     })
   );
   ```

2. **LinkedIn OAuth**:
   ```typescript
   server.use(
     rest.get('https://api.linkedin.com/v2/me', (req, res, ctx) => {
       return res(ctx.json({ id: 'linkedin_user_123', firstName: 'Test' }));
     })
   );
   ```

### Golden Fixtures (LLM Outputs)

**Purpose**: Regression testing for LLM prompt changes

**Example Fixture** (`packages/agents/__tests__/fixtures/idea-generation.json`):
```json
{
  "input": {
    "profile": { "skills": ["Python", "SQL"], "experience": 5, "narrative": "..." },
    "goal": { "type": "career", "target": "Data Analyst", "horizon": 6 },
    "answers": ["Answer 1...", "Answer 2..."]
  },
  "expected_output_patterns": {
    "idea_count": { "min": 8, "max": 12 },
    "diversity": { "employee": 1, "freelance": 1, "builder": 1 },
    "scores": { "fit": { "min": 0, "max": 100 }, "market": { "min": 0, "max": 100 } },
    "required_sections": ["title", "category", "scores", "explanation", "first_steps"]
  }
}
```

**Test**:
```typescript
test('Idea generation matches golden fixture', async () => {
  const fixture = await loadFixture('idea-generation.json');
  const result = await generateIdeas(fixture.input);

  expect(result.ideas.length).toBeGreaterThanOrEqual(fixture.expected_output_patterns.idea_count.min);
  expect(result.ideas.length).toBeLessThanOrEqual(fixture.expected_output_patterns.idea_count.max);

  const categories = result.ideas.map(i => i.category);
  expect(categories).toContain('employee');
  expect(categories).toContain('freelance');
  expect(categories).toContain('builder');
});
```

### A11y Test Plan

**Automated Tests** (axe-core + Playwright):
```typescript
test('Landing page is accessible', async ({ page }) => {
  await page.goto('/');
  const results = await injectAxe(page);
  expect(results.violations).toHaveLength(0); // No Level A/AA violations
});
```

**Manual Testing** (pre-launch):
- **Screen Reader**: NVDA (Windows), VoiceOver (macOS), TalkBack (Android)
- **Keyboard Nav**: Tab through all interactive elements, verify focus indicators
- **Color Contrast**: Check all text/button combos with Lighthouse or WebAIM Contrast Checker
- **Touch Targets**: Verify ≥44×44px on mobile (iOS/Android)

### Performance Test Plan

**Lighthouse CI** (PR checks):
- Performance score ≥90
- Accessibility score ≥95
- Best Practices score ≥90
- SEO score ≥90

**Load Testing** (Artillery or k6):
- Simulate 100 concurrent users (idea generation)
- Target: P95 latency <1.5s (non-LLM), <20s (LLM)

### Security Checks in CI

1. **Snyk**: Weekly dependency scans (high/critical vulnerabilities block merge)
2. **npm audit**: Pre-commit hook (fails if vulnerabilities found)
3. **Secrets Scanning**: GitHub Secret Scanning enabled (blocks commits with secrets)
4. **RLS Integration Tests**: Cross-user access attempts (must fail)

---

## 9. Cost & Scale Check

### Rough Cost Model (MVP: 100 users/month)

**Assumptions**:
- 100 users complete onboarding → plan creation
- Average: 2 idea generations per user (initial + 1 retry)
- Average: 1 plan generation per user
- Average: 5 artifacts per user
- 50% of users return weekly (Week 2–4)

| Service | Usage | Unit Cost | Monthly Cost |
|---------|-------|-----------|--------------|
| **OpenAI API (GPT-5-nano)** | 100 users × 2 idea gen × 2000 tokens | $0.15/1M input + $0.60/1M output | ~$5 |
| **OpenAI API (GPT-5-nano)** | 100 users × 1 plan gen × 1500 tokens | $0.15/1M input + $0.60/1M output | ~$3 |
| **OpenAI API (GPT-5-nano)** | 100 users × 5 artifacts × 1000 tokens | $0.15/1M input + $0.60/1M output | ~$8 |
| **Supabase (Database)** | Free tier: 500MB, 2GB bandwidth | $0 (Free tier) | $0 |
| **Supabase Storage** | 100 résumés × 2MB avg | $0.021/GB/month | <$1 |
| **Vercel (Hosting)** | Free tier: 100GB bandwidth | $0 (Free tier) | $0 |
| **Railway (Worker)** | Starter plan: $5/month | $5/month | $5 |
| **Upstash QStash** | 500 req/day free tier | $0 (Free tier) | $0 |
| **PostHog** | 1M events/month free tier | $0 (Free tier) | $0 |
| **Resend (Email)** | 3000 emails/month free tier | $0 (Free tier) | $0 |
| **Total** | | | **~$22/month** |

**Per-User Cost**: $22 / 100 = **$0.22/user/month** (MVP)

### Scale Risks

**Risk 1: LLM Cost Explosion** (1000 users/month)
- **Projected Cost**: $220/month (linear scaling)
- **Mitigation**: Caching (7-day TTL), rate limiting (5 gen/hour), cost alerts ($100/day)

**Risk 2: Database Connection Pool Exhaustion** (1000 concurrent users)
- **Supabase Free Tier**: 60 connections max
- **Mitigation**: Connection pooling (Supabase Pooler), RLS queries optimized with indexes

**Risk 3: Vercel Bandwidth Overrun** (10,000 users/month)
- **Free Tier**: 100GB bandwidth/month
- **Projected**: 10K users × 5MB page weight × 10 sessions = 500GB
- **Mitigation**: Upgrade to Pro ($20/month) or optimize bundle size (<300KB JS)

### Caching Strategy (Revisited)

**Research Cache** (7-day TTL):
- **Hit Rate Target**: >50% (repeated queries for similar profiles/goals)
- **Cost Savings**: 50% reduction in LLM calls → $8/month → $4/month

**Idea Cache** (7-day TTL):
- **Hit Rate Target**: >80% (users revisit ideas before selecting)
- **Cost Savings**: 80% reduction in repeated idea gen → minimal (caching is local)

### Back-Pressure & Retries

**Rate Limiting**:
- **Authenticated Users**: 100 req/min per user (burst: 200)
- **Idea Generation**: 5 req/hour per user (LLM cost control)
- **Anonymous**: 20 req/min per IP

**QStash Retries**:
- **Max Retries**: 3 attempts
- **Backoff**: Exponential (1s → 10s → 60s)
- **Dead Letter Queue**: Failed jobs logged for manual review

---

## 10. Operational Readiness

### Runbooks

#### Runbook 1: Incident Response (LLM API Downtime)

**Symptoms**:
- Idea generation timeouts (>30s)
- Error rate spike in `/api/ideas/generate`

**Diagnosis**:
1. Check OpenAI Status Page: https://status.openai.com/
2. Check server logs: `grep "LLM timeout" /var/log/app.log`
3. Check PostHog: `error.llm_timeout` event spike

**Mitigation**:
1. **Immediate**: Display error message to users: "AI service temporarily unavailable. Please retry in 5 minutes."
2. **Short-term**: Switch to cached ideas (if available)
3. **Long-term**: Implement fallback LLM (e.g., Claude 3.5 Haiku)

#### Runbook 2: RLS Policy Bug (Cross-User Data Leak)

**Symptoms**:
- User reports seeing another user's plan
- Integration test fails: cross-user access succeeds

**Diagnosis**:
1. Check Supabase logs: unauthorized access attempts
2. Run integration test: `pnpm test:integration rls-isolation`
3. Review recent RLS policy changes (git log)

**Mitigation**:
1. **CRITICAL**: Immediately disable affected endpoint (via feature flag or hotfix)
2. Audit: Run query to check if cross-user access occurred (log affected users)
3. Notify: Email affected users within 24h (data breach disclosure)
4. Fix: Review + test RLS policies; deploy hotfix
5. Post-mortem: Document root cause, update ADRs

#### Runbook 3: Cost Spike (LLM API Overrun)

**Symptoms**:
- OpenAI billing alert: $100/day threshold exceeded
- Unexpected usage spike in PostHog

**Diagnosis**:
1. Check OpenAI Dashboard: API usage by endpoint
2. Check PostHog: `ideas.generated` event count (per user)
3. Identify: Outlier users (>10 generations/hour)

**Mitigation**:
1. **Immediate**: Enable stricter rate limiting (3 gen/hour instead of 5)
2. **Short-term**: Notify outlier users: "Usage limits enforced to ensure fair access"
3. **Long-term**: Implement per-user cost tracking, billing alerts per user

### Dashboards (PostHog)

**Dashboard 1: Real-Time Operations**
- **Update Frequency**: Every 5 minutes
- **Widgets**:
  - Active users (last 5 min, 1 hour, 24 hours)
  - Signups (last 1 hour, today)
  - Error rate (LLM timeouts, 5xx errors)
  - P95 latency (non-LLM routes, LLM routes)

**Dashboard 2: Product KPIs**
- **Update Frequency**: Daily
- **Widgets**:
  - Activation rate (7-day, 30-day rolling)
  - Selection rate (distribution: 0/1/2/3 ideas)
  - 12-week retention (cohort curves)
  - NPS (30-day rolling)

**Dashboard 3: Engagement & Gamification**
- **Update Frequency**: Daily
- **Widgets**:
  - Tasks completed (total, avg per user)
  - XP distribution (histogram)
  - Streak distribution (users per streak length)
  - Badge distribution (most/least earned)

### Alerts (Slack/Email)

**Critical Alerts** (page on-call):
- **Uptime <99.5%** (5-minute window)
- **Error rate >5%** (5-minute window)
- **LLM timeout rate >10%** (15-minute window)
- **Cross-user access detected** (immediate)

**High Alerts** (Slack):
- **Activation rate <30%** (daily check)
- **Selection rate <30%** (daily check)
- **OpenAI cost >$100/day** (hourly check)

**Medium Alerts** (Email):
- **Weekly active users down 20% WoW** (weekly check)
- **NPS <20** (weekly check)

### Launch Checklist

**Pre-Launch** (Week 6, Day 1):
- [ ] Security audit passed (T049: M3-015)
- [ ] Accessibility audit passed (T050: M3-011)
- [ ] Manual testing checklist 100% complete (T051: M3-016)
- [ ] All CI checks passing (lint, typecheck, test, a11y, build)
- [ ] Environment variables configured (Vercel, Railway)
- [ ] Supabase RLS policies reviewed by 2 developers
- [ ] OpenAI API rate limits configured (5 req/hour per user)
- [ ] PostHog dashboards created (KPI, funnel, engagement)
- [ ] Monitoring alerts configured (Slack, PagerDuty)
- [ ] Runbooks documented (incident response, RLS bug, cost spike)
- [ ] Privacy policy updated (export, delete, data retention)
- [ ] Backup restore tested (RTO <1 hour, RPO <24 hours)

**Launch Day**:
- [ ] Deploy to production (Vercel + Railway)
- [ ] Smoke test: signup → plan creation (5 test users)
- [ ] Monitor dashboards (Real-Time Ops) for 2 hours
- [ ] Check error rates (<1%)
- [ ] Announce launch (social media, email, Product Hunt)

**Post-Launch** (Week 6, Days 2–7):
- [ ] Daily check: activation rate, selection rate, error rate
- [ ] Weekly check: 12-week retention (first cohort), NPS
- [ ] User feedback: collect via in-app survey or email
- [ ] Iterate: prioritize bug fixes, UX improvements

### Phased Rollout

**Phase 1: Friends & Family (Week 6, Days 1–3)**
- **Target**: 10 users (internal team + trusted users)
- **Goal**: Validate critical path (signup → plan), catch show-stoppers
- **Metrics**: Activation rate, error rate, manual feedback

**Phase 2: Beta Launch (Week 6, Days 4–7)**
- **Target**: 100 users (Product Hunt, Twitter, waitlist)
- **Goal**: Validate product-market fit, collect NPS
- **Metrics**: Activation rate ≥40%, selection rate ≥50%, NPS ≥40

**Phase 3: Public Launch (Week 7+)**
- **Target**: 1000+ users (paid acquisition, SEO, word-of-mouth)
- **Goal**: Scale infrastructure, iterate on feedback
- **Metrics**: 12-week retention ≥30%, time-to-first-outcome ≤14 days

---

## Appendix A: References

**Documents**:
- [constitution.md](/.specify/memory/constitution.md): Junielyfe Constitution v1.0.0 (37 principles)
- [spec.md](./spec.md): Feature specification (10 functional requirements)
- [user-stories.md](./user-stories.md): User stories (47 acceptance criteria)
- [flows.md](./flows.md): UX flows + wireframe notes
- [api.md](./api.md): API specification (30+ endpoints)
- [non-functional.md](./non-functional.md): Non-functional requirements (87 NFRs)
- [risk-mitigation.md](./risk-mitigation.md): Risks + guardrails + out-of-scope
- [metrics.md](./metrics.md): KPIs + analytics events (50+ events)
- [plan.md](./plan.md): 6-week MVP plan (52 issues, 4 milestones)
- [tasks.md](./tasks.md): Task breakdown (52 tasks with detailed templates)

**External Resources**:
- Supabase Docs: https://supabase.com/docs
- Next.js 15 Docs: https://nextjs.org/docs
- PostHog Docs: https://posthog.com/docs
- OpenAI API Docs: https://platform.openai.com/docs

---

**Analysis Version**: 1.0.0
**Analysis Date**: 2025-09-30
**Next Review**: Post-launch (Week 7)
**Owner**: Product/Engineering Team