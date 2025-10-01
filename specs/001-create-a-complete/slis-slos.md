# SLIs, SLOs & Error Budget Policy: Junielyfe MVP

**Feature Branch**: `001-create-a-complete`
**Date**: 2025-09-30
**Version**: 1.0.0
**Review Frequency**: Weekly (Milestones 0–2), Daily (Milestone 3 + post-launch)

---

## Executive Summary

This document defines **Service Level Indicators (SLIs)**, **Service Level Objectives (SLOs)**, and the **Error Budget Policy** for Junielyfe MVP. SLIs measure system health; SLOs set target thresholds; error budgets balance reliability with innovation.

**Key SLOs**:
- **Availability**: ≥99.5% uptime (≤3.6 hours downtime/month)
- **Latency (Non-LLM)**: P95 <1.5s for interactive routes
- **Latency (LLM)**: P95 <20s for idea/plan generation (with streaming)
- **Idea Generation Success Rate**: ≥95% (within 20s, no errors)
- **Activation Rate**: ≥40% (signup → plan in first session)

**Error Budget**: 0.5% downtime = **3.6 hours/month**
- **Policy**: If error budget exhausted in any 30-day window, freeze non-critical feature work → focus on reliability improvements until budget restored.

---

## 1. Service Level Indicators (SLIs)

SLIs are **quantitative measures** of service behavior. Each SLI has:
- **Definition**: What we measure
- **Measurement Method**: How we collect data
- **Data Source**: Where data comes from (Vercel Analytics, PostHog, server logs, etc.)

### SLI-001: Availability (Uptime)

**Definition**: Percentage of time the application is available and serving requests successfully.

**Formula**:
```
Availability = (Total Time - Downtime) / Total Time × 100
```

**Success Criteria**: HTTP response codes 200–299 within 30 seconds

**Failure Criteria**: HTTP response codes 500–599 OR timeouts >30s

**Measurement Method**:
- **Uptime Monitoring**: Vercel Analytics (built-in uptime tracking)
- **Synthetic Checks**: External uptime monitoring (e.g., UptimeRobot) pinging `/api/health` every 5 minutes

**Data Source**: Vercel Analytics, UptimeRobot

**Measurement Window**: 30-day rolling window

---

### SLI-002: Latency (Non-LLM Routes)

**Definition**: P95 response time for non-LLM routes (API endpoints, page loads)

**Formula**:
```
P95 Latency = 95th percentile of response times (measured in milliseconds)
```

**Success Criteria**: Response time <1500ms (1.5s)

**Failure Criteria**: Response time ≥1500ms

**Measurement Method**:
- **Real User Monitoring (RUM)**: Vercel Analytics (client-side timing API)
- **Server-Side**: Next.js middleware logs (request start → response sent)

**Data Source**: Vercel Analytics, PostHog (custom events with `durationMs` property)

**Measurement Window**: 7-day rolling window

**Routes Measured**:
- `GET /` (landing page)
- `GET /dashboard` (authenticated home)
- `GET /api/profile`
- `GET /api/goals`
- `GET /api/plans/:id`
- `PATCH /api/tasks/:id/complete`

---

### SLI-003: Latency (LLM Routes - Streaming)

**Definition**: P95 time to first token + P95 total completion time for LLM routes

**Formula**:
```
P95 Time-to-First-Token = 95th percentile of time from request start to first SSE event
P95 Total Completion Time = 95th percentile of time from request start to final SSE event
```

**Success Criteria**:
- Time-to-First-Token <2000ms (2s)
- Total Completion Time <20000ms (20s)

**Failure Criteria**: Time-to-First-Token ≥2s OR Total Completion Time ≥20s

**Measurement Method**:
- **Server-Side**: Custom middleware logs (timestamps: request start, first token, completion)
- **PostHog Events**: `ideas.generation_started`, `ideas.generation_completed` with `durationMs`

**Data Source**: Server logs, PostHog

**Measurement Window**: 7-day rolling window

**Routes Measured**:
- `POST /api/ideas/generate` (idea generation)
- `POST /api/plans/create` (plan generation, background job)
- `POST /api/artifacts/generate` (artifact generation, background job)

---

### SLI-004: Idea Generation Success Rate

**Definition**: Percentage of idea generation requests that complete successfully within 20s

**Formula**:
```
Success Rate = (Successful Requests / Total Requests) × 100
```

**Success Criteria**: Idea generation completes within 20s, returns 8–12 ideas, no errors

**Failure Criteria**: Timeout (>20s), LLM API error, <8 ideas returned, ethical filter blocks all ideas

**Measurement Method**:
- **PostHog Events**: `ideas.generation_completed` (success), `ideas.generation_failed` (failure)
- **Server Logs**: Error tracking (Sentry optional)

**Data Source**: PostHog, server logs

**Measurement Window**: 7-day rolling window

---

### SLI-005: Activation Rate (Business Metric)

**Definition**: Percentage of signups who complete the critical path (signup → plan creation) within first session

**Formula**:
```
Activation Rate = (Users with Plan Created in Session 1 / Total Signups) × 100
```

**Success Criteria**: User completes: signup → profile → goal → questionnaire → ideas → plan selection → plan created

**Failure Criteria**: User abandons at any step before plan creation

**Measurement Method**:
- **PostHog Funnel**: Funnel analysis with events (`auth.signup`, `ingest.complete`, `goal.created`, `questionnaire.completed`, `ideas.generated`, `ideas.selected`, `plan.created`)
- **Session Definition**: Single session = events within 60-minute window without >10-minute gap

**Data Source**: PostHog

**Measurement Window**: 7-day rolling window (cohort analysis)

---

### SLI-006: Selection Rate (Business Metric)

**Definition**: Average number of ideas selected per user when presented with 8–12 ideas

**Formula**:
```
Selection Rate = Total Ideas Selected / Total Users Who Viewed Ideas
```

**Success Criteria**: Average 1.5–2.5 ideas selected; ≥50% of users select ≥1 idea

**Failure Criteria**: Average <1.5 ideas OR <50% select ≥1 idea

**Measurement Method**:
- **PostHog Events**: `ideas.generated` (ideaCount), `ideas.selected` (selectedCount)
- **Aggregation**: Daily batch job computes distribution (0/1/2/3 ideas selected)

**Data Source**: PostHog

**Measurement Window**: 7-day rolling window

---

### SLI-007: Time-to-First-Outcome (Business Metric)

**Definition**: Median days from plan creation to user logging first completed milestone (interview, outreach, portfolio, first dollar)

**Formula**:
```
Time-to-First-Outcome = Median(Date of First Milestone - Date of Plan Creation)
```

**Success Criteria**: ≤14 days (2 weeks) for 50% of users

**Failure Criteria**: >14 days for 50% of users

**Measurement Method**:
- **PostHog Events**: `plan.created` (timestamp), `task.completed` (timestamp + milestone flag)
- **Cohort Analysis**: Group users by plan creation week → track first milestone

**Data Source**: PostHog

**Measurement Window**: Cohort-based (tracked for 12 weeks post-plan creation)

---

### SLI-008: 12-Week Retention (Business Metric)

**Definition**: Percentage of users who return to the app at least once during weeks 9–12 after signup

**Formula**:
```
12-Week Retention = (Users Active in Weeks 9-12 / Total Signups from 12 Weeks Ago) × 100
```

**Success Criteria**: ≥30% (MVP), ≥50% (6 months post-launch)

**Failure Criteria**: <30%

**Measurement Method**:
- **PostHog Events**: `auth.login` OR any activity event (task completion, artifact view)
- **Cohort Analysis**: Group users by signup week → track return in weeks 9–12

**Data Source**: PostHog

**Measurement Window**: Cohort-based (12 weeks per cohort)

---

### SLI-009: Net Promoter Score (NPS)

**Definition**: Likelihood users would recommend Junielyfe to a friend/colleague (0–10 scale)

**Formula**:
```
NPS = % Promoters (9-10) - % Detractors (0-6)
```

**Success Criteria**: NPS ≥40 (good), ≥60 (excellent)

**Failure Criteria**: NPS <40

**Measurement Method**:
- **In-App Survey**: PostHog survey widget at 4-week and 12-week marks
- **Survey Question**: "How likely are you to recommend Junielyfe to a friend or colleague? (0–10)"

**Data Source**: PostHog

**Measurement Window**: 30-day rolling window

---

## 2. Service Level Objectives (SLOs)

SLOs are **target thresholds** for SLIs. Each SLO defines:
- **Target**: What we commit to achieving
- **Measurement Window**: Time period for evaluation
- **Consequences**: What happens if SLO is missed

### SLO-001: Availability ≥99.5%

**SLI**: SLI-001 (Availability)

**Target**: ≥99.5% uptime (≤3.6 hours downtime per 30 days)

**Measurement Window**: 30-day rolling window

**Exclusions**:
- Planned maintenance (announced ≥48 hours in advance)
- User errors (4xx response codes)
- DDoS attacks (beyond reasonable mitigation)

**Consequences if Missed**:
- **<99.5%**: Error budget exhausted → freeze non-critical feature work
- **<99.0%**: Emergency incident response → root cause analysis → post-mortem

**Dashboard**: Vercel Analytics (uptime %), UptimeRobot dashboard

**Alert Threshold**: <99.5% over 24-hour window

---

### SLO-002: Latency (Non-LLM) P95 <1.5s

**SLI**: SLI-002 (Latency - Non-LLM Routes)

**Target**: P95 response time <1500ms for non-LLM routes

**Measurement Window**: 7-day rolling window

**Routes Covered**: All non-LLM routes (landing, dashboard, API endpoints)

**Consequences if Missed**:
- **P95 1.5–2.5s**: Warning → investigate slow queries, optimize bundle size
- **P95 >2.5s**: Critical → freeze feature work, focus on performance optimization

**Dashboard**: Vercel Analytics (P95 latency), PostHog custom dashboard

**Alert Threshold**: P95 >2.0s over 24-hour window

---

### SLO-003: Latency (LLM) First Token <2s, Total <20s

**SLI**: SLI-003 (Latency - LLM Routes)

**Target**:
- Time-to-First-Token <2s (P95)
- Total Completion Time <20s (P95)

**Measurement Window**: 7-day rolling window

**Routes Covered**: Idea generation, plan generation (background job), artifact generation (background job)

**Consequences if Missed**:
- **First Token 2–5s**: Warning → investigate LLM API latency, optimize prompts
- **First Token >5s**: Critical → switch to faster model (GPT-4o mini), reduce prompt size
- **Total >20s**: Warning → enable caching, reduce output size
- **Total >30s**: Critical → reduce idea count (12 → 6), timeout after 30s

**Dashboard**: PostHog custom dashboard (LLM latency distribution)

**Alert Threshold**: P95 first token >3s OR P95 total >25s over 24-hour window

---

### SLO-004: Idea Generation Success Rate ≥95%

**SLI**: SLI-004 (Idea Generation Success Rate)

**Target**: ≥95% of idea generation requests succeed within 20s

**Measurement Window**: 7-day rolling window

**Success Definition**: Returns 8–12 ideas, no errors, completes <20s

**Consequences if Missed**:
- **90–95%**: Warning → investigate LLM API errors, ethical filter false positives
- **<90%**: Critical → freeze idea generation feature, manual curation fallback

**Dashboard**: PostHog custom dashboard (success rate %, error breakdown)

**Alert Threshold**: Success rate <90% over 24-hour window

---

### SLO-005: Activation Rate ≥40%

**SLI**: SLI-005 (Activation Rate)

**Target**: ≥40% of signups complete critical path (signup → plan) in first session

**Measurement Window**: 7-day rolling window (cohort analysis)

**Consequences if Missed**:
- **30–40%**: Warning → funnel analysis, identify drop-off points
- **<30%**: Critical → simplify onboarding (reduce questionnaire to 3 questions, pre-generate sample ideas)

**Dashboard**: PostHog funnel dashboard (signup → plan conversion)

**Alert Threshold**: Activation rate <35% over 7-day window

---

### SLO-006: Selection Rate ≥50% (≥1 Idea)

**SLI**: SLI-006 (Selection Rate)

**Target**: ≥50% of users select ≥1 idea (average 1.5–2.5 ideas)

**Measurement Window**: 7-day rolling window

**Consequences if Missed**:
- **40–50%**: Warning → review idea quality, improve "Why this fits" explanations
- **<40%**: Critical → manual review of 100 idea sets, improve prompt engineering

**Dashboard**: PostHog custom dashboard (selection rate distribution: 0/1/2/3 ideas)

**Alert Threshold**: Selection rate <45% over 7-day window

---

### SLO-007: Time-to-First-Outcome ≤14 Days (Median)

**SLI**: SLI-007 (Time-to-First-Outcome)

**Target**: ≤14 days median for 50% of users

**Measurement Window**: Cohort-based (tracked for 12 weeks post-plan creation)

**Consequences if Missed**:
- **14–21 days**: Warning → review plan complexity, add more actionable tasks
- **>21 days**: Critical → simplify plans (reduce task count, shorten duration)

**Dashboard**: PostHog cohort dashboard (time-to-first-outcome by cohort)

**Alert Threshold**: Median >17 days for latest cohort

---

### SLO-008: 12-Week Retention ≥30%

**SLI**: SLI-008 (12-Week Retention)

**Target**: ≥30% (MVP), ≥50% (6 months post-launch)

**Measurement Window**: Cohort-based (12 weeks per cohort)

**Consequences if Missed**:
- **20–30%**: Warning → improve gamification, add push notifications
- **<20%**: Critical → revisit product-market fit, user interviews

**Dashboard**: PostHog cohort dashboard (retention curves by signup week)

**Alert Threshold**: <25% for latest cohort reaching 12 weeks

---

### SLO-009: NPS ≥40

**SLI**: SLI-009 (Net Promoter Score)

**Target**: NPS ≥40 (good), ≥60 (excellent)

**Measurement Window**: 30-day rolling window

**Consequences if Missed**:
- **30–40**: Warning → collect qualitative feedback, identify pain points
- **<30**: Critical → user interviews, prioritize top complaints

**Dashboard**: PostHog custom dashboard (NPS score, promoter/detractor distribution)

**Alert Threshold**: NPS <35 over 30-day window

---

## 3. Error Budget Policy

### Error Budget Definition

**Error Budget** = **1 - SLO** = Maximum allowed downtime or failures

**Example**: SLO-001 (Availability ≥99.5%) → Error Budget = 0.5% = **3.6 hours downtime per 30 days**

### Error Budget Tracking

**Tracking Method**:
- **Real-Time Dashboard**: Vercel Analytics + PostHog custom dashboard
- **Daily Review**: Product + Eng Leads review error budget consumption
- **Weekly Report**: Error budget status shared with team

**Formula**:
```
Error Budget Remaining = Target Downtime - Actual Downtime
```

**Example Calculation**:
- Target: 99.5% uptime → 0.5% downtime = 3.6 hours/month
- Actual: 99.7% uptime → 0.3% downtime = 2.2 hours/month
- Error Budget Remaining: 3.6 - 2.2 = **1.4 hours** (39% remaining)

### Error Budget Exhaustion Policy

**If Error Budget Exhausted** (0 hours remaining in 30-day window):

1. **Immediate Actions**:
   - **Freeze Non-Critical Feature Work**: No new features, no major refactors, no experiments
   - **Focus on Reliability**: Prioritize bug fixes, performance optimizations, monitoring improvements
   - **Emergency Incident Response**: Root cause analysis, post-mortem, action items

2. **Restoration Criteria**:
   - **Error Budget Restored**: When uptime returns to ≥99.5% over 7-day rolling window
   - **Post-Mortem Complete**: Document root cause, prevention strategies, lessons learned

3. **Feature Work Resumption**:
   - **After Restoration**: Resume feature work once error budget >20% remaining
   - **Gradual Rollout**: Use canary releases (10% traffic) for first feature after incident

### Error Budget Allocation (by SLO)

| SLO | Target | Error Budget | Max Failures per Month |
|-----|--------|--------------|------------------------|
| **SLO-001: Availability** | ≥99.5% | 0.5% downtime | 3.6 hours downtime |
| **SLO-002: Latency (Non-LLM)** | P95 <1.5s | 5% slow requests | ~360 slow requests (if 7200 total) |
| **SLO-003: Latency (LLM)** | P95 <20s | 5% slow requests | ~50 slow requests (if 1000 total) |
| **SLO-004: Idea Gen Success** | ≥95% | 5% failures | ~50 failures (if 1000 total) |
| **SLO-005: Activation Rate** | ≥40% | 60% drop-off | Acceptable if ≥40% convert |
| **SLO-006: Selection Rate** | ≥50% select ≥1 | 50% select 0 | Acceptable if ≥50% convert |
| **SLO-007: Time-to-Outcome** | ≤14 days | 50% take >14 days | Acceptable if median ≤14 days |
| **SLO-008: 12-Week Retention** | ≥30% | 70% churn | Acceptable if ≥30% retain |
| **SLO-009: NPS** | ≥40 | Score 0–39 | Acceptable if NPS ≥40 |

---

## 4. Dashboards & Alerts

### Dashboard 1: Real-Time Operations (PostHog + Vercel)

**Update Frequency**: Every 5 minutes

**Widgets**:
- **Availability**: Uptime % (last 24h, 7d, 30d)
- **Error Budget**: Remaining hours (availability, latency, success rate)
- **Latency**: P95 non-LLM (last 1h, 24h, 7d)
- **Latency**: P95 LLM first token, total (last 1h, 24h, 7d)
- **Success Rate**: Idea generation success % (last 1h, 24h, 7d)
- **Active Users**: Last 5 min, 1 hour, 24 hours
- **Error Rate**: 5xx errors (last 1h, 24h)

**Access**: Product Lead, Eng Lead, On-call Engineer

---

### Dashboard 2: Product KPIs (PostHog)

**Update Frequency**: Daily (midnight UTC)

**Widgets**:
- **Activation Rate**: 7-day, 30-day rolling (funnel visualization)
- **Selection Rate**: Distribution (0/1/2/3 ideas), average
- **Time-to-First-Outcome**: Median, P25, P75 (cohort curves)
- **12-Week Retention**: Cohort retention curves (by signup week)
- **NPS**: 30-day rolling, promoter/detractor distribution

**Access**: Product Lead, Eng Lead, Exec Team

---

### Dashboard 3: Error Budget Tracking (Custom)

**Update Frequency**: Real-time

**Widgets**:
- **SLO-001 (Availability)**: Error budget remaining (hours), uptime % (30-day)
- **SLO-002 (Latency Non-LLM)**: Error budget remaining (%), P95 latency (7-day)
- **SLO-003 (Latency LLM)**: Error budget remaining (%), P95 first token, total (7-day)
- **SLO-004 (Idea Gen Success)**: Error budget remaining (%), success rate (7-day)
- **SLO-005–009 (Business Metrics)**: Target vs actual (7-day rolling)

**Access**: Product Lead, Eng Lead

---

### Alerts Configuration

#### Critical Alerts (PagerDuty/Slack — Page On-Call)

| Alert | Condition | Threshold | Action |
|-------|-----------|-----------|--------|
| **Availability <99.5%** | Uptime drops below 99.5% | 5-minute window | Page on-call, incident response |
| **Error Rate >5%** | 5xx error rate >5% | 5-minute window | Page on-call, investigate errors |
| **LLM Timeout Rate >10%** | Idea gen timeout rate >10% | 15-minute window | Page on-call, check OpenAI status |
| **Cross-User Access Detected** | RLS integration test fails | Immediate | Page on-call, disable endpoint, audit logs |

#### High Alerts (Slack)

| Alert | Condition | Threshold | Action |
|-------|-----------|-----------|--------|
| **P95 Latency >2.5s (Non-LLM)** | P95 >2.5s for 24h | 24-hour window | Investigate slow queries, optimize bundle |
| **LLM First Token >5s** | P95 first token >5s for 24h | 24-hour window | Check OpenAI latency, optimize prompts |
| **Idea Gen Success Rate <90%** | Success rate <90% for 24h | 24-hour window | Investigate LLM errors, ethical filter |
| **Activation Rate <35%** | Activation <35% for 7d | 7-day window | Funnel analysis, identify drop-off |
| **OpenAI Cost >$100/day** | Daily cost exceeds $100 | Daily | Enable stricter rate limiting, investigate outliers |

#### Medium Alerts (Email)

| Alert | Condition | Threshold | Action |
|-------|-----------|-----------|--------|
| **Weekly Active Users Down 20% WoW** | WAU drops 20% week-over-week | Weekly | Review engagement metrics, user feedback |
| **NPS <30** | NPS drops below 30 | 30-day rolling | User interviews, prioritize top complaints |
| **Selection Rate <45%** | Selection rate <45% for 7d | 7-day window | Review idea quality, improve explanations |

---

## 5. SLO Review & Iteration

### Weekly SLO Review (Milestones 0–2)

**Attendees**: Product Lead, Eng Lead

**Agenda**:
1. Review SLI dashboards (availability, latency, success rates)
2. Check error budget consumption (any SLOs at risk?)
3. Review business metrics (activation, selection, retention)
4. Identify trends, anomalies, incidents
5. Update SLOs if needed (adjust thresholds based on actual data)

**Outcome**: Action items for next week (optimizations, bug fixes, experiments)

---

### Daily SLO Review (Milestone 3 + Post-Launch)

**Attendees**: Product Lead, Eng Lead, On-call Engineer

**Agenda**:
1. Review Real-Time Operations dashboard
2. Check error budget status (any alerts triggered?)
3. Review incidents from last 24h (root cause, resolution)
4. Preview upcoming risks (planned deployments, expected traffic spikes)

**Outcome**: Go/no-go for deployments, incident follow-ups

---

### Quarterly SLO Adjustment

**Process**:
1. Analyze 90 days of SLI data (P50, P95, P99 distributions)
2. Compare SLOs to industry benchmarks (e.g., 99.9% for SaaS, P95 <1s for web apps)
3. Adjust SLO targets based on:
   - **Actual Performance**: If consistently exceeding SLO, tighten target
   - **User Expectations**: If users complain about latency/downtime, tighten target
   - **Business Goals**: If prioritizing innovation over stability, relax target slightly
4. Document changes in ADR (Architecture Decision Record)
5. Communicate new SLOs to team

**Example Adjustment**:
- **Current**: SLO-002 (Latency Non-LLM) P95 <1.5s
- **Actual**: P95 = 800ms (well below target)
- **Adjustment**: Tighten to P95 <1.0s (1 second) → frees up error budget for innovation

---

## 6. Baseline Measurements (Pre-Launch)

**Purpose**: Establish baseline SLI values before launch to set realistic SLOs

**Method**:
1. **Synthetic Testing** (Lighthouse, WebPageTest):
   - Landing page: FCP, LCP, CLS, FID
   - Dashboard: Load time, interactivity
2. **Load Testing** (Artillery, k6):
   - Simulate 100 concurrent users
   - Measure P50, P95, P99 latency for API endpoints
3. **LLM Testing** (10 sample profiles):
   - Measure time-to-first-token, total completion time
   - Record success rate, error types
4. **Manual Testing** (10 test users):
   - Measure activation rate, selection rate
   - Record drop-off points, user feedback

**Baseline Results** (Expected):
- **Availability**: 99.9% (synthetic checks, no real traffic)
- **Latency (Non-LLM)**: P95 = 800ms (landing), 500ms (API)
- **Latency (LLM)**: P95 first token = 1.5s, total = 15s
- **Idea Gen Success**: 100% (10/10 tests succeed)
- **Activation Rate**: 60% (6/10 test users complete flow)
- **Selection Rate**: 70% (7/10 select ≥1 idea)

**Post-Launch Comparison**: Compare actual SLI values to baseline → adjust SLOs if baseline was off

---

## 7. SLO Compliance Report (Monthly)

**Format**: PDF report sent to Product Lead, Eng Lead, Exec Team

**Contents**:
1. **Executive Summary**: SLO compliance status (green/yellow/red), key trends
2. **SLI Values**: Table of all SLIs with target, actual, delta
3. **Error Budget**: Table of error budget consumption by SLO
4. **Incidents**: List of incidents (downtime, latency spikes, failures)
5. **Action Items**: Prioritized list of improvements (performance, reliability)
6. **Recommendations**: Adjust SLOs, invest in infrastructure, refactor code

**Example Report** (Month 1 Post-Launch):
```
SLO Compliance Report: Junielyfe MVP
Month: October 2025
Status: GREEN (all SLOs met)

SLI Values:
| SLO | Target | Actual | Delta | Status |
|-----|--------|--------|-------|--------|
| Availability | ≥99.5% | 99.8% | +0.3% | ✅ GREEN |
| Latency (Non-LLM) | P95 <1.5s | 1.2s | -0.3s | ✅ GREEN |
| Latency (LLM) | P95 <20s | 18s | -2s | ✅ GREEN |
| Idea Gen Success | ≥95% | 97% | +2% | ✅ GREEN |
| Activation Rate | ≥40% | 42% | +2% | ✅ GREEN |
| Selection Rate | ≥50% | 55% | +5% | ✅ GREEN |

Error Budget Consumption:
| SLO | Budget | Consumed | Remaining | Status |
|-----|--------|----------|-----------|--------|
| Availability | 3.6h | 1.4h | 2.2h (61%) | ✅ GREEN |
| Latency (Non-LLM) | 5% | 2% | 3% (60%) | ✅ GREEN |
| Latency (LLM) | 5% | 3% | 2% (40%) | ⚠️ YELLOW |
| Idea Gen Success | 5% | 1% | 4% (80%) | ✅ GREEN |

Incidents:
- Oct 15: LLM timeout spike (20 min) → OpenAI API degradation → resolved
- Oct 22: Database connection pool exhaustion (5 min) → upgraded Supabase plan

Action Items:
1. Optimize LLM prompts to reduce token count (reduce latency)
2. Add Redis caching layer for frequently queried data
3. Implement canary releases for major deployments

Recommendations:
- Tighten Latency (Non-LLM) SLO to P95 <1.0s (current: 1.2s, well below target)
- Invest in LLM fallback (Claude 3.5 Haiku) for OpenAI outages
```

---

## Appendix A: SLI/SLO Definitions Table

| ID | SLI Name | Definition | Target SLO | Measurement Window | Data Source |
|----|----------|------------|------------|-------------------|-------------|
| **SLI-001** | Availability | % uptime (200–299 responses) | ≥99.5% | 30-day rolling | Vercel, UptimeRobot |
| **SLI-002** | Latency (Non-LLM) | P95 response time | <1.5s | 7-day rolling | Vercel, PostHog |
| **SLI-003** | Latency (LLM) | P95 first token, total | <2s, <20s | 7-day rolling | Server logs, PostHog |
| **SLI-004** | Idea Gen Success | % requests succeed <20s | ≥95% | 7-day rolling | PostHog, logs |
| **SLI-005** | Activation Rate | % signup → plan (session 1) | ≥40% | 7-day cohort | PostHog funnel |
| **SLI-006** | Selection Rate | Avg ideas selected | ≥50% select ≥1 | 7-day rolling | PostHog |
| **SLI-007** | Time-to-Outcome | Median days to milestone | ≤14 days | Cohort (12 weeks) | PostHog |
| **SLI-008** | 12-Week Retention | % active weeks 9–12 | ≥30% | Cohort (12 weeks) | PostHog |
| **SLI-009** | NPS | Promoters - Detractors | ≥40 | 30-day rolling | PostHog survey |

---

**Document Owner**: Eng Lead
**Last Updated**: 2025-09-30
**Next Review**: Week 1 (Milestone 0 completion)