<!--
SYNC IMPACT REPORT
===================
Version Change: NEW → 1.0.0
Constitution Type: Initial ratification for Junielyfe project

Added Sections:
- Product Philosophy (8 principles)
- Privacy & Security (6 principles)
- Accessibility & User Experience (5 principles)
- Quality & Testing Standards (5 principles)
- Performance Requirements (3 principles)
- Research & AI Ethics (4 principles)
- Analytics & Measurement (2 principles)
- Governance & Compliance (4 principles)

Templates Status:
✅ plan-template.md - Reviewed, Constitution Check section compatible
✅ spec-template.md - Reviewed, requirements alignment confirmed
✅ tasks-template.md - Reviewed, task categorization supports new principles
✅ README.md - Reviewed, no updates needed (generic Next.js boilerplate)

Follow-up Actions:
- None; all placeholders resolved
- Constitution ready for use in /specify and /plan workflows
-->

# Junielyfe Constitution

## Core Principles

### I. User-Defined Goals
Every engagement MUST begin by capturing the user's authentic career or financial goal in their own words. The system MUST NOT impose predefined goal categories or templates that constrain user expression. Goals MUST be validated for clarity but never rejected for ambition level.

**Rationale**: Authentic goal capture ensures personalized guidance. Users know their context better than any algorithm; our role is to illuminate pathways, not judge aspirations.

### II. Transparent Reasoning
For every idea proposed to the user, the system MUST display a "Why this fits" explanation that references specific elements from their profile (LinkedIn, résumé, narrative) and goal. Explanations MUST cite concrete evidence, not generic rationale.

**Rationale**: Transparency builds trust. Users deserve to understand why an idea surfaced so they can evaluate fit independently and learn the reasoning patterns for future self-assessment.

### III. Realistic & Ethical Ideas Only
The system MUST exclude from recommendations any idea that falls into these categories:
- Multi-level marketing (MLM) or pyramid schemes
- Day-trading or cryptocurrency speculation strategies
- Gambling or games of chance presented as income strategies
- Unlicensed professional services (legal, medical, financial advice requiring credentials)
- Any activity illegal under US federal law

All ideas MUST be achievable within the stated 4–12 week timeframe with measurable intermediate milestones. Ideas requiring >20 hours/week commitment MUST be flagged as "intensive."

**Rationale**: Ethical constraints protect users from harm. Realism prevents demoralization from unattainable goals. Time transparency respects users' existing obligations.

### IV. Measurable Outcomes
Each proposed idea MUST include at least one concrete, measurable outcome achievable within 4–12 weeks (e.g., "complete 3 freelance projects," "increase LinkedIn profile views by 40%," "save $500"). Vague outcomes like "improve skills" are prohibited without quantification.

**Rationale**: Measurability enables progress tracking and builds user confidence through visible wins. Vague goals erode motivation and prevent course correction.

### V. Companion Tone
All system copy—prompts, explanations, notifications—MUST adopt a supportive, non-judgmental companion tone. AVOID: corporate jargon, motivational clichés, condescension. USE: conversational language, "we" framing, celebration of small wins.

**Examples**:
- ✅ "Let's map out your next move together."
- ❌ "Unlock your full potential with our synergistic solution."
- ✅ "Week 2 done—nice momentum on that portfolio!"
- ❌ "Congratulations on completing the designated milestone."

**Rationale**: Career and financial goals carry emotional weight. A companion tone reduces friction, increases engagement, and respects users' agency.

### VI. Adaptive Questioning
The system MUST offer users a choice of question depth: 5 (quick), 10 (standard), or 20 (comprehensive) adaptive questions after goal capture. Questions MUST dynamically adjust based on prior answers—shallow answers trigger clarifying follow-ups; detailed answers enable skip logic. All questions MUST directly inform idea generation; no purely administrative or demographic data collection unless operationally required.

**Rationale**: Respecting user time and attention is paramount. Adaptive depth balances quick onboarding with rich personalization for those willing to invest more upfront.

### VII. Research-Backed Ideas
Every proposed idea MUST be derived from or validated against at least one of these sources:
- Labor market data (BLS, LinkedIn Economic Graph, etc.)
- Published case studies or success stories
- Educational research on skill acquisition timelines
- Financial planning best practices from accredited sources

The system MUST cache research findings and document assumptions made when data is incomplete. Ideas MUST NOT be fabricated without explicit "exploratory" or "emerging trend" flags.

**Rationale**: Evidence-based recommendations differentiate quality guidance from speculation. Caching research prevents redundant LLM calls and ensures consistency across users with similar goals.

### VIII. Four-Week Actionable Plans
Upon user selection of 1–3 ideas, the system MUST generate a 4-week plan with:
- Weekly milestones (specific, measurable)
- Artifacts to create (documents, profiles, portfolios, etc.)
- Gamified accountability (progress bars, streak tracking, optional peer sharing)

Plans MUST be editable by the user. Missed milestones MUST trigger supportive check-ins, not punitive messaging.

**Rationale**: Structure without rigidity. Four weeks balances urgency with feasibility. Gamification leverages behavioral science to sustain motivation. Editability respects changing circumstances.

---

## Privacy & Security

### IX. Consent Per Data Source
The system MUST obtain explicit, granular consent before ingesting each data source (LinkedIn, résumé upload, written narrative). Users MUST be able to proceed with partial data (e.g., narrative only, no résumé). Consent language MUST specify retention duration and use scope.

**Rationale**: Data minimization and user control are foundational privacy rights. Granular consent prevents coerced oversharing and complies with GDPR-like "specific and informed consent" standards.

### X. PII Minimization
All user data passed to LLM APIs MUST be redacted of:
- Addresses (street-level)
- Phone numbers
- Social Security Numbers or equivalents
- Birthdates (year-only acceptable for experience calculations)

Names and professional details (job titles, employers) are permitted only when necessary for idea generation. Redaction MUST occur server-side before API calls.

**Rationale**: Reduces risk of PII leakage via LLM logs or model training. Minimizes liability under breach scenarios. Most career guidance does not require full PII.

### XI. Per-User Data Isolation
All user data (profiles, goals, plans) MUST be stored in isolated, access-controlled partitions (e.g., row-level security with user_id). No cross-user queries or aggregations are permitted unless explicitly anonymized for analytics (see Principle XXI).

**Rationale**: Prevents accidental or malicious data leakage across users. Simplifies compliance with data subject access requests (GDPR Article 15).

### XII. Export Anytime
Users MUST be able to export all their data (profile, goals, questions/answers, ideas, plans) in JSON or PDF format via a single-click action. Export MUST complete within 10 seconds or provide async delivery. No export limits or cooldown periods.

**Rationale**: Data portability is a right (GDPR Article 20). Reduces lock-in concerns and builds trust.

### XIII. Delete My Data (24-Hour Commitment)
Users MUST be able to request full account deletion. All user data MUST be permanently deleted from production databases within 24 hours. Backups containing user data MUST be purged within 30 days or anonymized. Confirmation MUST be sent to the user's registered email.

**Rationale**: Right to erasure (GDPR Article 17). Fast deletion builds trust. 30-day backup retention balances operational needs with privacy.

### XIV. Audit Logs ≤30 Days
System logs containing user activity (page views, API calls, errors) MUST be retained for ≤30 days, then automatically purged. Logs MUST NOT contain PII except hashed user IDs for debugging. Security incident logs are exempt but MUST be reviewed quarterly for retention necessity.

**Rationale**: Minimizes attack surface and storage of sensitive data. Balances operational debugging needs with privacy hygiene. 30 days covers typical incident investigation windows.

---

## Accessibility & User Experience

### XV. WCAG 2.1 AA Compliance
All UI components MUST meet WCAG 2.1 Level AA standards:
- Color contrast ≥4.5:1 for normal text, ≥3:1 for large text
- Keyboard navigable (tab order, focus indicators)
- Screen reader compatible (semantic HTML, ARIA labels)
- No seizure-inducing animations (≤3 flashes/second)

Automated accessibility tests (e.g., axe-core) MUST run in CI. Manual screen reader testing MUST occur before each major release.

**Rationale**: Accessibility is a legal requirement (ADA, Section 508) and moral imperative. ~15% of users have disabilities; exclusion is unacceptable.

### XVI. Mobile-First Design
All features MUST be designed for mobile viewport (≥375px width) first, then enhanced for tablet/desktop. Touch targets MUST be ≥44×44px. Forms MUST use appropriate input types (email, tel, number) for mobile keyboards.

**Rationale**: Majority of career research and planning happens on mobile during commutes or breaks. Mobile-first forces focus on essential functionality.

### XVII. Consistent Design Tokens
All UI MUST use centralized design tokens (colors, typography, spacing) defined in a single source (e.g., CSS variables, Tailwind config). No hard-coded colors or spacing outside token system except for one-off illustrations.

**Rationale**: Consistency reduces cognitive load. Centralization enables theme switching (light/dark) and rebrand without refactoring.

### XVIII. Clear Microcopy
All labels, placeholders, error messages, and CTAs MUST use plain language (8th-grade reading level per Flesch-Kincaid). Jargon MUST be avoided or defined inline. Error messages MUST specify corrective action, not just state the problem.

**Examples**:
- ✅ "Password must include at least one number (e.g., P@ssw0rd)"
- ❌ "Password validation failed: insufficient complexity"

**Rationale**: Clarity reduces support burden and frustration. Many users are non-native English speakers or under time pressure.

### XIX. Low-Friction First Session
New users MUST reach at least one picked idea + starter plan within 10 minutes of signup. No forced tutorials or multi-step wizards that block progress. Onboarding MUST be interruptible and resumable without data loss.

**Rationale**: Early value delivery is critical for retention. Studies show steep drop-off after 5 minutes without perceived value. Interruptibility respects real-world interruptions.

---

## Quality & Testing Standards

### XX. Acceptance Criteria Per User Story
Every user story (feature requirement) MUST include explicit acceptance criteria (AC) in Given-When-Then format before development begins. Code review MUST verify AC are met. Stories without AC MUST be rejected in planning.

**Rationale**: AC prevent scope creep and misalignment. They serve as executable specifications and simplify QA.

### XXI. CI with Unit & Integration Tests
All code MUST pass CI checks (linting, unit tests, integration tests) before merge. Unit test coverage MUST be ≥70% for business logic (services, utilities). Integration tests MUST cover critical user paths (signup → goal → ideas → plan).

**Rationale**: Automated testing catches regressions early and reduces manual QA burden. 70% coverage balances thoroughness with pragmatism for MVP.

### XXII. Fixtures for LLM Prompts (Golden Outputs)
All LLM prompt templates MUST have associated test fixtures: example inputs + expected output patterns (golden outputs). Tests MUST verify that prompt changes do not degrade output quality (e.g., dropping required sections, introducing toxicity).

**Rationale**: LLM outputs are non-deterministic but can be bounded. Golden outputs serve as regression tests for prompt engineering.

### XXIII. Deterministic Scoring Functions
Any algorithm that ranks or scores ideas MUST be deterministic (same inputs → same outputs). Randomness for exploration MUST be opt-in and seeded for reproducibility in tests. Scoring logic MUST be unit-tested with edge cases.

**Rationale**: Non-determinism hinders debugging and erodes user trust ("why did my results change?"). Reproducibility is critical for testing.

### XXIV. Canary Releases
Major feature changes or prompt updates MUST be rolled out to ≤10% of users initially (canary release). Error rates and engagement metrics MUST be monitored for 24 hours before full rollout. Rollback plan MUST be documented before canary start.

**Rationale**: Limits blast radius of bugs or poor UX changes. Enables data-driven rollout decisions.

---

## Performance Requirements

### XXV. P95 <1.5s for Interactive Routes (Non-LLM)
All routes not involving LLM calls (navigation, form submissions, data displays) MUST have 95th percentile response time <1.5 seconds as measured by real user monitoring (RUM). Backend API response time (excluding network) MUST be <500ms.

**Rationale**: Perceived performance affects engagement. 1.5s is the threshold where users notice delays. Non-LLM routes have no excuse for slowness.

### XXVI. LLM Tasks <20s with Streaming
LLM-powered features (idea generation, plan creation) MUST return first token within 2 seconds and complete within 20 seconds. Streaming MUST be used to display partial results progressively. Caching MUST be employed for repeated queries (e.g., same goal + profile).

**Rationale**: 20s is near the upper limit of user tolerance for "thinking" tasks. Streaming provides feedback and reduces perceived latency. Caching avoids redundant LLM costs.

### XXVII. Offline-Friendly Grace
The UI MUST detect offline status and display cached data or placeholder content rather than error states. Form inputs MUST be preserved locally and retry submission on reconnect. Non-critical features (analytics, recommendations refresh) MUST degrade gracefully.

**Rationale**: Mobile users experience intermittent connectivity. Graceful degradation maintains usability and prevents data loss.

---

## Research & AI Ethics

### XXVIII. MVP Uses Lightweight LLM
The initial MVP MUST use a lightweight LLM (e.g., Claude 3.5 Haiku, GPT-4o mini) for idea synthesis and plan generation to control costs and latency. More expensive models are permitted for prompt evaluation during development but not in production until cost model validated.

**Rationale**: MVP economics require frugality. Lightweight models are sufficient for structured generation tasks with good prompts.

### XXIX. Document Sources & Assumptions
All research-backed ideas MUST log the data sources consulted (URLs, API endpoints, publication dates). When data is incomplete or assumptions are made, these MUST be flagged in the idea explanation (e.g., "Limited data for this role in your region; extrapolated from national trends").

**Rationale**: Transparency about uncertainty helps users make informed decisions. Source logging enables audits and refinement.

### XXX. Cache Research
Labor market data, case studies, and other research inputs MUST be cached for ≥7 days to reduce redundant API calls and LLM queries. Cache invalidation MUST occur on explicit user request or when data is >30 days old.

**Rationale**: Research data changes slowly. Caching reduces costs, latency, and external API dependencies.

### XXXI. Never Fabricate Facts
The system MUST NOT generate fabricated statistics, success rates, or case studies. If specific data is unavailable, the system MUST either:
1. Use qualified general statements ("many professionals report...", "common timelines range..."), OR
2. Flag the idea as "exploratory" and explain the evidence gap.

Hallucinated facts MUST be treated as critical bugs.

**Rationale**: Trust is non-negotiable. A single fabricated statistic can permanently damage credibility. Evidence gaps should prompt more research, not invention.

---

## Analytics & Measurement

### XXXII. Core Activation & Retention Metrics
The system MUST track these metrics with daily dashboards:
- **Activation**: % of signups reaching questionnaire → plan within first session
- **Selection Rate**: Average # of ideas picked per user; distribution of 0/1/2/3 picks
- **Time-to-First-Outcome**: Days from plan creation to user logging first completed milestone
- **12-Week Retention**: % of users who return to app at least once in weeks 9–12 post-signup
- **NPS**: Net Promoter Score surveyed at 4-week and 12-week marks

Metrics MUST be anonymized for analysis. Individual user activity MUST NOT be surfaced except for debugging with explicit user consent.

**Rationale**: These metrics directly measure product-market fit and user value delivery. Early tracking prevents flying blind during iteration.

### XXXIII. No Dark Patterns
The system MUST NOT employ:
- Forced continuity (auto-subscriptions without clear opt-in)
- Hidden costs or bait-and-switch pricing
- Fake urgency ("Only 2 spots left!" when untrue)
- Confusing unsubscribe flows (more than 2 clicks)
- Disguised ads (content vs. promotion must be clearly labeled)

All growth tactics MUST be reviewed against FTC guidelines and "Dark Patterns Detection" best practices before implementation.

**Rationale**: Short-term growth from dark patterns erodes long-term trust and invites regulatory action. Ethical growth is sustainable growth.

---

## Governance & Compliance

### XXXIV. Small ADRs for Architectural Decisions
Any decision affecting system architecture (database choice, LLM provider, authentication method) MUST be documented in a lightweight Architecture Decision Record (ADR) with:
- Context (what problem are we solving)
- Decision (what we chose)
- Consequences (trade-offs, risks, benefits)

ADRs MUST be versioned in `/docs/architecture/` and reviewed during onboarding. No minimum length; even 5-line ADRs are valid.

**Rationale**: Institutional memory prevents re-litigating past decisions. ADRs onboard new team members faster.

### XXXV. Enforce Coding Standards & Secure Defaults
All code MUST pass automated linting (ESLint, Prettier, etc.) configured for:
- Consistent style (indentation, quotes, semicolons)
- Security rules (no eval, sanitized inputs, no hardcoded secrets)
- React best practices (hooks rules, key props)

CI MUST reject commits violating standards. Secrets MUST be environment variables, never in code. Dependencies MUST be audited weekly (npm audit, Snyk).

**Rationale**: Consistency reduces cognitive load. Security defaults prevent trivial vulnerabilities.

### XXXVI. Guardrails Reviewed Before Shipping New Idea Categories
Before launching a new category of ideas (e.g., "side businesses" after starting with "job search"), the following MUST be reviewed:
- Ethical exclusions (Principle III) still cover edge cases?
- Research sources adequate for new category?
- Measurement of success defined?

Review MUST involve at least 2 team members and be documented in a brief memo.

**Rationale**: New categories carry new risks (ethical, legal, reputational). Proactive review prevents harm.

### XXXVII. Scope Discipline for MVP
The MVP (Minimum Viable Product) MUST be scoped to:
- Single user type (individual job seekers / side income explorers)
- 1 core flow: goal → questions → ideas → plan
- No social features (sharing, commenting, peer matching)
- No payments or monetization beyond optional donation/tip jar

Features outside MVP scope MUST be deferred to a backlog and explicitly deprioritized until core flow validated with ≥100 users completing 4-week plans.

**Rationale**: MVP discipline prevents scope creep. Early focus on core value delivery increases odds of product-market fit.

---

## Governance

This constitution supersedes all other project documentation in case of conflict. Amendments require:
1. Proposed change documented with rationale
2. Review by all active contributors
3. Approval by project lead or majority vote (if team >3)
4. Migration plan for affected code/docs
5. Version bump per semantic versioning:
   - **MAJOR**: Breaking changes to principles (removals, redefinitions)
   - **MINOR**: New principles or material expansions
   - **PATCH**: Clarifications, typos, non-semantic refinements

All pull requests MUST verify compliance with applicable principles. Complexity that violates principles MUST be justified in PR description or rejected. Runtime guidance for agents (Claude Code, Copilot) MUST reference this constitution and is subordinate to it.

**Version**: 1.0.0 | **Ratified**: 2025-09-29 | **Last Amended**: 2025-09-29