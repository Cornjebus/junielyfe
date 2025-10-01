# Risk Mitigation & Guardrails: Junielyfe

**Feature**: Junielyfe Career & Finance Copilot
**Branch**: `001-create-a-complete`
**Date**: 2025-09-29

---

## Risk Categories

### 1. Product Risks
### 2. Technical Risks
### 3. Privacy & Security Risks
### 4. Market & Business Risks
### 5. Out-of-Scope (MVP)

---

## 1. Product Risks

### Risk 1.1: Idea Quality & Relevance

**Description**: Generated ideas may be generic, irrelevant, or misaligned with user goals, leading to low selection rates and poor activation.

**Impact**: High (core value prop)
**Likelihood**: Medium

**Mitigation Strategies**:
1. **Diversity Rule**: Enforce ≥1 employee, ≥1 freelance, ≥1 builder idea to ensure variety
2. **Scoring Transparency**: Display 4 scores (fit, market, speed, risk) with clear explanations so users understand trade-offs
3. **"Why This Fits"**: Cite specific user inputs (skills, experience, constraints) and research evidence in every idea explanation
4. **Feedback Loop**: Add "Mark as unhelpful" button to each idea; log feedback for prompt refinement
5. **Golden Outputs**: Test LLM prompts against fixtures (expected output patterns) in CI to prevent degradation
6. **Caching**: Cache ideas for 7 days; if user regenerates, log reason (e.g., "all ideas unhelpful") for analysis

**Success Criteria**:
- Selection rate ≥50% (≥1 idea selected per user)
- "Unhelpful" feedback rate <20%
- Diversity rule enforced in 100% of generations

---

### Risk 1.2: Motivation Drop-Off & Plan Abandonment

**Description**: Users create plans but abandon them after 1–2 weeks due to lack of motivation, unclear next steps, or life disruptions.

**Impact**: High (retention, outcomes)
**Likelihood**: High (typical for self-directed behavior change)

**Mitigation Strategies**:
1. **Gamification**: XP, levels, streaks, badges to create behavioral triggers and visible progress
2. **Weekly Check-Ins**: Proactive email nudges (opt-in) asking "How's your week going?" with task prompts
3. **Proof-of-Work Milestones**: Weekly deliverables (e.g., "5 outreach sent") create accountability and tangible wins
4. **Companion Tone**: Supportive, non-judgmental microcopy (e.g., "Streaks are hard—let's start fresh today") reduces guilt
5. **Plan Editability**: Allow users to adjust tasks, extend timelines, or pause plans without penalty
6. **Anti-Gaming Rules**: Prevent XP farming (15-second min task completion delay) to maintain integrity
7. **Early Win**: Ensure Week 1 tasks are achievable (e.g., résumé rewrite, LinkedIn update) to build momentum

**Success Criteria**:
- Week 2 retention ≥70% (users return after first week)
- Week 4 retention ≥50%
- 12-week retention ≥30%
- Average XP per user >100 (indicates ≥10 tasks completed)

---

### Risk 1.3: Unrealistic Expectations

**Description**: Users set overly ambitious goals (e.g., "$1M in 1 month") or misunderstand the 4–12 week timeline, leading to frustration and churn.

**Impact**: Medium (user satisfaction, NPS)
**Likelihood**: Medium

**Mitigation Strategies**:
1. **Goal Validation**: Flag unrealistic goals (via heuristics: income delta >$500k in <6 months, role change with no relevant experience) with message: "This is ambitious! We recommend breaking this into smaller milestones."
2. **Tagline Clarity**: "6 months to a new Lyfe" emphasizes journey over instant results
3. **Outcome Examples**: Show concrete examples in onboarding (e.g., "first interview in 4 weeks", "first freelance client in 8 weeks")
4. **Idea Time Estimates**: Each idea shows "Time to First Outcome" (weeks) to set expectations
5. **Plan Preview**: Before plan creation, show summary: "15 tasks, ~10 hrs/week, 4-week timeline" for transparency

**Success Criteria**:
- <10% of users set goals flagged as unrealistic
- NPS ≥40 (positive sentiment despite realistic framing)

---

### Risk 1.4: Ethical Idea Generation (MLM, Scams, Unlicensed Advice)

**Description**: LLM may generate ideas for MLM schemes, day-trading/crypto speculation, gambling, or unlicensed professional services (legal, medical, financial advice).

**Impact**: Critical (legal, reputational, user harm)
**Likelihood**: Low (with guardrails), Medium (without)

**Mitigation Strategies**:
1. **Hard Exclusions in Prompts**: LLM system prompt includes: "Never suggest: MLM/pyramid schemes, day-trading/crypto speculation, gambling, unlicensed legal/medical/financial advice, illegal activities."
2. **Post-Generation Filter**: Run generated ideas through keyword filter (e.g., "MLM", "forex", "crypto day-trading", "tax preparation without CPA") and flag/reject matches
3. **Human Review**: Pre-launch, manually review 100 sample idea sets for ethical violations
4. **Feedback Escalation**: "Mark as inappropriate" button (separate from "unhelpful") triggers immediate review
5. **Prompt Regression Tests**: Golden outputs include negative cases (e.g., "User wants to make money fast" should NOT generate MLM ideas)

**Success Criteria**:
- 0 ethical violations in production (tracked via feedback + manual audits)
- Prompt regression tests pass 100% in CI

---

## 2. Technical Risks

### Risk 2.1: LLM API Downtime or Rate Limits

**Description**: LLM provider (e.g., Anthropic, OpenAI) experiences downtime or rate limits, blocking idea/plan/artifact generation.

**Impact**: High (core functionality)
**Likelihood**: Low (per-provider), Medium (combined)

**Mitigation Strategies**:
1. **Graceful Degradation**: If LLM fails, show: "We're having trouble generating ideas. Please try again in a few minutes." with retry button
2. **Retry Logic**: Background jobs retry 3 times with exponential backoff (1s, 10s, 60s)
3. **Caching**: Cache generated ideas, plans, artifacts for 7–30 days to reduce regeneration needs
4. **Rate Limit Monitoring**: Track LLM API usage; alert if approaching limits
5. **Provider Fallback (Future)**: Design to swap LLM providers (e.g., Anthropic → OpenAI) if one fails (not MVP)

**Success Criteria**:
- <1% of idea generation requests fail due to LLM issues
- P95 recovery time <60s (user can retry successfully)

---

### Risk 2.2: Résumé Parsing Accuracy

**Description**: Résumé parsing fails or produces incorrect data (e.g., misattributes roles, misses skills), requiring excessive manual correction.

**Impact**: Medium (UX friction)
**Likelihood**: Medium (varies by résumé format complexity)

**Mitigation Strategies**:
1. **Editable Fields**: Always show parsed data in editable fields; users can correct errors
2. **Skip Option**: Allow users to skip résumé upload and manually enter profile data
3. **Format Support**: Limit to PDF/DOCX (most common); reject .pages, .txt with clear error
4. **Parsing Feedback**: Add "Parsing issues? Let us know" link to report problems for model improvement
5. **Fallback**: If parsing fails entirely, prefill empty editable fields with placeholders

**Success Criteria**:
- Parsing success rate ≥80% (no total failures)
- <30% of users manually correct >50% of parsed fields (indicates good accuracy)

---

### Risk 2.3: Database Performance & Scaling

**Description**: As user base grows, database queries slow down, causing timeouts and degraded UX.

**Impact**: High (core functionality)
**Likelihood**: Low (MVP), Medium (6–12 months)

**Mitigation Strategies**:
1. **Indexing**: Index frequently queried fields (user_id, goal_id, plan_id, created_at, status)
2. **Row-Level Security (RLS)**: Supabase RLS enforces per-user isolation efficiently (no manual filtering)
3. **Connection Pooling**: Use Supabase connection pooler (PgBouncer) to handle concurrent requests
4. **Horizontal Scaling**: Stateless API design allows adding instances behind load balancer
5. **Monitoring**: Track query performance (P95 response time); alert if >500ms

**Success Criteria**:
- P95 API response time <500ms (excluding LLM calls)
- Database can handle ≥1000 concurrent connections

---

### Risk 2.4: Security Vulnerabilities (XSS, SQL Injection, CSRF)

**Description**: Application vulnerable to common web attacks, leading to data breach or account takeover.

**Impact**: Critical (legal, reputational, user trust)
**Likelihood**: Low (with best practices), Medium (without)

**Mitigation Strategies**:
1. **Framework Defaults**: Next.js + React provide XSS protection via automatic escaping
2. **Parameterized Queries**: Use ORM (Prisma, Supabase client) to prevent SQL injection
3. **CSRF Tokens**: Use Next.js CSRF protection for state-changing requests
4. **Input Validation**: Sanitize all user inputs (résumé uploads, narrative text, form fields)
5. **Security Audits**: Run automated scans (OWASP ZAP, Snyk) in CI; manual penetration test before launch
6. **Secrets Management**: No secrets in code; use environment variables + Vercel/Supabase secret managers

**Success Criteria**:
- 0 high/critical vulnerabilities in production (per Snyk/OWASP scans)
- Security audit passed before public launch

---

## 3. Privacy & Security Risks

### Risk 3.1: PII Leakage via LLM Logs

**Description**: User PII (addresses, phone numbers, SSN) accidentally sent to LLM provider, logged in their systems, or used for training.

**Impact**: Critical (legal, GDPR/CCPA violations)
**Likelihood**: Low (with redaction), High (without)

**Mitigation Strategies**:
1. **Server-Side Redaction**: Strip PII (addresses, phone numbers, SSN, full birthdates) before calling LLM APIs
2. **Minimal Context**: Only send necessary data to LLM (skills, roles, goals); exclude full résumé text
3. **Provider Contracts**: Use zero-retention LLM providers (e.g., Anthropic with zero-retention tier) or data protection agreements
4. **Audit Trail**: Log which data fields are sent to LLM (for compliance audits)
5. **Testing**: Pre-launch, test redaction with sample PII-laden inputs; verify no leakage

**Success Criteria**:
- 0 PII in LLM request logs (verified via audit)
- Redaction logic tested with 100 sample résumés (100% PII removal)

---

### Risk 3.2: Unauthorized Data Access (Cross-User)

**Description**: Bug or misconfiguration allows User A to access User B's data (profile, ideas, plans).

**Impact**: Critical (legal, trust)
**Likelihood**: Low (with RLS), Medium (without)

**Mitigation Strategies**:
1. **Row-Level Security (RLS)**: Supabase RLS policies enforce `user_id = auth.uid()` on all tables
2. **No Admin Backdoors**: Even admin/support access requires explicit user consent + audit logging
3. **Integration Tests**: Automated tests verify User A cannot query User B's data via API
4. **Penetration Testing**: Manual test attempts to access other users' data before launch

**Success Criteria**:
- 0 cross-user access vulnerabilities (per pentesting)
- RLS policies enforced on 100% of user tables

---

### Risk 3.3: Data Export/Deletion Failures

**Description**: User requests data export or account deletion; system fails to deliver or delete, violating GDPR/CCPA.

**Impact**: High (legal, compliance fines)
**Likelihood**: Low (with testing)

**Mitigation Strategies**:
1. **Automated Testing**: CI tests verify export includes all user data (profile, goals, plans, artifacts)
2. **Deletion Verification**: Automated job runs 24 hours after deletion request; verifies no user data in production
3. **Email Confirmation**: User receives email confirmation for export (with link) and deletion (with timestamp)
4. **Backup Purge**: Documented process to purge deleted user data from backups within 30 days
5. **Manual Fallback**: If automated deletion fails, alert triggers manual intervention

**Success Criteria**:
- Export/deletion success rate ≥99.9% (tracked via logs)
- Compliance audit confirms GDPR/CCPA adherence

---

## 4. Market & Business Risks

### Risk 4.1: Low Activation Rate (Users Don't Complete Onboarding)

**Description**: Users sign up but abandon during profile setup or questionnaire, never reaching idea generation.

**Impact**: High (growth, retention)
**Likelihood**: Medium (typical for multi-step onboarding)

**Mitigation Strategies**:
1. **Low-Friction Onboarding**: Skip-optional for LinkedIn, résumé; only narrative required (200 words min)
2. **Progress Indicators**: Show "Step 2 of 3" to set expectations and reduce perceived effort
3. **Interruptible**: Auto-save progress; users can resume later without data loss
4. **Quick Path**: Offer "Quick (5 questions)" questionnaire for time-constrained users
5. **Early Value**: Show sample ideas (anonymized) on landing page to preview value before signup

**Success Criteria**:
- Activation rate ≥40% (signup → questionnaire → plan created)
- Drop-off analysis: <20% abandon at any single step

---

### Risk 4.2: Idea Commoditization (Users Get Same Ideas Elsewhere)

**Description**: Users realize they could have found similar ideas via Google search or ChatGPT, questioning Junielyfe's unique value.

**Impact**: Medium (differentiation, retention)
**Likelihood**: Medium

**Mitigation Strategies**:
1. **Personalization**: "Why this fits" cites user-specific inputs (not generic advice)
2. **Actionable Plans**: 4-week plans with tasks, resources, and artifacts go beyond idea lists
3. **Gamification**: Progress tracking, streaks, badges create habit loop (not just info delivery)
4. **Research Quality**: Use proprietary research (labor market data, case studies) not easily findable via search
5. **Companion Positioning**: Market as companion (ongoing support), not one-time search tool

**Success Criteria**:
- 12-week retention ≥30% (users return beyond initial curiosity)
- NPS ≥40 (positive sentiment on unique value)

---

### Risk 4.3: Monetization Challenges

**Description**: Free MVP attracts users, but converting to paid tiers (premium artifacts, 1-on-1 coaching) proves difficult.

**Impact**: Low (MVP), High (long-term viability)
**Likelihood**: Medium

**Mitigation Strategies** (Post-MVP):
1. **Value Demonstration**: Free tier delivers tangible outcomes (first interview, first client) to build trust
2. **Upsell Triggers**: Offer premium features at key moments (e.g., "Unlock 10 more ideas" after 3 selections, "Book 1-on-1 coaching" after plan completion)
3. **Donation/Tip Jar**: Allow voluntary payments in MVP to gauge willingness to pay
4. **B2B Pivot Option**: If B2C monetization fails, pivot to B2B (employers/universities license for employees/students)

**Success Criteria** (Post-MVP):
- ≥5% of free users voluntarily donate/tip (signals willingness to pay)
- ≥10% conversion to paid tier within 6 months of launch

---

## 5. Out-of-Scope (MVP)

The following features/capabilities are explicitly **OUT OF SCOPE** for MVP to maintain focus and ship quickly:

### 5.1: Out-of-Scope Features
- ❌ **Auto-Apply Bots**: Automated job application submission (legal/ethical risks, low quality)
- ❌ **ATS/CRM Integrations**: Integrations with Applicant Tracking Systems or CRMs (complexity, low ROI for MVP)
- ❌ **Social Features**: Peer sharing, commenting, leaderboards, public profiles (scope creep)
- ❌ **Payments/Monetization**: Subscription plans, premium features, 1-on-1 coaching (validate free model first)
- ❌ **Mobile Apps (iOS/Android)**: Native mobile apps (PWA sufficient for MVP)
- ❌ **Multi-Language Support**: Translations beyond English (i18n-ready but not localized)
- ❌ **Advanced Analytics**: User cohort analysis, A/B testing, funnel optimization (basic GA sufficient for MVP)

### 5.2: Out-of-Scope Idea Categories (Ethical/Legal)
- ❌ **MLM/Pyramid Schemes**: Multi-level marketing, network marketing
- ❌ **Day-Trading/Crypto Speculation**: High-risk financial strategies requiring licenses
- ❌ **Gambling**: Sports betting, poker, casino strategies
- ❌ **Unlicensed Professional Services**: Tax preparation (without CPA), legal advice (without bar license), medical advice
- ❌ **Illegal Activities**: Any activity illegal under US federal law

### 5.3: Out-of-Scope Research Sources (MVP)
- ❌ **Perplexity Research API**: Retrieval-augmented research (use lightweight LLM synthesis for MVP; upgrade post-launch)
- ❌ **Proprietary Labor Data APIs**: Premium APIs (e.g., Burning Glass, Emsi) require licensing fees
- ❌ **User-Generated Content**: Case studies, success stories from Junielyfe users (no users yet for MVP)

---

## Risk Prioritization Matrix

| Risk | Impact | Likelihood | Priority | Owner |
|------|--------|------------|----------|-------|
| 1.1 Idea Quality | High | Medium | **P0** | Product + Eng |
| 1.2 Motivation Drop-Off | High | High | **P0** | Product + Eng |
| 1.3 Unrealistic Expectations | Medium | Medium | **P1** | Product |
| 1.4 Ethical Ideas | Critical | Low | **P0** | Product + Legal |
| 2.1 LLM Downtime | High | Medium | **P1** | Eng |
| 2.2 Résumé Parsing | Medium | Medium | **P2** | Eng |
| 2.3 Database Scaling | High | Low | **P1** | Eng |
| 2.4 Security Vulnerabilities | Critical | Low | **P0** | Eng + Security |
| 3.1 PII Leakage | Critical | High | **P0** | Eng + Legal |
| 3.2 Cross-User Access | Critical | Low | **P0** | Eng + Security |
| 3.3 Export/Deletion Failures | High | Low | **P1** | Eng + Legal |
| 4.1 Low Activation | High | Medium | **P0** | Product + Eng |
| 4.2 Commoditization | Medium | Medium | **P2** | Product + Marketing |
| 4.3 Monetization | Low (MVP) | Medium | **P2** | Business |

**Priority Definitions**:
- **P0 (Critical)**: Must address before launch; blocking issue
- **P1 (High)**: Address during MVP development; delays acceptable if needed
- **P2 (Medium)**: Monitor and address post-MVP if impact materializes

---

## Monitoring & Response Plan

### Pre-Launch Checklist
- [ ] Ethical idea generation tested with 100 sample users (0 violations)
- [ ] PII redaction verified with 100 sample résumés (100% removal)
- [ ] Security audit passed (0 high/critical vulnerabilities)
- [ ] Cross-user access tests passed (RLS enforced)
- [ ] Export/deletion automated tests passed
- [ ] Prompt regression tests passed (golden outputs)

### Post-Launch Monitoring
- **Daily**: Activation rate, idea selection rate, ethical feedback flags, LLM error rate
- **Weekly**: Retention (Week 1, 2, 4), XP/task completion, NPS survey results
- **Monthly**: Security scan (Snyk/OWASP), database performance (P95 query time), compliance audit (GDPR/CCPA)

### Incident Response
- **Ethical Violation (P0)**: Immediate takedown of flagged idea; root cause analysis within 24h; prompt update within 48h
- **PII Leakage (P0)**: Notify affected users within 72h (GDPR), file breach report if >500 users affected (per jurisdiction)
- **Security Breach (P0)**: Lock affected accounts, force password resets, engage security firm for forensics

---

**Compliance**: This risk mitigation document aligns with Junielyfe Constitution v1.0.0, specifically:
- **Principle III**: Realistic & Ethical Ideas Only (exclusions enforced)
- **Principles IX–XIV**: Privacy & Security (PII redaction, data isolation, export/deletion)
- **Principle XXXI**: Never Fabricate Facts (ethical idea generation)
- **Principle XXXVI**: Guardrails Reviewed Before Shipping (ethical review process)
- **Principle XXXVII**: Scope Discipline for MVP (out-of-scope list)