# Metrics & Analytics: Junielyfe

**Feature**: Junielyfe Career & Finance Copilot
**Branch**: `001-create-a-complete`
**Date**: 2025-09-29

---

## Key Performance Indicators (KPIs)

### 1. Activation Rate
**Definition**: Percentage of signups who complete the critical path (questionnaire → plan creation) within their first session.

**Formula**:
```
Activation Rate = (Users with Plan Created in Session 1 / Total Signups) × 100
```

**Target**: ≥40% (MVP), ≥60% (6 months post-launch)

**Why It Matters**: Activation measures whether users experience core value quickly. Low activation indicates onboarding friction or unclear value prop.

**Dashboard**: Real-time (updated every 5 minutes)

---

### 2. Selection Rate
**Definition**: Average number of ideas selected per user when presented with 8–12 ideas.

**Formula**:
```
Selection Rate = Total Ideas Selected / Total Users Who Viewed Ideas
```

**Target**: Average 1.5–2.5 ideas selected per user; ≥50% select ≥1 idea

**Distribution Target**:
- 0 ideas selected: <20%
- 1 idea selected: 30–40%
- 2 ideas selected: 30–40%
- 3 ideas selected: 10–20%

**Why It Matters**: Selection rate indicates idea quality and relevance. High 0-selection rate suggests poor personalization.

**Dashboard**: Updated daily

---

### 3. Time-to-First-Outcome
**Definition**: Median days from plan creation to user logging their first completed milestone (interview scheduled, outreach sent, portfolio published, first dollar earned).

**Formula**:
```
Time-to-First-Outcome = Median(Date of First Milestone - Date of Plan Creation)
```

**Target**: ≤14 days (2 weeks) for 50% of users

**Why It Matters**: Measures how quickly users see tangible results. Long times indicate plan difficulty or lack of follow-through.

**Dashboard**: Updated weekly (cohort analysis by plan creation week)

---

### 4. 12-Week Retention
**Definition**: Percentage of users who return to the app at least once during weeks 9–12 after signup.

**Formula**:
```
12-Week Retention = (Users Active in Weeks 9-12 / Total Signups from 12 Weeks Ago) × 100
```

**Target**: ≥30% (MVP), ≥50% (6 months post-launch)

**Why It Matters**: Long-term retention validates product-market fit. Users who stick around are more likely to achieve career/income goals.

**Dashboard**: Updated weekly (cohort-based)

---

### 5. Net Promoter Score (NPS)
**Definition**: Likelihood users would recommend Junielyfe to a friend/colleague (0–10 scale).

**Formula**:
```
NPS = % Promoters (9-10) - % Detractors (0-6)
```

**Target**: ≥40 (good), ≥60 (excellent)

**Survey Timing**:
- 4-week mark (after plan completion or mid-plan)
- 12-week mark (long-term satisfaction)

**Why It Matters**: NPS captures overall user sentiment and word-of-mouth potential. Low NPS indicates dissatisfaction or unmet expectations.

**Dashboard**: Updated weekly (rolling 30-day average)

---

## Analytics Events

### Event Taxonomy
All events follow this naming convention:
```
{category}.{action}
```

Example: `ingest.resume_uploaded`, `plan.task_completed`

### Core Events

#### Authentication & Onboarding
| Event Name | Description | Properties |
|------------|-------------|------------|
| `auth.signup` | User creates account | `method` (email, google, linkedin), `userId`, `timestamp` |
| `auth.login` | User logs in | `method`, `userId`, `timestamp` |
| `auth.logout` | User logs out | `userId`, `timestamp` |

#### Data Ingestion
| Event Name | Description | Properties |
|------------|-------------|------------|
| `ingest.linkedin_connected` | LinkedIn OAuth success | `userId`, `profileUrl`, `timestamp` |
| `ingest.linkedin_skipped` | User skipped LinkedIn | `userId`, `timestamp` |
| `ingest.resume_uploaded` | Résumé uploaded | `userId`, `fileSize`, `format` (pdf, docx), `timestamp` |
| `ingest.resume_parsed` | Résumé parsing complete | `userId`, `parseSuccess` (true/false), `fieldsExtracted` (count), `timestamp` |
| `ingest.resume_skipped` | User skipped résumé | `userId`, `timestamp` |
| `ingest.narrative_saved` | Narrative saved | `userId`, `wordCount`, `timestamp` |
| `ingest.complete` | All ingestion steps done | `userId`, `dataSourcesUsed` (linkedin, resume, narrative), `timestamp` |

#### Goal Setting
| Event Name | Description | Properties |
|------------|-------------|------------|
| `goal.created` | User creates goal | `userId`, `goalId`, `type` (career, financial), `horizon`, `hoursPerWeek`, `timestamp` |
| `goal.edited` | User edits goal | `userId`, `goalId`, `timestamp` |
| `goal.flagged_unrealistic` | Goal flagged as unrealistic | `userId`, `goalId`, `reason`, `timestamp` |

#### Questionnaire
| Event Name | Description | Properties |
|------------|-------------|------------|
| `questionnaire.started` | User starts questionnaire | `userId`, `sessionId`, `templateId` (quick, standard, indepth), `timestamp` |
| `questionnaire.answer_submitted` | Answer submitted | `userId`, `sessionId`, `questionId`, `answerLength`, `timestamp` |
| `questionnaire.tooltip_viewed` | "Why we ask" tooltip viewed | `userId`, `sessionId`, `questionId`, `timestamp` |
| `questionnaire.abandoned` | User exits mid-questionnaire | `userId`, `sessionId`, `questionsCompleted`, `totalQuestions`, `timestamp` |
| `questionnaire.completed` | Questionnaire finished | `userId`, `sessionId`, `totalQuestions`, `durationSeconds`, `timestamp` |

#### Idea Generation
| Event Name | Description | Properties |
|------------|-------------|------------|
| `ideas.generation_started` | Idea generation initiated | `userId`, `sessionId`, `timestamp` |
| `ideas.generation_completed` | Ideas generated successfully | `userId`, `ideaSetId`, `totalIdeas`, `durationSeconds`, `timestamp` |
| `ideas.generation_failed` | Generation failed | `userId`, `sessionId`, `errorCode`, `timestamp` |
| `ideas.viewed` | User views idea details | `userId`, `ideaId`, `timestamp` |
| `ideas.feedback_helpful` | User marks idea helpful | `userId`, `ideaId`, `timestamp` |
| `ideas.feedback_unhelpful` | User marks idea unhelpful | `userId`, `ideaId`, `reason` (optional), `timestamp` |
| `ideas.feedback_inappropriate` | User flags idea as inappropriate | `userId`, `ideaId`, `reason`, `timestamp` |
| `ideas.selected` | User selects ideas for plan | `userId`, `ideaSetId`, `selectedIdeaIds` (array), `count`, `timestamp` |

#### Plan Creation
| Event Name | Description | Properties |
|------------|-------------|------------|
| `plan.generation_started` | Plan generation initiated | `userId`, `ideaSetId`, `selectedIdeaIds`, `timestamp` |
| `plan.generation_completed` | Plan created | `userId`, `planId`, `totalTasks`, `durationSeconds`, `timestamp` |
| `plan.viewed` | User views plan | `userId`, `planId`, `timestamp` |
| `plan.edited` | User edits plan (add/remove tasks) | `userId`, `planId`, `action` (add, remove, reorder), `timestamp` |

#### Task & Progress
| Event Name | Description | Properties |
|------------|-------------|------------|
| `task.started` | User marks task in progress | `userId`, `planId`, `taskId`, `week`, `timestamp` |
| `task.completed` | User marks task complete | `userId`, `planId`, `taskId`, `xpEarned`, `timestamp` |
| `task.uncompleted` | User unmarks task | `userId`, `planId`, `taskId`, `timestamp` |
| `progress.xp_earned` | XP awarded | `userId`, `xpAmount`, `source` (task, checkin), `timestamp` |
| `progress.level_up` | User levels up | `userId`, `newLevel`, `timestamp` |
| `progress.badge_earned` | Badge awarded | `userId`, `badgeId`, `badgeName`, `timestamp` |
| `progress.streak_updated` | Streak incremented | `userId`, `streakCount`, `timestamp` |
| `progress.streak_broken` | Streak reset | `userId`, `previousStreak`, `timestamp` |

#### Artifacts
| Event Name | Description | Properties |
|------------|-------------|------------|
| `artifact.generation_started` | Artifact generation initiated | `userId`, `planId`, `timestamp` |
| `artifact.generation_completed` | All artifacts generated | `userId`, `planId`, `artifactIds` (array), `durationSeconds`, `timestamp` |
| `artifact.viewed` | User views artifact | `userId`, `artifactId`, `type` (resume, linkedin, template, brief, learning), `timestamp` |
| `artifact.edited` | User edits artifact | `userId`, `artifactId`, `newVersion`, `timestamp` |
| `artifact.exported` | User exports artifact | `userId`, `artifactId`, `format` (pdf, docx, json), `timestamp` |
| `artifact.copied` | User copies to clipboard | `userId`, `artifactId`, `timestamp` |

#### Check-Ins & Engagement
| Event Name | Description | Properties |
|------------|-------------|------------|
| `checkin.email_sent` | Weekly check-in email sent | `userId`, `week`, `timestamp` |
| `checkin.email_opened` | Email opened | `userId`, `week`, `timestamp` |
| `checkin.email_clicked` | Email CTA clicked | `userId`, `week`, `ctaType`, `timestamp` |
| `checkin.submitted` | Check-in form submitted | `userId`, `week`, `tasksCompleted`, `winShared` (true/false), `timestamp` |
| `checkin.skipped` | User skips check-in | `userId`, `week`, `timestamp` |

#### Data Control
| Event Name | Description | Properties |
|------------|-------------|------------|
| `export.requested` | User requests data export | `userId`, `format` (json, pdf), `timestamp` |
| `export.completed` | Export ready | `userId`, `format`, `fileSizeKb`, `durationSeconds`, `timestamp` |
| `export.downloaded` | User downloads export | `userId`, `format`, `timestamp` |
| `account.deletion_requested` | User requests account deletion | `userId`, `confirmationText`, `timestamp` |
| `account.deleted` | Account permanently deleted | `userId` (hashed), `timestamp` |

#### Errors & Edge Cases
| Event Name | Description | Properties |
|------------|-------------|------------|
| `error.llm_timeout` | LLM API timeout | `userId`, `endpoint` (ideas, plan, artifacts), `timestamp` |
| `error.llm_rate_limit` | LLM rate limit hit | `userId`, `endpoint`, `timestamp` |
| `error.resume_parse_failed` | Résumé parsing failed | `userId`, `format`, `fileSize`, `timestamp` |
| `error.validation_failed` | Form validation failed | `userId`, `form` (goal, questionnaire), `fieldName`, `timestamp` |

---

## Funnels

### Critical Path Funnel (Activation)
```
Signup → Profile Setup → Goal Created → Questionnaire Started → Questionnaire Completed → Ideas Generated → Idea Selected → Plan Created
```

**Tracked Drop-Off Points**:
1. Signup → Profile Setup (expect <10% drop-off)
2. Profile Setup → Goal Created (expect <15% drop-off)
3. Goal Created → Questionnaire Started (expect <10% drop-off)
4. Questionnaire Started → Completed (expect <20% drop-off; resumption tracked)
5. Ideas Generated → Idea Selected (expect <30% drop-off; 0-selection tracked)
6. Idea Selected → Plan Created (expect <5% drop-off; validation errors tracked)

**Dashboard**: Funnel visualization with conversion rates per step, updated daily

---

### Engagement Funnel (Retention)
```
Plan Created → Week 1 Task Completed → Week 2 Return → Week 4 Check-In → Week 12 Return
```

**Tracked Drop-Off Points**:
1. Plan Created → Week 1 Task Completed (expect <40% drop-off)
2. Week 1 → Week 2 Return (expect <30% drop-off)
3. Week 2 → Week 4 Check-In (expect <20% drop-off)
4. Week 4 → Week 12 Return (expect <40% drop-off)

**Dashboard**: Cohort retention curves (by signup week), updated weekly

---

## Dashboards

### 1. Real-Time Operations Dashboard
**Update Frequency**: Every 5 minutes
**Audience**: Eng, Product

**Widgets**:
- Active users (last 5 min, 1 hour, 24 hours)
- Signups (last 1 hour, today)
- Activation rate (today, 7-day rolling)
- Error rate (LLM timeouts, parsing failures, 5xx errors)
- API response times (P50, P95, P99)
- LLM API usage (requests/hour, tokens/hour, cost estimate)

---

### 2. Product KPI Dashboard
**Update Frequency**: Daily (midnight UTC)
**Audience**: Product, Exec

**Widgets**:
- Activation rate (7-day, 30-day rolling)
- Selection rate (distribution: 0/1/2/3 ideas)
- Time-to-first-outcome (median, P25, P75)
- Retention curves (Week 1, 2, 4, 12 by cohort)
- NPS (30-day rolling, by survey timing)
- Top ideas selected (frequency, avg scores)
- Top drop-off points (funnel analysis)

---

### 3. Engagement & Gamification Dashboard
**Update Frequency**: Daily
**Audience**: Product, Marketing

**Widgets**:
- Tasks completed (total, avg per user)
- XP distribution (histogram)
- Level distribution (users per level)
- Streak distribution (users per streak length)
- Badge distribution (most/least earned)
- Weekly check-in rate (email open, click, submission)

---

### 4. Quality & Trust Dashboard
**Update Frequency**: Daily
**Audience**: Product, Legal

**Widgets**:
- Idea feedback (helpful vs. unhelpful, inappropriate flags)
- Ethical violations (MLM, scams, unlicensed advice flags)
- PII redaction failures (manual audit log)
- Export/deletion requests (pending, completed)
- Security incidents (unauthorized access attempts, rate limit hits)

---

## Privacy & Compliance

### Anonymization
- **Aggregate Analytics**: No `userId` in dashboards; use counts, percentages, medians only
- **Individual Debug**: `userId` accessible only for debugging with explicit user consent + audit log

### No Dark Patterns
- **Prohibited Metrics**: No tracking of "time spent reading cancellation policy", "clicks to unsubscribe", or other manipulative engagement metrics
- **Ethical Tracking**: Only track actions that indicate value delivery (task completion, milestone achievement, NPS)

### Retention Policy
- **Event Logs**: Retained for 90 days (longer for compliance/security incidents)
- **Aggregated KPIs**: Retained indefinitely (no PII)
- **User-Level Data**: Purged within 30 days of account deletion

---

## Implementation Notes

### Tooling (Suggested)
- **Event Collection**: Segment, Mixpanel, or Amplitude (client + server-side tracking)
- **Real-Time Dashboard**: Vercel Analytics, Datadog, or custom (Next.js API + Supabase)
- **Product Analytics**: Mixpanel, Amplitude (funnel analysis, cohort retention)
- **Error Tracking**: Sentry (with user context for debugging)
- **A/B Testing (Future)**: LaunchDarkly, Optimizely (not MVP)

### Event Schema
All events follow this JSON structure:
```json
{
  "event": "plan.task_completed",
  "userId": "usr_abc123",
  "timestamp": "2025-09-29T10:00:00Z",
  "properties": {
    "planId": "plan_mno345",
    "taskId": "task_001",
    "xpEarned": 10
  },
  "context": {
    "userAgent": "Mozilla/5.0...",
    "ip": "203.0.113.0",
    "sessionId": "sess_xyz789"
  }
}
```

### Alerts
- **Critical**: Activation rate <30%, error rate >5%, uptime <99.5%
- **High**: Selection rate <30%, 12-week retention <20%, NPS <20
- **Medium**: LLM timeout rate >2%, résumé parse failure >30%

---

## Success Metrics Summary

| KPI | MVP Target | 6-Month Target |
|-----|------------|----------------|
| **Activation Rate** | ≥40% | ≥60% |
| **Selection Rate** | ≥50% select ≥1 idea | ≥70% select ≥1 idea |
| **Time-to-First-Outcome** | ≤14 days (median) | ≤10 days (median) |
| **12-Week Retention** | ≥30% | ≥50% |
| **NPS** | ≥40 | ≥60 |
| **Weekly Task Completion** | Avg 3 tasks/user/week | Avg 5 tasks/user/week |
| **Idea Feedback (Helpful)** | ≥70% | ≥80% |
| **Ethical Violations** | 0 | 0 |

---

**Compliance**: This metrics document aligns with Junielyfe Constitution v1.0.0, specifically:
- **Principle XXXII**: Core Activation & Retention Metrics (all KPIs defined and tracked)
- **Principle XXXIII**: No Dark Patterns (no manipulative metrics tracked)
- **Principle XIII**: Audit Logs ≤30 Days (event retention policy)
- **Principle XI**: Per-User Data Isolation (anonymized aggregate analytics)