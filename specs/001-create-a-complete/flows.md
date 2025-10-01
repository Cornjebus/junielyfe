# UX Flows & Wireframe Notes: Junielyfe

**Feature**: Junielyfe Career & Finance Copilot
**Branch**: `001-create-a-complete`
**Date**: 2025-09-29

---

## Core User Flows

### Flow 1: First-Time User Onboarding (Critical Path)

**Goal**: Get user from signup to at least 1 selected idea + 4-week plan in ≤10 minutes

```
┌─────────────────────────────────────────────────────────────────────┐
│ 1. Landing & Signup                                                 │
│    - Hero: "6 months to a new Lyfe"                                 │
│    - CTA: "Get Started—Free"                                        │
│    - Email + password OR Google/LinkedIn OAuth                      │
│    - Time: ~30s                                                     │
└──────────────────────┬──────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 2. Profile Setup (Data Ingestion)                                   │
│    Step 2a: LinkedIn Connection (Optional)                          │
│    - "Connect LinkedIn to import your profile" [Connect] [Skip]     │
│    - If connected: shows imported name, email, profile URL          │
│    - Time: ~30–60s                                                  │
│                                                                      │
│    Step 2b: Résumé Upload (Optional)                                │
│    - "Upload your résumé (PDF/DOCX, max 5MB)" [Upload] [Skip]       │
│    - If uploaded: parsing spinner → editable fields                 │
│    - Shows: roles, skills, education, experience                    │
│    - Time: ~1–2min                                                  │
│                                                                      │
│    Step 2c: Your Story                                              │
│    - "Tell us about your journey (200–2000 words)"                  │
│    - Textarea with live character count                             │
│    - Placeholder prompts: "What brought you here? What matters?"    │
│    - [Save Draft] [Continue]                                        │
│    - Time: ~2–4min                                                  │
└──────────────────────┬──────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 3. Goal Definition                                                   │
│    - Choice: [Career Goal] or [Financial Goal]                      │
│    - Career: Target role, horizon, current situation                │
│    - Financial: Income delta, horizon, current income (opt)         │
│    - Constraints: hours/week (slider), risk, remote, budget, ethics │
│    - Validation: rejects vague goals, flags unrealistic ones        │
│    - Time: ~1–2min                                                  │
└──────────────────────┬──────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 4. Questionnaire Depth Selection                                    │
│    - Cards: [Quick: 5Q, ~2min] [Standard: 10Q, ~5min]               │
│             [In-Depth: 20Q, ~10min]                                 │
│    - Recommendation: "Standard works for most people"               │
│    - Time: ~10s                                                     │
└──────────────────────┬──────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 5. Adaptive Questionnaire                                           │
│    - Progress bar: "Question 3 of 10"                               │
│    - Question text + optional (i) tooltip "Why we ask"              │
│    - Input: text, select, multi-select (varies by question)         │
│    - [Back] [Next]                                                  │
│    - Auto-save after each answer                                    │
│    - Time: ~2–10min (depending on depth)                            │
└──────────────────────┬──────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 6. Idea Generation (Streaming)                                      │
│    - Loading state with streaming updates:                          │
│      "Analyzing your profile..." → "Researching opportunities..."   │
│      → "Scoring ideas..." → "Almost there..."                       │
│    - Progress spinner                                               │
│    - Time: ≤20s                                                     │
└──────────────────────┬──────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 7. Idea Results (Selection)                                         │
│    - Header: "We found 10 ideas for you"                            │
│    - Grid/list of idea cards:                                       │
│      - Title, category badge (Employee/Freelance/Builder)           │
│      - 4 scores: Fit, Market, Speed, Risk (0–100, color-coded)      │
│      - "Why this fits" expandable section (2–4 sentences)           │
│      - First 3 steps preview                                        │
│      - [Select] checkbox                                            │
│    - Sticky footer: "X ideas selected" [Create My Plan] (disabled   │
│      if 0 or >3 selected)                                           │
│    - Time: ~2–5min (browsing + selection)                           │
└──────────────────────┬──────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 8. Plan Generation (Streaming)                                      │
│    - Loading: "Creating your 4-week plan..."                        │
│    - Progress spinner                                               │
│    - Time: ≤20s                                                     │
└──────────────────────┬──────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 9. Plan Ready (Success State)                                       │
│    - Success message: "Your plan is ready! Let's get started."      │
│    - Plan overview:                                                 │
│      - 4-week timeline with weekly milestones                       │
│      - Task list (10–20 tasks) with week assignments                │
│      - Each task: title, time estimate, XP value, resources         │
│    - Artifacts notification: "5 artifacts ready for review"         │
│    - CTA: [View My Plan] [Download Artifacts]                       │
│    - Time: instant                                                  │
└──────────────────────┴──────────────────────────────────────────────┘

**Total Time**: 8–15 minutes (target: ≤10 min for motivated users)
```

---

### Flow 2: Returning User—Plan Execution

**Goal**: User logs in, reviews plan, marks tasks complete, tracks progress

```
┌─────────────────────────────────────────────────────────────────────┐
│ 1. Login                                                            │
│    - Email/password or OAuth                                        │
│    - Redirects to Dashboard                                         │
└──────────────────────┬──────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 2. Dashboard (Home)                                                 │
│    Top Section: Progress Summary                                    │
│    - Current streak: "5-day streak 🔥"                              │
│    - Level & XP: "Level 3 | 230 XP" (progress bar to Level 4)      │
│    - Weekly milestone: "Week 2: Send 5 outreach messages (3/5)"    │
│                                                                      │
│    Middle Section: This Week's Tasks                                │
│    - Task cards (3–5 tasks for current week):                       │
│      - [ ] Task title                                               │
│      - Time estimate, XP value                                      │
│      - [Mark Complete]                                              │
│                                                                      │
│    Bottom Section: Quick Actions                                    │
│    - [View Full Plan] [My Artifacts] [Weekly Check-In]              │
└──────────────────────┬──────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 3. Task Completion Flow                                             │
│    - User clicks [Mark Complete]                                    │
│    - Modal: "Did you complete this task?" [Yes] [Not Yet]           │
│    - If Yes:                                                        │
│      - Success animation: "+10 XP"                                  │
│      - Task marked with checkmark ✓                                 │
│      - Progress summary updates (XP, level, weekly milestone)       │
│      - Encouraging microcopy: "Nice work! Keep it up."              │
│    - If Not Yet:                                                    │
│      - Modal closes, task remains incomplete                        │
└──────────────────────┬──────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 4. Artifact Review & Editing                                        │
│    - Navigate to [My Artifacts]                                     │
│    - Artifact list: Résumé, LinkedIn Headline, Outreach Templates,  │
│      Portfolio Brief, Learning Plan                                 │
│    - Click artifact → opens in editor (rich text or textarea)       │
│    - [Save] [Export PDF] [Copy to Clipboard] [Version History]      │
└──────────────────────┴──────────────────────────────────────────────┘

**Frequency**: Daily (ideal) or 2–3x/week
```

---

### Flow 3: Weekly Check-In (Email + In-App)

**Goal**: Re-engage users, prompt progress updates, celebrate wins

```
┌─────────────────────────────────────────────────────────────────────┐
│ 1. Email Trigger (Weekly)                                           │
│    - Subject: "How's your week going?"                              │
│    - Body:                                                          │
│      "Hi [Name], it's been a week since we last checked in.         │
│       You're currently in Week [X] of your plan.                    │
│                                                                      │
│       Quick update:                                                 │
│       - [Y] tasks completed this week                               │
│       - [Z] XP earned                                               │
│                                                                      │
│       [Mark Completed Tasks] [Share a Win] [Adjust Plan]"           │
│    - CTA links to in-app check-in page                              │
└──────────────────────┬──────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 2. In-App Check-In Page                                             │
│    Header: "Week [X] Check-In"                                      │
│                                                                      │
│    Section A: Mark Completed Tasks                                  │
│    - Checklist of week's tasks (pre-filled if already marked)       │
│    - Batch mark: [Mark All] [Clear All]                             │
│                                                                      │
│    Section B: Share a Win (Optional)                                │
│    - "What's one thing you're proud of this week?"                  │
│    - Textarea (0–500 chars)                                         │
│                                                                      │
│    Section C: Adjust Plan (Optional)                                │
│    - "Need to move tasks or take a break?"                          │
│    - [Adjust Plan] → redirects to plan editor                       │
│                                                                      │
│    Footer: [Submit Check-In]                                        │
└──────────────────────┬──────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 3. Check-In Success                                                 │
│    - Success message: "Check-in complete! Keep up the momentum."    │
│    - Updated stats: XP earned, new badges (if any)                  │
│    - Redirect to Dashboard                                          │
└──────────────────────┴──────────────────────────────────────────────┘

**Frequency**: Weekly (email on Day 7, 14, 21, 28)
```

---

### Flow 4: Data Export & Account Deletion

**Goal**: Provide transparency and control over personal data

```
┌─────────────────────────────────────────────────────────────────────┐
│ 1. Settings Page                                                    │
│    - Navigation: Dashboard → [Settings]                             │
│    - Sections: Profile, Notifications, Privacy, Account             │
└──────────────────────┬──────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 2A. Data Export Flow                                                │
│    - Navigate to Privacy → "Export My Data"                         │
│    - Choice: [JSON (raw data)] [PDF (readable)]                     │
│    - Click [Export]                                                 │
│    - If <10s: Immediate download link                               │
│    - If >10s: "Export is processing. Link will be emailed to you."  │
│    - Export includes: profile, goals, questionnaire, ideas, plans,  │
│      tasks, artifacts                                               │
└──────────────────────┴──────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 2B. Account Deletion Flow                                           │
│    - Navigate to Account → "Delete My Account"                      │
│    - Warning modal:                                                 │
│      "This will permanently delete all your data within 24 hours.   │
│       This action cannot be undone.                                 │
│                                                                      │
│       Type DELETE to confirm:"                                      │
│      [Text input] [Cancel] [Confirm Deletion]                       │
│    - If confirmed:                                                  │
│      - Logout immediately                                           │
│      - Deletion email sent: "Your account deletion is scheduled.    │
│        All data will be removed within 24 hours. You will receive   │
│        confirmation once complete."                                 │
│    - 24 hours later:                                                │
│      - Data permanently deleted                                     │
│      - Confirmation email: "Your account has been deleted."         │
└──────────────────────┴──────────────────────────────────────────────┘
```

---

## Wireframe Notes (Low-Fidelity)

### Screen 1: Landing Page
- **Layout**: Hero section (60vh), features section, CTA, footer
- **Hero**:
  - H1: "6 months to a new Lyfe" (large, bold)
  - Subhead: "Your AI companion for navigating the AI economy"
  - CTA button: "Get Started—Free" (primary color, large)
- **Features**: 3-column grid (mobile: stacked)
  - Icon + headline + 1-sentence description
  - Feature 1: "Personalized Ideas" / Feature 2: "4-Week Plans" / Feature 3: "Gamified Progress"
- **Tone**: Warm, encouraging, non-corporate

### Screen 2: Profile Setup (Step 2b: Résumé Upload)
- **Layout**: Single-column, centered (max-width 600px)
- **Components**:
  - Progress indicator: "Step 2 of 3" (dots or bar)
  - Heading: "Upload Your Résumé"
  - Subtext: "We'll extract your experience and skills (PDF/DOCX, max 5MB)"
  - Dropzone: Dashed border, icon, "Drag & drop or click to upload" | [Skip]
  - After upload: Parsing spinner → Editable fields (roles, skills, etc.)
  - Footer: [Back] [Continue]

### Screen 3: Questionnaire
- **Layout**: Single question per screen, centered
- **Components**:
  - Progress: "Question 5 of 10" (bar at top)
  - Question text (H2, readable font)
  - Optional (i) icon → hover/tap for "Why we ask" tooltip
  - Input field (text, select, or multi-select)
  - Footer: [Back] [Next] (sticky)
- **Mobile-first**: Large touch targets (≥44px)

### Screen 4: Idea Results (Grid View)
- **Layout**: Grid (2 cols desktop, 1 col mobile), sticky header + footer
- **Header**:
  - "We found 10 ideas for you" (H1)
  - Filter/sort (optional for v2): [All] [Employee] [Freelance] [Builder]
- **Idea Card**:
  - Title (H3)
  - Category badge (pill, color-coded)
  - 4 scores: Fit 85 | Market 72 | Speed 90 | Risk 40 (horizontal bar charts)
  - "Why this fits" (expandable accordion, max 3 lines preview)
  - "First 3 steps" (expandable, numbered list)
  - Checkbox: [Select]
- **Sticky Footer**:
  - "2 ideas selected" | [Create My Plan] (enabled if 1–3 selected)

### Screen 5: Dashboard (Returning User)
- **Layout**: 3-section vertical layout
- **Section 1: Progress Summary** (card, top)
  - Streak, Level/XP, Weekly milestone (horizontal layout, icons + text)
- **Section 2: This Week's Tasks** (cards, middle)
  - Task cards (max 5 visible, scroll for more)
  - Each card: Checkbox, title, time estimate, XP, [Mark Complete] button
- **Section 3: Quick Actions** (buttons, bottom)
  - [View Full Plan] [My Artifacts] [Weekly Check-In]
- **Navigation**: Sidebar (desktop) or bottom nav (mobile)

### Screen 6: Artifact Editor (Résumé Rewrite)
- **Layout**: Split view (desktop: 50/50, mobile: tabs)
- **Left/Tab 1**: Rich text editor
  - Editable résumé content
  - Formatting toolbar (bold, italic, bullets, headings)
- **Right/Tab 2**: Version history
  - List of versions with timestamps
  - [Revert to this version] button per version
- **Footer**: [Save] [Export PDF] [Copy to Clipboard]

---

## Mobile Considerations

### Responsive Breakpoints
- **Mobile**: 375px–767px (single column, bottom nav, stackable cards)
- **Tablet**: 768px–1023px (2-column grid, sidebar nav)
- **Desktop**: ≥1024px (multi-column grid, persistent sidebar)

### Touch Targets
- All buttons/taps ≥44×44px (iOS, Android standards)
- Increased spacing between interactive elements (min 8px)

### Performance
- Lazy load images, defer non-critical JS
- Optimize for 3G connections (target: <3s load on 3G)
- Progressive Web App (PWA) capability for offline grace (future)

---

## Accessibility Notes

### WCAG 2.1 AA Compliance
- **Color contrast**: ≥4.5:1 for text, ≥3:1 for large text and UI components
- **Keyboard navigation**: All interactive elements reachable via Tab, Shift+Tab; focus indicators visible
- **Screen readers**: Semantic HTML (`<nav>`, `<main>`, `<section>`), ARIA labels for icons, live regions for dynamic updates (XP gain, task completion)
- **No seizure triggers**: Animations ≤3 flashes/second, parallax effects optional with `prefers-reduced-motion` support

### Forms
- Clear labels for all inputs
- Error messages inline, associated with inputs via `aria-describedby`
- Required fields marked with visual indicator (not just color)

---

## Design Tokens (High-Level)

### Colors
- **Primary**: Warm teal (#16A085) — trust, growth
- **Secondary**: Soft orange (#F39C12) — energy, encouragement
- **Success**: Green (#27AE60)
- **Warning**: Amber (#F1C40F)
- **Error**: Red (#E74C3C)
- **Neutral**: Grays (#ECF0F1 → #2C3E50)

### Typography
- **Headings**: Sans-serif (e.g., Inter, system-ui), bold
- **Body**: Sans-serif, 16px base (mobile), 18px (desktop), line-height 1.6
- **Monospace**: For code snippets (if needed in learning plans)

### Spacing
- Base unit: 8px (0.5rem)
- Spacing scale: 8, 16, 24, 32, 48, 64px

### Tone (Microcopy Examples)
- ✅ "Let's map out your next move together."
- ✅ "Week 2 done—nice momentum on that portfolio!"
- ✅ "Streaks are hard—let's start fresh today."
- ❌ "Unlock your full potential with our synergistic solution."
- ❌ "Congratulations on completing the designated milestone."

---

**Compliance**: All flows and wireframe notes align with Junielyfe Constitution v1.0.0, specifically Principles XV–XIX (Accessibility & UX), including WCAG 2.1 AA, mobile-first design, consistent design tokens, clear microcopy, and low-friction first session.