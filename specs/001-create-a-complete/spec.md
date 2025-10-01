# Feature Specification: Junielyfe - Career & Finance Copilot

**Feature Branch**: `001-create-a-complete`
**Created**: 2025-09-29
**Status**: Draft
**Tagline**: "6 months to a new Lyfe."

## Product Summary

Junielyfe ingests LinkedIn data, résumé, and a personal narrative, captures a financial or career goal, then asks a quick/standard/in-depth (5/10/20) adaptive questionnaire. It generates 8–12 research-backed ideas (employee, freelance, micro-SaaS/content), explains why each fits, and turns selections into a 4-week starter plan with tasks, resources, and auto-generated artifacts (résumé rewrite, LinkedIn copy, outreach templates, portfolio brief, learning plan). Progress is gamified (XP, streaks, badges) and focused on measurable outcomes in 4–12 weeks.

## Vision & Goals

### Primary Objectives
- **First session**: User receives 8–12 personalized ideas and selects ≥1; a 4-week plan is created automatically
- **4–12 weeks**: User achieves a tangible milestone (interview, client lead, portfolio artifact, or first dollar earned)
- **6 months**: User has transformed their career or income trajectory ("6 months to a new Lyfe")

### Success Metrics
- **Activation**: % of signups completing questionnaire → plan within first session
- **Selection Rate**: Average # of ideas picked per user; distribution of 0/1/2/3 picks
- **Time-to-First-Outcome**: Days from plan creation to user logging first completed milestone
- **12-Week Retention**: % of users returning to app at least once in weeks 9–12 post-signup
- **NPS**: Net Promoter Score surveyed at 4-week and 12-week marks

## Target Users

### Primary Personas
1. **Career Switcher**: Professional seeking to transition roles/industries, especially into AI-adjacent fields
2. **Freelancer/Solopreneur**: Individual exploring or expanding independent income streams
3. **Public-sector Professional**: Law enforcement, government, or public service workers seeking career mobility

### Secondary Personas
4. **Under/Just-Employed**: Recent grad or underemployed worker seeking stable income
5. **Student/Graduate**: Final-year student or recent grad planning career entry
6. **Manager/Enabler**: Manager or mentor helping team members grow

**Common Thread**: All users are navigating the AI economy and want a supportive companion, not just a job board.

---

## User Scenarios & Testing

### Primary User Story
Alex, a 32-year-old law enforcement officer with 8 years of experience, feels stuck and wants to explore career options that leverage their analytical skills while offering better work-life balance. Alex signs up for Junielyfe, uploads their résumé, connects their LinkedIn profile, and writes a brief narrative about their background and frustrations. They set a goal: "Transition to a remote-friendly role earning $85k+ within 6 months." After answering 10 adaptive questions about their constraints (10 hrs/week available, risk-averse, needs remote work), Junielyfe presents 10 ideas including: fraud analyst, compliance consultant, security operations roles, and a micro-SaaS idea for public safety software. Alex selects 2 ideas (fraud analyst + compliance consulting). Within seconds, they receive a 4-week plan with 15 tasks, including a rewritten résumé emphasizing transferable skills, LinkedIn headline optimization, 5 outreach templates, and a learning plan for relevant certifications. Over 4 weeks, Alex follows the plan, earns XP for completed tasks, and lands 2 informational interviews.

### Acceptance Scenarios

1. **Given** a new user with no profile, **When** they complete LinkedIn sign-in, upload a résumé, write a 500-word narrative, and set a career goal, **Then** they proceed to questionnaire selection (5/10/20 questions)

2. **Given** a user selecting "Standard (10 questions)", **When** they answer questions, **Then** subsequent questions adapt based on their responses, showing "Why we ask" tooltips on hover

3. **Given** a user completing the questionnaire, **When** idea generation runs, **Then** 8–12 ideas are presented with fit/market/speed/risk scores, "Why this fits" explanations citing user inputs, and at least 1 employee, 1 freelance, and 1 builder idea

4. **Given** a user selecting 2 ideas, **When** they click "Create Plan", **Then** a 4-week plan with 10–20 tasks, weekly milestones, and resource links is generated within 20 seconds

5. **Given** a user with an active plan, **When** they mark a task complete, **Then** they earn XP, see progress update, and receive encouraging microcopy

6. **Given** a user requesting data export, **When** they click "Export My Data", **Then** a JSON + PDF bundle with all profile, goals, ideas, plans, and artifacts is delivered within 10 seconds

7. **Given** a user requesting account deletion, **When** they confirm "Delete My Data", **Then** all user data is permanently deleted from production within 24 hours and confirmation is emailed

### Edge Cases
- What happens when a user uploads a résumé in an unsupported format (e.g., .pages)? → Clear error message with supported formats listed
- What happens when LinkedIn sign-in fails or user denies permissions? → User can proceed with manual profile entry or skip LinkedIn
- What happens when idea generation fails (LLM timeout/error)? → User sees error message with retry option and partial results if available
- What happens when a user tries to select 0 ideas or >3 ideas? → Validation message: "Please select 1–3 ideas to create a plan"
- What happens when a user abandons onboarding mid-questionnaire? → Progress is saved; user can resume from last question on return
- What happens when a user sets an unrealistic goal (e.g., "$1M in 1 week")? → System flags goal as "ambitious" and suggests realistic milestone adjustments

---

## Requirements

### Functional Requirements

#### FR-001: Data Ingestion
- System MUST allow users to connect LinkedIn account for identity verification and public profile URL extraction
- System MUST allow users to upload résumés in PDF and DOCX formats (≤5MB)
- System MUST parse résumé to extract roles, skills, education, and experience into editable fields
- System MUST allow users to write a free-form narrative (200–2000 words) describing background and aspirations
- System MUST obtain explicit consent for each data source before ingestion
- System MUST allow users to skip any data source and proceed with partial data

#### FR-002: Goal Capture
- System MUST allow users to define either a financial goal (target income delta + horizon) or career goal (target role/title + horizon)
- System MUST capture constraints: hours/week available, risk tolerance (low/medium/high), remote-only preference, budget for learning/tools, ethical/industry exclusions
- System MUST validate goals for clarity (reject vague goals like "be successful") but never reject for ambition level
- System MUST store goals with timestamps for progress tracking

#### FR-003: Adaptive Questionnaire
- System MUST offer 3 questionnaire depths: Quick (5), Standard (10), In-Depth (20)
- System MUST adapt questions based on goal type (financial vs. career) and prior answers (skip logic for detailed responses, follow-up for shallow responses)
- System MUST provide optional "Why we ask" tooltips for each question
- System MUST NOT request protected attributes (age, race, gender) or salary history
- System MUST save questionnaire progress automatically and allow resumption

#### FR-004: Idea Generation
- System MUST generate 8–12 personalized ideas within 20 seconds (with streaming progress feedback)
- System MUST enforce diversity rule: ≥1 employee role, ≥1 freelance/consulting opportunity, ≥1 builder/creator idea (micro-SaaS, content, product)
- System MUST score each idea across 4 dimensions: fit (alignment with profile), market (demand/viability), speed (time to first outcome), risk (uncertainty/investment)
- System MUST provide "Why this fits" explanation for each idea, citing specific user inputs (skills, experience, constraints) and research evidence
- System MUST include first 3 actionable steps for each idea
- System MUST cache generated ideas for repeated views without regeneration

#### FR-005: Idea Selection & Plan Generation
- System MUST allow users to select 1–3 ideas
- System MUST generate a 4-week plan with 10–20 tasks when user confirms selection
- System MUST respect user constraints (hours/week, budget) when planning tasks
- System MUST include weekly proof-of-work milestones (measurable deliverables)
- System MUST provide resource links (courses, tools, templates) for each task
- System MUST make plans editable (add/remove/reorder tasks)

#### FR-006: Artifact Generation
- System MUST generate the following artifacts automatically upon plan creation:
  - **Résumé Rewrite**: Optimized for selected ideas, emphasizing transferable skills
  - **LinkedIn Headline & About**: Tailored to target roles/industries
  - **5 Outreach Templates**: For recruiter, hiring manager, potential client, mentor, alumni
  - **Portfolio Brief**: What to build + evaluation rubric (if builder idea selected)
  - **Learning Plan**: 8–12 week structured learning path with milestones
- System MUST make all artifacts editable with version history
- System MUST allow users to export artifacts individually or as a bundle (PDF/DOCX)

#### FR-007: Gamification & Accountability
- System MUST award XP for completed tasks, with levels tied to milestones (e.g., Level 1 = first task, Level 5 = first week complete)
- System MUST track streaks (consecutive days with at least 1 task completed)
- System MUST award badges for achievements (e.g., "First Interview", "3 Outreach Sent", "Portfolio Published")
- System MUST send weekly check-in prompts (email first, in-app secondary) asking for progress updates
- System MUST allow users to opt out of email nudges
- System MUST implement anti-gaming rules (e.g., task completion requires 15-second minimum delay, no XP for rapid marking/unmarking)

#### FR-008: Trust & Data Control
- System MUST allow users to export all data (profile, goals, questionnaire responses, ideas, plans, artifacts) in JSON and PDF formats
- System MUST complete data export within 10 seconds or provide async delivery
- System MUST allow users to request account deletion with all data permanently deleted from production within 24 hours
- System MUST send deletion confirmation email
- System MUST provide clear audit trail of progress (timeline view of completed tasks, milestones reached, artifacts created)

#### FR-009: Research & Evidence
- System MUST derive ideas from or validate against at least one of: labor market data (BLS, LinkedIn Economic Graph), published case studies, educational research, financial planning best practices
- System MUST cache research findings for ≥7 days to reduce redundant API calls
- System MUST document sources and assumptions in "Why this fits" explanations
- System MUST flag ideas as "exploratory" when data is incomplete or assumptions are made
- System MUST NOT fabricate statistics, success rates, or case studies

#### FR-010: Ethical Guardrails
- System MUST exclude from recommendations: MLM/pyramid schemes, day-trading/crypto speculation, gambling, unlicensed professional services (legal/medical/financial advice requiring credentials), illegal activities
- System MUST flag ideas requiring >20 hrs/week as "intensive"
- System MUST ensure all ideas are achievable within 4–12 weeks with measurable milestones

---

### Key Entities

- **User**: Individual with account, authentication, and profile data (LinkedIn, résumé, narrative)
- **Profile**: Parsed user data including roles, skills, education, experience, constraints
- **Goal**: Financial or career objective with target, horizon, and constraints
- **Questionnaire**: Template with depth (5/10/20), questions with adaptive logic, "Why we ask" tooltips
- **Answer**: User response to questionnaire question, linked to questionnaire session
- **Idea**: Generated career/income opportunity with scores, explanation, first steps, category (employee/freelance/builder)
- **Plan**: 4-week structured plan with tasks, milestones, resources
- **Task**: Individual action item with title, description, XP value, completion status, due date
- **Artifact**: Generated document (résumé, LinkedIn copy, template, brief, learning plan) with version history
- **Progress**: User's gamification state (XP, level, streak, badges, completed tasks)
- **Research Cache**: Cached labor market data, case studies, research findings with expiration

---

## Review & Acceptance Checklist

### Content Quality
- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

### Requirement Completeness
- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

---

## Execution Status

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [x] Review checklist passed

---

**Compliance**: This specification aligns with Junielyfe Constitution v1.0.0, specifically Principles I–VIII (Product Philosophy), IX–XIV (Privacy & Security), XV–XIX (Accessibility & UX), and XXXVII (MVP Scope Discipline).