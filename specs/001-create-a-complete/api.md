# API Specification: Junielyfe MVP

**Feature**: Junielyfe Career & Finance Copilot
**Branch**: `001-create-a-complete`
**Date**: 2025-09-29

---

## API Design Principles

1. **RESTful**: Resources are nouns, actions are HTTP verbs
2. **JSON**: All request/response bodies are JSON (except file uploads: multipart/form-data)
3. **Authentication**: Bearer token (JWT) in `Authorization` header
4. **Versioning**: `/api/v1/` prefix for all endpoints (future-proof)
5. **Error Format**: Consistent error response structure
6. **Rate Limiting**: 100 req/min per user (authenticated), 20 req/min per IP (anonymous)
7. **CORS**: Allow configured frontend origins only

---

## Authentication

### POST `/api/v1/auth/register`
**Description**: Register a new user account

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "consent": {
    "termsAccepted": true,
    "privacyAccepted": true
  }
}
```

**Response** (201 Created):
```json
{
  "user": {
    "id": "usr_abc123",
    "email": "user@example.com",
    "createdAt": "2025-09-29T10:00:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors**:
- `400 Bad Request`: Invalid email format, weak password, missing consent
- `409 Conflict`: Email already registered

---

### POST `/api/v1/auth/login`
**Description**: Login with email/password

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response** (200 OK):
```json
{
  "user": {
    "id": "usr_abc123",
    "email": "user@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors**:
- `401 Unauthorized`: Invalid credentials
- `429 Too Many Requests`: Rate limit exceeded (5 failed attempts in 15 min)

---

### POST `/api/v1/auth/oauth/linkedin`
**Description**: OAuth login/register via LinkedIn

**Request Body**:
```json
{
  "code": "linkedin_auth_code",
  "redirectUri": "https://app.junielyfe.com/auth/callback"
}
```

**Response** (200 OK):
```json
{
  "user": {
    "id": "usr_abc123",
    "email": "user@example.com",
    "linkedinProfileUrl": "https://linkedin.com/in/username"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "isNewUser": false
}
```

**Errors**:
- `400 Bad Request`: Invalid authorization code
- `500 Internal Server Error`: LinkedIn API error

---

## Profile & Data Ingestion

### POST `/api/v1/profile/resume`
**Description**: Upload and parse résumé

**Request**: `multipart/form-data`
- `file`: PDF or DOCX (max 5MB)
- `consent`: `true` (required)

**Response** (200 OK):
```json
{
  "profileId": "prof_xyz789",
  "parsed": {
    "roles": [
      {"title": "Senior Analyst", "company": "ACME Corp", "startDate": "2020-01", "endDate": "2023-12"}
    ],
    "skills": ["Data Analysis", "SQL", "Python", "Excel"],
    "education": [
      {"degree": "BS Computer Science", "institution": "State University", "year": 2019}
    ],
    "experience": {
      "yearsTotal": 8,
      "industries": ["Finance", "Public Sector"]
    }
  },
  "editable": true
}
```

**Errors**:
- `400 Bad Request`: Unsupported format, file too large, missing consent
- `422 Unprocessable Entity`: Parsing failed (unclear résumé structure)

---

### PUT `/api/v1/profile`
**Description**: Update profile data (after parsing or manual entry)

**Request Body**:
```json
{
  "roles": [...],
  "skills": ["Data Analysis", "SQL", "Python"],
  "education": [...],
  "narrative": "I'm a 32-year-old law enforcement officer...",
  "linkedinProfileUrl": "https://linkedin.com/in/username"
}
```

**Response** (200 OK):
```json
{
  "profileId": "prof_xyz789",
  "updatedAt": "2025-09-29T10:15:00Z"
}
```

**Errors**:
- `400 Bad Request`: Narrative too short (<200 words) or too long (>2000 words)
- `404 Not Found`: Profile not found

---

### GET `/api/v1/profile`
**Description**: Retrieve current user's profile

**Response** (200 OK):
```json
{
  "profileId": "prof_xyz789",
  "roles": [...],
  "skills": [...],
  "education": [...],
  "narrative": "...",
  "linkedinProfileUrl": "https://linkedin.com/in/username",
  "createdAt": "2025-09-29T10:00:00Z",
  "updatedAt": "2025-09-29T10:15:00Z"
}
```

---

## Goals

### POST `/api/v1/goals`
**Description**: Create a new goal

**Request Body**:
```json
{
  "type": "career",
  "target": "Transition to remote fraud analyst role",
  "horizon": "6 months",
  "constraints": {
    "hoursPerWeek": 10,
    "riskTolerance": "low",
    "remoteOnly": true,
    "budget": 500,
    "ethicalExclusions": ["MLM", "gambling"],
    "industryExclusions": ["tobacco", "weapons"]
  }
}
```

**Response** (201 Created):
```json
{
  "goalId": "goal_def456",
  "type": "career",
  "target": "Transition to remote fraud analyst role",
  "horizon": "6 months",
  "constraints": {...},
  "createdAt": "2025-09-29T10:20:00Z"
}
```

**Errors**:
- `400 Bad Request`: Vague target (e.g., "be successful"), missing required fields

---

### GET `/api/v1/goals`
**Description**: List user's goals (ordered by most recent)

**Response** (200 OK):
```json
{
  "goals": [
    {
      "goalId": "goal_def456",
      "type": "career",
      "target": "...",
      "horizon": "6 months",
      "constraints": {...},
      "createdAt": "2025-09-29T10:20:00Z"
    }
  ]
}
```

---

## Questionnaires

### GET `/api/v1/questionnaires/templates`
**Description**: Get available questionnaire templates (5/10/20 questions)

**Response** (200 OK):
```json
{
  "templates": [
    {
      "templateId": "tmpl_quick",
      "depth": 5,
      "estimatedMinutes": 2,
      "description": "Quick assessment"
    },
    {
      "templateId": "tmpl_standard",
      "depth": 10,
      "estimatedMinutes": 5,
      "description": "Standard assessment (recommended)"
    },
    {
      "templateId": "tmpl_indepth",
      "depth": 20,
      "estimatedMinutes": 10,
      "description": "Comprehensive assessment"
    }
  ]
}
```

---

### POST `/api/v1/questionnaires`
**Description**: Start a new questionnaire session

**Request Body**:
```json
{
  "templateId": "tmpl_standard",
  "goalId": "goal_def456"
}
```

**Response** (201 Created):
```json
{
  "sessionId": "qsn_session_ghi789",
  "templateId": "tmpl_standard",
  "totalQuestions": 10,
  "currentQuestion": 1,
  "question": {
    "questionId": "q_001",
    "text": "What industries are you most interested in?",
    "type": "multi-select",
    "options": ["Technology", "Healthcare", "Finance", "Education", "Other"],
    "whyWeAsk": "This helps us identify roles with strong market demand in your preferred sectors."
  }
}
```

---

### POST `/api/v1/questionnaires/{sessionId}/answers`
**Description**: Submit an answer and get next question (adaptive logic)

**Request Body**:
```json
{
  "questionId": "q_001",
  "answer": ["Technology", "Finance"]
}
```

**Response** (200 OK):
```json
{
  "sessionId": "qsn_session_ghi789",
  "currentQuestion": 2,
  "totalQuestions": 10,
  "question": {
    "questionId": "q_002",
    "text": "How comfortable are you learning new technical skills?",
    "type": "select",
    "options": ["Very comfortable", "Somewhat comfortable", "Neutral", "Uncomfortable"],
    "whyWeAsk": "We'll prioritize ideas that match your learning style and appetite for upskilling."
  },
  "isComplete": false
}
```

**Response** (200 OK, final question):
```json
{
  "sessionId": "qsn_session_ghi789",
  "currentQuestion": 10,
  "totalQuestions": 10,
  "isComplete": true,
  "message": "Questionnaire complete! Ready to generate ideas."
}
```

**Errors**:
- `404 Not Found`: Session not found
- `400 Bad Request`: Invalid answer format

---

## Ideas

### POST `/api/v1/ideas/generate`
**Description**: Generate personalized ideas based on profile, goal, and questionnaire

**Request Body**:
```json
{
  "sessionId": "qsn_session_ghi789"
}
```

**Response** (200 OK, streaming recommended via SSE):
```json
{
  "ideaSetId": "ideas_jkl012",
  "ideas": [
    {
      "ideaId": "idea_001",
      "title": "Fraud Analyst (Remote)",
      "category": "employee",
      "scores": {
        "fit": 85,
        "market": 78,
        "speed": 70,
        "risk": 30
      },
      "whyThisFits": "Your 8 years in law enforcement have built strong investigative and analytical skills. BLS projects 18% growth in fraud analyst roles through 2030, with median salary $85k. Your preference for remote work aligns with 60% of fraud analyst positions being remote-eligible.",
      "firstSteps": [
        "Update résumé to emphasize investigative and analytical skills",
        "Complete Coursera's 'Fraud Detection & Prevention' course (free, 4 weeks)",
        "Reach out to 3 fraud analysts on LinkedIn for informational interviews"
      ],
      "sources": ["BLS.gov Occupational Outlook", "LinkedIn Economic Graph"]
    },
    {
      "ideaId": "idea_002",
      "title": "Compliance Consulting (Freelance)",
      "category": "freelance",
      "scores": {
        "fit": 80,
        "market": 72,
        "speed": 85,
        "risk": 45
      },
      "whyThisFits": "Public sector experience positions you well for compliance consulting, especially for clients in regulated industries. Freelance allows flexible hours (fits your 10 hrs/week constraint) and low startup costs.",
      "firstSteps": [
        "Create LinkedIn profile highlighting compliance and regulatory knowledge",
        "Join 2 freelance platforms (Upwork, Toptal) and complete profile",
        "Prepare 3 case studies from past public sector work (anonymized)"
      ],
      "sources": ["Upwork 2024 Freelance Trends Report"]
    }
  ],
  "totalIdeas": 10,
  "generatedAt": "2025-09-29T10:30:00Z",
  "cacheExpiry": "2025-10-06T10:30:00Z"
}
```

**Errors**:
- `400 Bad Request`: Questionnaire session incomplete
- `500 Internal Server Error`: LLM generation failed (with retry guidance)
- `503 Service Unavailable`: LLM rate limit exceeded

---

### GET `/api/v1/ideas/{ideaSetId}`
**Description**: Retrieve cached idea set

**Response** (200 OK):
```json
{
  "ideaSetId": "ideas_jkl012",
  "ideas": [...],
  "generatedAt": "2025-09-29T10:30:00Z",
  "cacheExpiry": "2025-10-06T10:30:00Z"
}
```

---

## Plans

### POST `/api/v1/plans`
**Description**: Generate a 4-week plan from selected ideas

**Request Body**:
```json
{
  "ideaSetId": "ideas_jkl012",
  "selectedIdeaIds": ["idea_001", "idea_002"]
}
```

**Response** (201 Created):
```json
{
  "planId": "plan_mno345",
  "duration": "4 weeks",
  "tasks": [
    {
      "taskId": "task_001",
      "title": "Update résumé to emphasize investigative skills",
      "description": "Rewrite résumé bullets to highlight analytical thinking, pattern recognition, and case investigation experience.",
      "week": 1,
      "estimatedHours": 2,
      "xpValue": 10,
      "resources": [
        {"title": "Résumé Writing for Career Changers", "url": "https://example.com/guide"}
      ],
      "status": "pending"
    }
  ],
  "totalTasks": 15,
  "weeklyMilestones": [
    {"week": 1, "milestone": "Résumé updated and reviewed by 2 peers"},
    {"week": 2, "milestone": "5 outreach messages sent; 1 informational interview scheduled"},
    {"week": 3, "milestone": "Fraud detection course 50% complete; LinkedIn profile optimized"},
    {"week": 4, "milestone": "2 job applications submitted; portfolio brief drafted"}
  ],
  "createdAt": "2025-09-29T10:35:00Z"
}
```

**Errors**:
- `400 Bad Request`: 0 or >3 ideas selected
- `404 Not Found`: Idea set not found

---

### GET `/api/v1/plans/{planId}`
**Description**: Retrieve a plan with current status

**Response** (200 OK):
```json
{
  "planId": "plan_mno345",
  "duration": "4 weeks",
  "tasks": [...],
  "totalTasks": 15,
  "completedTasks": 3,
  "weeklyMilestones": [...],
  "createdAt": "2025-09-29T10:35:00Z",
  "lastUpdatedAt": "2025-09-30T08:00:00Z"
}
```

---

### PATCH `/api/v1/plans/{planId}/tasks/{taskId}`
**Description**: Update task status (mark complete, edit, etc.)

**Request Body**:
```json
{
  "status": "completed"
}
```

**Response** (200 OK):
```json
{
  "taskId": "task_001",
  "status": "completed",
  "completedAt": "2025-09-30T08:00:00Z",
  "xpEarned": 10
}
```

**Errors**:
- `404 Not Found`: Task or plan not found
- `400 Bad Request`: Invalid status

---

## Artifacts

### POST `/api/v1/artifacts/generate`
**Description**: Generate artifacts for a plan

**Request Body**:
```json
{
  "planId": "plan_mno345"
}
```

**Response** (201 Created):
```json
{
  "artifacts": [
    {
      "artifactId": "art_resume_001",
      "type": "resume",
      "title": "Rewritten Résumé",
      "content": "...",
      "version": 1,
      "createdAt": "2025-09-29T10:40:00Z"
    },
    {
      "artifactId": "art_linkedin_headline_001",
      "type": "linkedin_headline",
      "title": "LinkedIn Headline",
      "content": "Fraud Analyst | Investigative Expert | Transitioning from Public Service to Tech",
      "version": 1,
      "createdAt": "2025-09-29T10:40:00Z"
    }
  ],
  "totalArtifacts": 5
}
```

**Errors**:
- `404 Not Found`: Plan not found
- `500 Internal Server Error`: Artifact generation failed

---

### GET `/api/v1/artifacts`
**Description**: List all user artifacts

**Response** (200 OK):
```json
{
  "artifacts": [
    {
      "artifactId": "art_resume_001",
      "type": "resume",
      "title": "Rewritten Résumé",
      "version": 2,
      "updatedAt": "2025-09-30T09:00:00Z"
    }
  ]
}
```

---

### PUT `/api/v1/artifacts/{artifactId}`
**Description**: Edit artifact (creates new version)

**Request Body**:
```json
{
  "content": "Updated résumé content..."
}
```

**Response** (200 OK):
```json
{
  "artifactId": "art_resume_001",
  "version": 3,
  "content": "...",
  "updatedAt": "2025-09-30T10:00:00Z"
}
```

---

### GET `/api/v1/artifacts/{artifactId}/export`
**Description**: Export artifact as PDF or DOCX

**Query Params**: `?format=pdf` or `?format=docx`

**Response** (200 OK):
- Content-Type: `application/pdf` or `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- Body: Binary file

---

## Progress & Gamification

### GET `/api/v1/progress`
**Description**: Get user's progress summary

**Response** (200 OK):
```json
{
  "userId": "usr_abc123",
  "xp": 230,
  "level": 3,
  "nextLevelXp": 300,
  "streak": 5,
  "badges": [
    {"badgeId": "badge_first_task", "name": "First Task", "earnedAt": "2025-09-30T08:00:00Z"},
    {"badgeId": "badge_3_outreach", "name": "3 Outreach Sent", "earnedAt": "2025-10-01T15:00:00Z"}
  ],
  "completedTasks": 12,
  "totalTasks": 15
}
```

---

### POST `/api/v1/progress/checkin`
**Description**: Submit weekly check-in

**Request Body**:
```json
{
  "week": 2,
  "completedTaskIds": ["task_005", "task_006", "task_007"],
  "win": "Scheduled my first informational interview!",
  "needsAdjustment": false
}
```

**Response** (200 OK):
```json
{
  "xpEarned": 30,
  "newBadges": [],
  "message": "Check-in complete! Keep up the momentum."
}
```

---

## Data Control

### GET `/api/v1/export`
**Description**: Export all user data

**Query Params**: `?format=json` or `?format=pdf`

**Response** (200 OK):
- If JSON: Content-Type: `application/json`
- If PDF: Content-Type: `application/pdf`
- Body: User data bundle (profile, goals, questionnaires, ideas, plans, tasks, artifacts)

**Response** (202 Accepted, if >10s):
```json
{
  "message": "Export is processing. Download link will be emailed to you within 10 minutes."
}
```

---

### DELETE `/api/v1/account`
**Description**: Request account deletion

**Request Body**:
```json
{
  "confirmationText": "DELETE"
}
```

**Response** (202 Accepted):
```json
{
  "message": "Your account deletion is scheduled. All data will be permanently deleted within 24 hours. You will receive confirmation via email."
}
```

**Errors**:
- `400 Bad Request`: Confirmation text incorrect

---

## Error Response Format

All errors follow this structure:

```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "The request body is missing required field 'email'.",
    "details": {
      "field": "email",
      "reason": "required"
    },
    "requestId": "req_xyz123",
    "timestamp": "2025-09-29T10:00:00Z"
  }
}
```

### Error Codes
- `INVALID_REQUEST`: Malformed request (400)
- `UNAUTHORIZED`: Missing or invalid token (401)
- `FORBIDDEN`: Insufficient permissions (403)
- `NOT_FOUND`: Resource not found (404)
- `CONFLICT`: Duplicate resource (409)
- `UNPROCESSABLE`: Valid request, but action cannot be completed (422)
- `RATE_LIMITED`: Too many requests (429)
- `INTERNAL_ERROR`: Server error (500)
- `SERVICE_UNAVAILABLE`: Temporary service issue (503)

---

## Rate Limiting

**Limits**:
- **Authenticated**: 100 requests/minute per user
- **Anonymous**: 20 requests/minute per IP
- **Ideas generation**: 5 requests/hour per user (LLM resource constraint)

**Headers** (included in all responses):
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1696003200
```

**429 Response**:
```json
{
  "error": {
    "code": "RATE_LIMITED",
    "message": "Rate limit exceeded. Try again in 42 seconds.",
    "retryAfter": 42
  }
}
```

---

## Versioning & Deprecation

- Current version: `/api/v1/`
- Future versions: `/api/v2/`, `/api/v3/`, etc.
- Deprecated endpoints: 6-month notice via:
  - Header: `Sunset: Sat, 31 Mar 2026 23:59:59 GMT`
  - Response field: `"deprecationNotice": "This endpoint will be removed on 2026-03-31. Migrate to /api/v2/resource."`

---

**Compliance**: This API specification aligns with Junielyfe Constitution v1.0.0, specifically Principles IX–XIV (Privacy & Security) including consent per data source, PII minimization (server-side redaction before LLM calls), per-user data isolation (enforced via Supabase RLS), export-anytime (≤10s), and delete-my-data within 24 hours.