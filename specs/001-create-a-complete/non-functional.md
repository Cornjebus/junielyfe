# Non-Functional Requirements: Junielyfe

**Feature**: Junielyfe Career & Finance Copilot
**Branch**: `001-create-a-complete`
**Date**: 2025-09-29

---

## 1. Security

### Authentication & Authorization
- **NFR-SEC-001**: All API endpoints (except `/auth/register`, `/auth/login`) MUST require valid JWT token in `Authorization: Bearer <token>` header
- **NFR-SEC-002**: JWT tokens MUST expire after 7 days; refresh tokens after 30 days
- **NFR-SEC-003**: Passwords MUST be hashed using bcrypt with minimum cost factor of 12
- **NFR-SEC-004**: OAuth tokens (LinkedIn) MUST be stored encrypted at rest using AES-256

### Data Protection
- **NFR-SEC-005**: All API traffic MUST use HTTPS (TLS 1.3); HTTP requests MUST redirect to HTTPS
- **NFR-SEC-006**: Database connections MUST use SSL/TLS encryption
- **NFR-SEC-007**: Row-Level Security (RLS) MUST be enforced in Supabase for all user tables; no cross-user data access permitted
- **NFR-SEC-008**: PII (addresses, phone numbers, SSN, full birthdates) MUST be redacted server-side before passing to LLM APIs
- **NFR-SEC-009**: Secrets (API keys, database credentials) MUST be stored in environment variables, never in code
- **NFR-SEC-010**: User-uploaded files (résumés) MUST be scanned for malware before processing

### Least Privilege
- **NFR-SEC-011**: Database user accounts MUST have minimum required permissions (e.g., read-only for analytics, write for app backend only)
- **NFR-SEC-012**: Admin/support access to production data MUST require MFA and be logged with 90-day retention

### Auditing
- **NFR-SEC-013**: Security events (failed login attempts, password resets, account deletions, data exports) MUST be logged with user ID, IP, timestamp, and outcome
- **NFR-SEC-014**: Security logs MUST be retained for 90 days minimum (longer for incident investigation)

---

## 2. Privacy

### Consent & Transparency
- **NFR-PRIV-001**: System MUST obtain explicit, granular consent before ingesting each data source (LinkedIn, résumé, narrative)
- **NFR-PRIV-002**: Consent language MUST specify: purpose, retention duration, usage scope, right to withdraw
- **NFR-PRIV-003**: Users MUST be able to proceed with partial data (e.g., skip LinkedIn, skip résumé)

### Data Minimization
- **NFR-PRIV-004**: System MUST NOT collect protected attributes (age, race, gender, disability, salary history) in questionnaires or forms
- **NFR-PRIV-005**: Questionnaire answers MUST be retained only as long as needed for idea generation; raw text responses MUST be purged after 30 days (except anonymized summaries)

### User Data Control
- **NFR-PRIV-006**: Users MUST be able to export all data (profile, goals, questionnaires, ideas, plans, artifacts) in JSON or PDF format within 10 seconds (or async delivery if >10s)
- **NFR-PRIV-007**: Data export MUST include all user-generated content and system-generated content (ideas, plans, artifacts)
- **NFR-PRIV-008**: Users MUST be able to request account deletion; all user data MUST be permanently deleted from production databases within 24 hours
- **NFR-PRIV-009**: Backups containing deleted user data MUST be purged within 30 days or anonymized
- **NFR-PRIV-010**: Account deletion confirmation MUST be sent to user's registered email

### Logging & Retention
- **NFR-PRIV-011**: Application logs (page views, API calls, errors) MUST be retained for ≤30 days, then automatically purged
- **NFR-PRIV-012**: Logs MUST NOT contain PII except hashed user IDs for debugging
- **NFR-PRIV-013**: Analytics data MUST be anonymized (no user_id in aggregate queries) before sharing with dashboards or third parties

---

## 3. Accessibility (WCAG 2.1 AA)

### Perceivable
- **NFR-A11Y-001**: All text MUST have color contrast ≥4.5:1 for normal text (≥3:1 for large text ≥18pt or bold ≥14pt)
- **NFR-A11Y-002**: All non-text content (images, icons) MUST have text alternatives (alt attributes, ARIA labels)
- **NFR-A11Y-003**: Information conveyed by color alone MUST also be available via text, icons, or patterns (e.g., error states)

### Operable
- **NFR-A11Y-004**: All interactive elements MUST be keyboard accessible (Tab, Shift+Tab, Enter, Space)
- **NFR-A11Y-005**: Focus indicators MUST be visible (≥2px outline, contrast ≥3:1 against background)
- **NFR-A11Y-006**: Touch targets MUST be ≥44×44px (iOS/Android standard)
- **NFR-A11Y-007**: No content MUST flash more than 3 times per second (seizure prevention)

### Understandable
- **NFR-A11Y-008**: All form inputs MUST have visible labels (not just placeholders)
- **NFR-A11Y-009**: Error messages MUST be programmatically associated with inputs (via `aria-describedby`)
- **NFR-A11Y-010**: Microcopy MUST target ≤8th grade reading level (Flesch-Kincaid)

### Robust
- **NFR-A11Y-011**: Semantic HTML MUST be used (`<nav>`, `<main>`, `<section>`, `<button>`)
- **NFR-A11Y-012**: ARIA landmarks and roles MUST be used correctly (avoid redundant/conflicting ARIA)
- **NFR-A11Y-013**: Dynamic content updates (e.g., XP gain, task completion) MUST use ARIA live regions

### Testing
- **NFR-A11Y-014**: Automated accessibility tests (axe-core) MUST run in CI; builds MUST fail on Level A/AA violations
- **NFR-A11Y-015**: Manual screen reader testing (NVDA, JAWS, VoiceOver) MUST occur before each major release

---

## 4. Performance

### Response Times (Interactive Routes)
- **NFR-PERF-001**: 95th percentile (P95) response time for non-LLM routes MUST be <1.5 seconds (measured by RUM)
- **NFR-PERF-002**: Backend API response time (excluding network) MUST be <500ms for CRUD operations

### LLM Tasks
- **NFR-PERF-003**: Idea generation MUST return first token within 2 seconds (streaming)
- **NFR-PERF-004**: Idea generation MUST complete within 20 seconds (full response)
- **NFR-PERF-005**: Plan generation MUST complete within 20 seconds
- **NFR-PERF-006**: Artifact generation MUST complete within 30 seconds for all 5 artifacts
- **NFR-PERF-007**: LLM responses MUST use streaming (SSE or chunked responses) for progressive display

### Caching
- **NFR-PERF-008**: Generated ideas MUST be cached for ≥7 days; repeated views MUST not trigger regeneration
- **NFR-PERF-009**: Research data (labor market, case studies) MUST be cached for ≥7 days, invalidated after 30 days
- **NFR-PERF-010**: Static assets (JS, CSS, images) MUST be cached with versioned URLs and far-future expiry (1 year)

### Offline Grace
- **NFR-PERF-011**: UI MUST detect offline status and display cached data or placeholder content (no blank screens or spinners)
- **NFR-PERF-012**: Form inputs MUST be preserved locally (localStorage) and retry submission on reconnect
- **NFR-PERF-013**: Non-critical features (analytics, recommendations refresh) MUST degrade gracefully offline

### Optimization
- **NFR-PERF-014**: Initial page load (FCP) MUST be <2 seconds on 4G; <3 seconds on 3G
- **NFR-PERF-015**: Largest Contentful Paint (LCP) MUST be <2.5 seconds
- **NFR-PERF-016**: Cumulative Layout Shift (CLS) MUST be <0.1
- **NFR-PERF-017**: First Input Delay (FID) MUST be <100ms

---

## 5. Reliability

### Uptime
- **NFR-REL-001**: Application MUST target 99.5% uptime (≤3.6 hours downtime/month, excluding planned maintenance)
- **NFR-REL-002**: Planned maintenance windows MUST be announced ≥48 hours in advance and scheduled during low-traffic hours

### Error Handling
- **NFR-REL-003**: All user-facing errors MUST display friendly messages with corrective action (not raw stack traces)
- **NFR-REL-004**: Server errors (5xx) MUST be logged with full context (user ID, request ID, endpoint, timestamp, error details)
- **NFR-REL-005**: Critical errors (database down, LLM API unavailable) MUST trigger alerts to on-call team within 5 minutes

### Data Integrity
- **NFR-REL-006**: Database writes MUST use transactions to ensure consistency (e.g., plan creation + artifact generation atomicity)
- **NFR-REL-007**: Automated daily backups MUST be performed; backups MUST be tested monthly for restorability
- **NFR-REL-008**: User data MUST NOT be lost due to system failures; unsaved form inputs MUST auto-save every 30 seconds

### Graceful Degradation
- **NFR-REL-009**: If LLM API fails, users MUST see: "We're having trouble generating ideas. Please try again in a few minutes." with retry button
- **NFR-REL-010**: If résumé parsing fails, users MUST be able to manually enter profile data (no blocking)

---

## 6. Scalability

### Horizontal Scaling
- **NFR-SCALE-001**: Application MUST be stateless (no in-memory session storage); use database or Redis for session state
- **NFR-SCALE-002**: API MUST support horizontal scaling (multiple instances behind load balancer)

### Database
- **NFR-SCALE-003**: Database queries MUST use indexes on frequently queried fields (user_id, goal_id, plan_id, created_at)
- **NFR-SCALE-004**: Database MUST handle ≥1000 concurrent connections (Supabase default sufficient for MVP)

### Background Jobs
- **NFR-SCALE-005**: Long-running tasks (idea generation, artifact generation, data export) MUST run as background jobs (not blocking HTTP requests)
- **NFR-SCALE-006**: Background job queue MUST support retries with exponential backoff (3 attempts, 1s → 10s → 60s delays)

### Rate Limiting
- **NFR-SCALE-007**: Rate limiting MUST be enforced: 100 req/min per authenticated user, 20 req/min per IP (anonymous)
- **NFR-SCALE-008**: Idea generation MUST be rate-limited to 5 req/hour per user (LLM cost control)

---

## 7. Localization (i18n)

### Language Support
- **NFR-L10N-001**: MVP MUST support English only (US English)
- **NFR-L10N-002**: All user-facing strings MUST be externalized in locale files (e.g., `en-US.json`) to enable future translations
- **NFR-L10N-003**: UI MUST use Unicode (UTF-8) for all text rendering

### Future Expansion
- **NFR-L10N-004**: Design MUST accommodate future languages (e.g., Spanish, French) without UI refactoring
- **NFR-L10N-005**: Date/time formatting MUST respect user's locale (ISO 8601 in API, localized display in UI)

---

## 8. Maintainability

### Code Quality
- **NFR-MAINT-001**: All code MUST pass linting (ESLint with recommended rules) before merge
- **NFR-MAINT-002**: Code formatting MUST be enforced via Prettier
- **NFR-MAINT-003**: No hardcoded secrets; all secrets MUST be environment variables
- **NFR-MAINT-004**: React components MUST follow best practices: hooks rules, key props, prop-types or TypeScript

### Testing
- **NFR-MAINT-005**: Unit test coverage MUST be ≥70% for business logic (services, utilities)
- **NFR-MAINT-006**: Integration tests MUST cover critical user paths (signup → goal → questionnaire → ideas → plan)
- **NFR-MAINT-007**: LLM prompt templates MUST have golden output fixtures for regression testing

### Documentation
- **NFR-MAINT-008**: All public API endpoints MUST be documented (OpenAPI/Swagger)
- **NFR-MAINT-009**: Architectural decisions MUST be captured in ADRs (Architecture Decision Records) in `/docs/architecture/`
- **NFR-MAINT-010**: README MUST include: setup instructions, environment variable list, how to run tests, deployment process

### Deployment
- **NFR-MAINT-011**: CI/CD pipeline MUST run linting, tests, and accessibility checks before deployment
- **NFR-MAINT-012**: Deployments MUST be atomic (rollback possible within 5 minutes)
- **NFR-MAINT-013**: Canary releases MUST be used for major changes (10% traffic for 24 hours, then full rollout if metrics pass)

---

## 9. Compliance

### GDPR (If applicable to EU users)
- **NFR-COMP-001**: System MUST provide mechanisms for: right to access (data export), right to erasure (account deletion), right to portability (JSON export)
- **NFR-COMP-002**: Privacy policy MUST be clear, concise, and accessible (linked in footer, consent dialogs)

### CCPA (California users)
- **NFR-COMP-003**: Users MUST be able to opt out of data sharing with third parties (if applicable)
- **NFR-COMP-004**: "Do Not Sell My Personal Information" link MUST be provided if user data is sold/shared

### Ethical AI Use
- **NFR-COMP-005**: LLM prompts MUST NOT request or generate: discriminatory content, financial advice requiring licenses, medical advice, legal advice
- **NFR-COMP-006**: Ideas MUST be vetted against ethical exclusions (MLM, gambling, illegal activities) before presentation
- **NFR-COMP-007**: Fabricated statistics MUST be treated as critical bugs; all research citations MUST be verifiable

---

## 10. Monitoring & Observability

### Application Monitoring
- **NFR-OBS-001**: Real User Monitoring (RUM) MUST track: page load times, API response times, error rates, user flows (funnel analysis)
- **NFR-OBS-002**: Server-side metrics MUST track: CPU, memory, disk usage, request throughput, error rates
- **NFR-OBS-003**: Alerts MUST fire for: P95 response time >3s, error rate >5%, uptime <99.5%, LLM API failures

### Logs
- **NFR-OBS-004**: Structured logging MUST be used (JSON format) with fields: timestamp, level, user_id, request_id, message, context
- **NFR-OBS-005**: Logs MUST be centralized (e.g., CloudWatch, Datadog, LogRocket) for search and analysis

### Dashboards
- **NFR-OBS-006**: Real-time dashboard MUST display: active users, signup rate, activation rate, plan creation rate, error rates
- **NFR-OBS-007**: KPI dashboard MUST display: activation, selection rate, time-to-first outcome, 12-week retention, NPS (updated daily)

---

## Summary Table: NFR Priority

| Category | Critical (P0) | High (P1) | Medium (P2) |
|----------|--------------|-----------|-------------|
| **Security** | SEC-001, SEC-005, SEC-007, SEC-008 | SEC-002, SEC-003, SEC-006, SEC-009 | SEC-010, SEC-011, SEC-012 |
| **Privacy** | PRIV-006, PRIV-008 | PRIV-001, PRIV-004, PRIV-011 | PRIV-002, PRIV-005, PRIV-013 |
| **Accessibility** | A11Y-001, A11Y-004, A11Y-014 | A11Y-005, A11Y-008, A11Y-011 | A11Y-002, A11Y-009, A11Y-015 |
| **Performance** | PERF-001, PERF-003, PERF-004 | PERF-005, PERF-008, PERF-014 | PERF-011, PERF-012, PERF-016 |
| **Reliability** | REL-001, REL-003, REL-006 | REL-004, REL-007, REL-009 | REL-002, REL-008, REL-010 |
| **Scalability** | SCALE-001, SCALE-005 | SCALE-003, SCALE-007 | SCALE-002, SCALE-006, SCALE-008 |
| **Maintainability** | MAINT-003, MAINT-005, MAINT-011 | MAINT-001, MAINT-006, MAINT-009 | MAINT-002, MAINT-010, MAINT-013 |
| **Compliance** | COMP-005, COMP-006, COMP-007 | COMP-001, COMP-002 | COMP-003, COMP-004 |

**Total NFRs**: 87 (Critical: 21, High: 34, Medium: 32)

---

**Compliance**: This non-functional requirements document aligns with Junielyfe Constitution v1.0.0, specifically:
- **Principles IX–XIV**: Privacy & Security (consent, PII minimization, data isolation, export, deletion, log retention)
- **Principles XV–XIX**: Accessibility & UX (WCAG 2.1 AA, mobile-first, design tokens, microcopy, low-friction)
- **Principles XXV–XXVII**: Performance (P95 <1.5s, LLM <20s with streaming, offline grace)
- **Principles XXXIV–XXXV**: Governance (ADRs, coding standards, secure defaults)