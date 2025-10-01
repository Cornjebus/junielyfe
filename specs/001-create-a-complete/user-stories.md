# User Stories: Junielyfe

**Feature**: Junielyfe Career & Finance Copilot
**Branch**: `001-create-a-complete`
**Date**: 2025-09-29

---

## Story 1: Data Ingestion & Profile Creation

**As a** new user seeking career guidance
**I want to** upload my résumé, connect LinkedIn, and share my story
**So that** Junielyfe understands my background and can personalize recommendations

### Acceptance Criteria

#### AC-1.1: LinkedIn Connection
- **Given** I am on the profile setup page
- **When** I click "Connect LinkedIn"
- **Then** I am redirected to LinkedIn OAuth flow
- **And** upon successful authorization, my name, email, and public profile URL are imported
- **And** I see a confirmation "LinkedIn connected ✓"

#### AC-1.2: LinkedIn Connection Failure
- **Given** LinkedIn OAuth fails or I deny permissions
- **When** I return to the app
- **Then** I see a message "LinkedIn connection optional—continue with manual entry"
- **And** I can proceed without LinkedIn data

#### AC-1.3: Résumé Upload
- **Given** I am on the profile setup page
- **When** I upload a PDF or DOCX résumé (≤5MB)
- **Then** the system parses the résumé within 10 seconds
- **And** I see extracted roles, skills, education, and experience in editable fields
- **And** I can manually correct or add missing information

#### AC-1.4: Unsupported Résumé Format
- **Given** I attempt to upload a résumé in .pages, .txt, or other unsupported format
- **When** I click "Upload"
- **Then** I see an error "Unsupported format. Please upload PDF or DOCX (max 5MB)"
- **And** the upload is rejected

#### AC-1.5: Personal Narrative
- **Given** I have completed LinkedIn and/or résumé steps
- **When** I reach the narrative section
- **Then** I see a text area with placeholder: "Tell us about your journey, what you're looking for, and what matters most to you (200–2000 words)"
- **And** character count is displayed live
- **And** I can save a draft and return later

#### AC-1.6: Consent Per Data Source
- **Given** I am at each data ingestion step (LinkedIn, résumé, narrative)
- **When** I reach that step
- **Then** I see explicit consent language: "We'll use this to personalize your ideas. Retained for [duration]. You can export or delete anytime."
- **And** I can skip any step and proceed with partial data

---

## Story 2: Goal Definition & Constraints

**As a** user with profile data entered
**I want to** define my career or financial goal and set constraints
**So that** recommendations are realistic and aligned with my situation

### Acceptance Criteria

#### AC-2.1: Goal Type Selection
- **Given** I have completed profile setup
- **When** I reach the goal definition page
- **Then** I see two options: "Career Goal" and "Financial Goal"
- **And** I can select one

#### AC-2.2: Career Goal Details
- **Given** I select "Career Goal"
- **When** I fill out the form
- **Then** I enter: target role/title, horizon (weeks/months), current situation
- **And** validation rejects vague goals (e.g., "be successful") with message: "Please be more specific—what role or outcome are you aiming for?"

#### AC-2.3: Financial Goal Details
- **Given** I select "Financial Goal"
- **When** I fill out the form
- **Then** I enter: target income delta (e.g., "+$20k/year"), horizon, current income (optional)
- **And** unrealistic goals (e.g., "$1M in 1 week") trigger warning: "This is ambitious! We recommend breaking this into smaller milestones."

#### AC-2.4: Constraints Capture
- **Given** I have defined a goal
- **When** I proceed to constraints
- **Then** I set: hours/week available (slider 1–40), risk tolerance (low/medium/high), remote-only checkbox, budget for tools/learning (optional), ethical/industry exclusions (multi-select)
- **And** all constraints are optional except hours/week

#### AC-2.5: Goal Storage & Editing
- **Given** I have saved a goal
- **When** I return to the app
- **Then** I can view, edit, or create a new goal
- **And** goal history is preserved with timestamps

---

## Story 3: Adaptive Questionnaire

**As a** user with a defined goal
**I want to** answer personalized questions at my chosen depth
**So that** idea generation is informed by my preferences and situation

### Acceptance Criteria

#### AC-3.1: Depth Selection
- **Given** I have defined a goal
- **When** I reach the questionnaire page
- **Then** I see three options: "Quick (5 questions, ~2 min)", "Standard (10 questions, ~5 min)", "In-Depth (20 questions, ~10 min)"
- **And** I can select one

#### AC-3.2: Question Adaptation (Goal-Based)
- **Given** I selected "Career Goal"
- **When** I start the questionnaire
- **Then** questions focus on skills, industries, roles, work environment preferences
- **Given** I selected "Financial Goal"
- **Then** questions focus on income sources, risk, time commitment, monetization preferences

#### AC-3.3: Question Adaptation (Answer-Based)
- **Given** I answer a question in detail (>50 words)
- **When** the next question loads
- **Then** follow-up questions may be skipped (skip logic applied)
- **Given** I answer shallowly (<10 words)
- **Then** a clarifying follow-up question appears

#### AC-3.4: "Why We Ask" Tooltips
- **Given** I am viewing a question
- **When** I hover/tap the (i) icon next to the question
- **Then** I see a tooltip explaining why this information helps personalize ideas

#### AC-3.5: Protected Attributes Exclusion
- **Given** I am answering questions
- **When** I review all questions
- **Then** none request: age, race, gender, disability status, salary history, or other protected attributes

#### AC-3.6: Progress Saving
- **Given** I am mid-questionnaire
- **When** I close the app or lose connection
- **Then** my progress is auto-saved
- **And** I can resume from the last answered question on return

---

## Story 4: Idea Generation & Presentation

**As a** user who completed the questionnaire
**I want to** receive 8–12 personalized, research-backed ideas
**So that** I can evaluate realistic paths forward

### Acceptance Criteria

#### AC-4.1: Idea Generation Initiation
- **Given** I complete the questionnaire
- **When** I click "Generate Ideas"
- **Then** I see a loading state with streaming progress feedback: "Analyzing your profile...", "Researching opportunities...", "Scoring ideas..."
- **And** generation completes within 20 seconds

#### AC-4.2: Idea Count & Diversity
- **Given** idea generation completes
- **When** I view results
- **Then** I see 8–12 ideas
- **And** at least 1 is tagged "Employee" (full-time/part-time role)
- **And** at least 1 is tagged "Freelance" (consulting, contract work)
- **And** at least 1 is tagged "Builder" (micro-SaaS, content, product)

#### AC-4.3: Idea Scoring
- **Given** I view an idea
- **When** I review its details
- **Then** I see 4 scores (0–100 scale): Fit, Market, Speed, Risk
- **And** each score has a 1-sentence explanation (e.g., "Fit: 85—Your analytical skills and public sector experience align strongly")

#### AC-4.4: "Why This Fits" Explanation
- **Given** I view an idea
- **When** I expand "Why this fits"
- **Then** I see 2–4 sentences citing specific user inputs (skills, experience, constraints) and research evidence (e.g., "BLS data shows 18% growth in fraud analyst roles through 2030")
- **And** no fabricated statistics appear; vague statements are flagged as "exploratory"

#### AC-4.5: First 3 Steps
- **Given** I view an idea
- **When** I scroll to action steps
- **Then** I see the first 3 actionable steps (e.g., "1. Update résumé to emphasize investigative skills", "2. Complete free fraud detection course on Coursera", "3. Reach out to 3 fraud analysts on LinkedIn")

#### AC-4.6: Idea Caching
- **Given** I generated ideas and navigated away
- **When** I return to the ideas page within 7 days
- **Then** I see cached ideas without regeneration
- **And** I can manually trigger regeneration if desired

---

## Story 5: Idea Selection & Plan Creation

**As a** user reviewing ideas
**I want to** select 1–3 ideas and receive a structured 4-week plan
**So that** I have clear next steps and accountability

### Acceptance Criteria

#### AC-5.1: Idea Selection
- **Given** I am viewing 8–12 ideas
- **When** I select ideas
- **Then** I can select 1–3 ideas (checkboxes)
- **And** attempting to select 0 or >3 shows validation: "Please select 1–3 ideas to create a plan"

#### AC-5.2: Plan Generation
- **Given** I have selected 1–3 ideas
- **When** I click "Create My Plan"
- **Then** a 4-week plan with 10–20 tasks is generated within 20 seconds
- **And** I see a success message: "Your plan is ready! Let's get started."

#### AC-5.3: Task Details
- **Given** my plan is generated
- **When** I view tasks
- **Then** each task has: title, description, estimated time, week assignment, resource links, XP value
- **And** tasks respect my hours/week constraint (total weekly time ≤ hours/week)

#### AC-5.4: Weekly Milestones
- **Given** I view my plan
- **When** I check weekly breakdowns
- **Then** each week has a "Proof-of-Work" milestone (e.g., Week 1: "Résumé updated and reviewed by 2 peers", Week 2: "5 outreach messages sent")

#### AC-5.5: Plan Editing
- **Given** I have a generated plan
- **When** I want to customize it
- **Then** I can add, remove, or reorder tasks
- **And** changes are saved automatically

---

## Story 6: Artifact Generation

**As a** user with a created plan
**I want to** receive auto-generated artifacts (résumé, templates, etc.)
**So that** I have ready-to-use materials for my job search or career transition

### Acceptance Criteria

#### AC-6.1: Artifact Generation Trigger
- **Given** I created a plan
- **When** plan generation completes
- **Then** artifacts are generated automatically within 30 seconds
- **And** I see a notification: "5 artifacts ready for review"

#### AC-6.2: Résumé Rewrite
- **Given** artifacts are generated
- **When** I view the résumé artifact
- **Then** I see a rewritten résumé emphasizing transferable skills relevant to selected ideas
- **And** I can edit the résumé inline with rich text editor
- **And** original résumé is preserved as version 0

#### AC-6.3: LinkedIn Headline & About
- **Given** artifacts are generated
- **When** I view LinkedIn artifacts
- **Then** I see optimized headline (≤220 chars) and About section (≤2000 chars) tailored to target roles
- **And** I can copy to clipboard with one click

#### AC-6.4: Outreach Templates
- **Given** artifacts are generated
- **When** I view outreach templates
- **Then** I see 5 templates: for recruiter, hiring manager, potential client, mentor, alumni
- **And** each template has placeholders [Name], [Company], [Context] for easy customization
- **And** I can export as plain text or copy to clipboard

#### AC-6.5: Portfolio Brief (Builder Ideas Only)
- **Given** I selected a "Builder" idea
- **When** artifacts are generated
- **Then** I see a portfolio brief with: project concept, key features to build, success criteria, evaluation rubric
- **And** the brief is 1–2 pages (PDF export available)

#### AC-6.6: Learning Plan
- **Given** artifacts are generated
- **When** I view the learning plan
- **Then** I see an 8–12 week structured plan with: skills to learn, recommended courses/resources, weekly time commitment, milestone assessments
- **And** I can mark resources as completed

#### AC-6.7: Artifact Export
- **Given** I have generated artifacts
- **When** I click "Export Artifacts"
- **Then** I can download individual artifacts (PDF/DOCX) or a bundle (ZIP)
- **And** export completes within 10 seconds

#### AC-6.8: Version History
- **Given** I edit an artifact
- **When** I save changes
- **Then** a new version is created
- **And** I can view version history and revert to previous versions

---

## Story 7: Gamification & Progress Tracking

**As a** user following my plan
**I want to** earn XP, track streaks, and receive encouragement
**So that** I stay motivated and see tangible progress

### Acceptance Criteria

#### AC-7.1: Task Completion & XP
- **Given** I have tasks in my plan
- **When** I mark a task as complete
- **Then** I earn XP (displayed: "+10 XP")
- **And** my total XP and level update immediately
- **And** a 15-second minimum delay prevents rapid gaming

#### AC-7.2: Leveling System
- **Given** I earn XP
- **When** I reach XP thresholds (e.g., 100 XP = Level 2, 300 XP = Level 3)
- **Then** I see a level-up animation and message: "Level 2 unlocked! Keep the momentum going."
- **And** level milestones align with plan progress (e.g., Level 5 = Week 1 complete)

#### AC-7.3: Streak Tracking
- **Given** I complete at least 1 task per day
- **When** I check my progress
- **Then** I see my current streak count (e.g., "5-day streak 🔥")
- **And** if I miss a day, streak resets to 0 with supportive message: "Streaks are hard—let's start fresh today"

#### AC-7.4: Badge Achievements
- **Given** I reach milestones
- **When** milestones are achieved (e.g., "First Interview Scheduled", "3 Outreach Sent", "Portfolio Published")
- **Then** I earn badges displayed in my profile
- **And** I see a congratulatory message: "Badge earned: Portfolio Published 🏆"

#### AC-7.5: Weekly Check-Ins
- **Given** I have an active plan
- **When** 7 days pass since plan creation or last check-in
- **Then** I receive an email (if opted in) with subject: "How's your week going?"
- **And** email prompts: "Mark completed tasks, share a win, or adjust your plan"
- **And** in-app notification appears

#### AC-7.6: Email Opt-Out
- **Given** I receive weekly check-in emails
- **When** I click "Unsubscribe" or toggle setting in profile
- **Then** email nudges stop immediately
- **And** I still see in-app check-in prompts

#### AC-7.7: Anti-Gaming Rules
- **Given** I mark a task complete
- **When** I try to unmark and remark within 60 seconds
- **Then** no additional XP is awarded
- **And** I see a message: "XP already awarded for this task"

---

## Story 8: Data Control & Trust

**As a** user concerned about privacy
**I want to** export my data or delete my account easily
**So that** I maintain control and trust the platform

### Acceptance Criteria

#### AC-8.1: Data Export
- **Given** I am logged in
- **When** I navigate to Settings > "Export My Data"
- **Then** I can choose format: JSON (raw data) or PDF (readable)
- **And** export includes: profile, goals, questionnaire responses, ideas, plans, tasks, artifacts
- **And** download link is provided within 10 seconds (or email if >10s)

#### AC-8.2: Account Deletion Request
- **Given** I am logged in
- **When** I navigate to Settings > "Delete My Account"
- **Then** I see a confirmation dialog: "This will permanently delete all your data within 24 hours. Are you sure?"
- **And** I must type "DELETE" to confirm

#### AC-8.3: Deletion Execution
- **Given** I confirmed account deletion
- **When** 24 hours pass
- **Then** all my data is permanently deleted from production databases
- **And** I receive a confirmation email: "Your account has been deleted"

#### AC-8.4: Progress Timeline
- **Given** I have completed tasks and reached milestones
- **When** I view my profile
- **Then** I see a timeline visualization: completed tasks, milestones reached, artifacts created, badges earned
- **And** timeline is exportable as PDF

---

## Acceptance Test Summary

| Story | Critical Path | Total ACs |
|-------|---------------|-----------|
| 1: Data Ingestion | ✓ | 6 |
| 2: Goal Definition | ✓ | 5 |
| 3: Questionnaire | ✓ | 6 |
| 4: Idea Generation | ✓ | 6 |
| 5: Plan Creation | ✓ | 5 |
| 6: Artifacts | ✓ | 8 |
| 7: Gamification | — | 7 |
| 8: Data Control | — | 4 |
| **Total** | **6/8** | **47** |

**Critical Path**: Stories 1–6 form the core MVP flow (profile → goal → questionnaire → ideas → plan → artifacts). Stories 7–8 enhance engagement and trust but are not blocking for initial launch.

---

**Compliance**: All acceptance criteria align with Junielyfe Constitution v1.0.0 principles, particularly Consent Per Data Source (IX), PII Minimization (X), Export Anytime (XII), Delete My Data (XIII), and Companion Tone (V).