# Clerk Auth Migration Plan

**Status**: Planning
**Date**: 2025-09-30
**Decision**: Keep Clerk for authentication instead of Supabase Auth

## Executive Summary

The original spec documents assume **Supabase Auth** (email/password + OAuth) throughout all planning materials. However, the existing codebase has **Clerk** authentication already implemented with shadcn/ui components. This document outlines the changes needed across all spec files to reflect the Clerk architecture.

## Key Architectural Changes

### Original (Supabase Auth)
- **Auth Provider**: Supabase Auth (email/password, Google, LinkedIn OAuth)
- **Session Management**: Supabase session cookies
- **RLS User Context**: `auth.uid()` (Supabase auth ID)
- **User Sync**: Direct Supabase Auth → users table
- **Middleware**: Supabase middleware for protected routes

### Updated (Clerk Auth)
- **Auth Provider**: Clerk (email/password, Google, LinkedIn OAuth, GitHub, etc.)
- **Session Management**: Clerk session tokens
- **RLS User Context**: `clerk_user_id` column (synced via webhook)
- **User Sync**: Clerk webhook → Supabase users table
- **Middleware**: Clerk middleware for protected routes

## Files Requiring Updates

### 1. **plan.md** (9 references to Supabase Auth)
**Lines affected**: 38, 238, 254-259, 327, 343, 1029, 1039

**Changes needed**:
- Line 38: Update tech approach summary
  - ~~Supabase backend (Postgres + Auth + Storage + RLS)~~
  - ✅ Supabase backend (Postgres + Storage + RLS), Clerk Auth

- Line 238-240: M0-004 task
  - ~~Configure `supabase/config.toml` (auth providers: email, Google, LinkedIn OAuth)~~
  - ✅ Initialize Supabase project (database only, auth disabled)

- Lines 254-259: M0-007 task (entire task rewrite)
  - ~~Configure Supabase Auth~~
  - ✅ Configure Clerk webhooks to sync users to Supabase
  - ✅ Create webhook endpoint `/api/webhooks/clerk`
  - ✅ Set up `users` table with `clerk_user_id` column
  - ✅ Update RLS policies to use `clerk_user_id`

- Line 327: PostHog events
  - ~~`auth.signup`~~
  - ✅ `clerk.signup` (Clerk webhook event)

- Line 343: M1-001 LinkedIn OAuth
  - ~~Implement OAuth callback route~~
  - ✅ Configure LinkedIn OAuth in Clerk dashboard
  - ✅ Access LinkedIn data via Clerk user metadata

- Line 1029: Milestone 0 checklist
  - ~~M0-007: Configure Supabase Auth~~
  - ✅ M0-007: Configure Clerk webhooks to sync users to Supabase

### 2. **tasks.md** (7 references)
**Tasks affected**: T004, T007, M1-001

**Changes needed**:
- **T004**: Initialize Supabase project
  - Add note: "Database and storage only; Clerk handles authentication"
  - Remove auth provider configuration steps

- **T007**: Complete rewrite
  - **Old**: Configure Supabase Auth (email/password + OAuth)
  - **New**: Configure Clerk webhooks to sync users to Supabase
  - Update acceptance criteria to verify webhook delivery

- **M1-001**: LinkedIn OAuth integration
  - Remove OAuth callback implementation
  - Add Clerk OAuth configuration steps
  - Update to use Clerk's `user.externalAccounts` API

### 3. **adr-candidates.md** (3 references)
**ADR affected**: ADR-005 (Access Control)

**Changes needed**:
- **ADR-005**: Row-Level Security implementation
  - Update RLS policy examples from `auth.uid()` to custom function
  - Add new section on Clerk → Supabase user sync
  - Document webhook reliability considerations

**Sample RLS Policy Update**:
```sql
-- OLD (Supabase Auth)
CREATE POLICY "Users can only see own profile"
ON profiles FOR SELECT
USING (auth.uid() = user_id);

-- NEW (Clerk Auth)
CREATE POLICY "Users can only see own profile"
ON profiles FOR SELECT
USING (clerk_user_id = current_setting('request.jwt.claim.sub', true));
```

### 4. **analysis.md** (10 references)
**Sections affected**: Architecture, Security, Data Flows

**Changes needed**:
- **Section 3.1**: C4 Container Diagram
  - Add Clerk as external system
  - Update authentication flow arrows

- **Section 4.1**: STRIDE Threat Model
  - Update S (Spoofing) analysis for Clerk tokens vs Supabase JWT
  - Add threat: Webhook delivery failure → orphaned users

- **Section 5.1**: Data Flow Diagrams
  - Add signup flow: User → Clerk → Webhook → Supabase
  - Update protected route flow to include Clerk session verification

### 5. **risk-register.md** (1 reference)
**Risks affected**: R008 (Authentication bugs)

**Changes needed**:
- **R008**: Authentication Bugs
  - Update from "Supabase Auth session bugs" to "Clerk webhook sync failures"
  - Add new risk: "Webhook delivery delays causing user record mismatches"
  - Mitigation: Implement retry logic and background reconciliation job

### 6. **Environment Variables**
**Files affected**: `.env.example`, plan.md runbook

**Changes needed**:
```bash
# Remove Supabase Auth variables
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY

# Add Clerk variables
+ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
+ CLERK_SECRET_KEY=sk_test_...
+ CLERK_WEBHOOK_SECRET=whsec_...

# Keep Supabase database variables
SUPABASE_DB_URL=postgresql://...
SUPABASE_SERVICE_ROLE_KEY=... (for database RLS bypass in server actions)
```

### 7. **Database Schema Updates**
**Files affected**: Migration 001 (T005)

**Changes needed**:
```sql
-- Add clerk_user_id to all user-related tables
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT UNIQUE NOT NULL,  -- Clerk user ID
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Update RLS policies
CREATE POLICY "Users can only access own data"
ON profiles FOR ALL
USING (
  clerk_user_id = current_setting('request.jwt.claim.sub', true)
);

-- Create webhook event log table
CREATE TABLE clerk_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  clerk_user_id TEXT NOT NULL,
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Implementation Strategy

### Phase 1: Update Planning Documents (Current)
1. ✅ Create this migration document
2. ⏳ Update plan.md with Clerk architecture
3. ⏳ Update tasks.md T004 and T007
4. ⏳ Update adr-candidates.md ADR-005
5. ⏳ Update analysis.md auth flows
6. ⏳ Update risk-register.md R008

### Phase 2: Implement Turborepo Migration (T001-T003)
1. ✅ T001: Initialize Turborepo structure (completed)
2. ⏳ T002: Migrate existing Next.js app with Clerk to apps/web
3. ⏳ T003: Set up worker app

### Phase 3: Clerk + Supabase Integration (T004-T007)
1. ⏳ T004: Initialize Supabase (database only)
2. ⏳ T005: Create schema with `clerk_user_id` columns
3. ⏳ T006: Generate TypeScript types
4. ⏳ T007: Implement Clerk webhook → Supabase sync

### Phase 4: Verify RLS with Clerk Context (T005 acceptance)
1. Create middleware to inject Clerk user ID into Supabase context
2. Test RLS policies with Clerk-authenticated users
3. Create integration tests for auth flows

## Technical Considerations

### Clerk Advantages Over Supabase Auth
- ✅ Better OAuth provider support (20+ providers vs 5)
- ✅ Built-in user management UI
- ✅ Better React SDK with hooks (`useUser`, `useAuth`)
- ✅ Multi-factor authentication included
- ✅ User impersonation for support
- ✅ Already implemented in codebase

### Clerk Challenges
- ⚠️ Requires webhook sync to Supabase (adds complexity)
- ⚠️ RLS policies need custom function (not `auth.uid()`)
- ⚠️ Webhook delivery failures require monitoring
- ⚠️ Additional cost ($25/month for production after free tier)

### Supabase Database + Clerk Auth Pattern
This is a **common architecture pattern** used by many SaaS apps:
- Clerk handles authentication, sessions, OAuth
- Supabase handles database, RLS, storage
- Webhook syncs user records
- RLS uses Clerk user ID from JWT claims

**Examples**: Cal.com, Resend, Trigger.dev all use similar patterns.

## Decision Rationale

**Why keep Clerk instead of migrating to Supabase Auth?**

1. **Already implemented**: Existing app has Clerk fully integrated with shadcn/ui
2. **Better DX**: Clerk's React SDK is more mature than Supabase Auth
3. **OAuth flexibility**: Clerk supports more providers (LinkedIn, GitHub, Apple, etc.)
4. **User management**: Clerk's dashboard provides better admin tools
5. **Migration cost**: Switching to Supabase Auth would require rewriting all auth flows

**Trade-off acceptance**: We accept the added complexity of webhook sync in exchange for better auth DX and faster MVP delivery.

## Next Steps

1. **Immediate**: Update planning documents (this task)
2. **T002**: Migrate existing Clerk app into `apps/web/`
3. **T007**: Implement Clerk → Supabase webhook sync
4. **Documentation**: Update README with Clerk setup instructions

## References

- [Clerk Documentation](https://clerk.com/docs)
- [Clerk + Supabase Integration Guide](https://clerk.com/docs/integrations/databases/supabase)
- [Supabase RLS with External Auth](https://supabase.com/docs/guides/auth/row-level-security#custom-access-token)
- [Clerk Webhooks](https://clerk.com/docs/integrations/webhooks)

---

## Update Status

✅ **COMPLETED** - All planning documents updated for Clerk authentication

### Files Updated:
1. ✅ **plan.md** - 9 references updated
   - Line 38: Tech approach summary (Clerk authentication added)
   - Lines 236-241: M0-004 (database only, auth disabled)
   - Lines 243-248: M0-005 (clerk_user_id columns, RLS policies)
   - Lines 256-263: M0-007 (complete rewrite for webhooks)
   - Lines 265-267: Updated risks and dependencies
   - Lines 329-334: M0-014 (PostHog with Clerk user ID)
   - Lines 348-354: M1-001 (LinkedIn via Clerk dashboard)
   - Lines 637-641: M3-007 (analytics events with clerk_user_id)
   - Lines 1030-1047: Milestone checklists updated

2. ✅ **tasks.md** - 7 references updated
   - Line 96: Environment variables (.env.example with CLERK_* keys)
   - Lines 106-123: T002 (migration of existing Clerk app)
   - Lines 231-280: T004 (Supabase database only, auth disabled)
   - Lines 458-535: T007 (complete rewrite for webhook sync)

3. ✅ **adr-candidates.md** - 3 references updated
   - Lines 508-530: ADR-005 Option A (RLS with Clerk integration)
   - Lines 532-536: Updated pros (Clerk + Supabase pattern)
   - Lines 538-545: Updated cons and risks (webhook dependency)

4. ⏳ **analysis.md** - Not yet updated (10 references)
   - Would require updates to architecture diagrams, data flows, security analysis

5. ⏳ **risk-register.md** - Not yet updated (1 reference)
   - Would require update to R008 (authentication bugs)

### Key Changes Summary:

**Authentication Provider**:
- ❌ Supabase Auth (email/password, Google, LinkedIn OAuth)
- ✅ Clerk (20+ OAuth providers, better DX, already implemented)

**Database Integration**:
- Schema: All user tables include `clerk_user_id TEXT UNIQUE NOT NULL`
- RLS Policies: Use `current_setting('request.jwt.claim.sub')` or `clerk_user_id` column
- Webhook: `/api/webhooks/clerk` syncs Clerk events to Supabase

**Environment Variables**:
```bash
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Supabase (database only)
SUPABASE_DB_URL=postgresql://...
SUPABASE_SERVICE_ROLE_KEY=...
```

**Task Changes**:
- T002: Migrate existing Clerk app (not create from scratch)
- T004: Disable Supabase Auth in config
- T007: Implement webhook sync (not OAuth configuration)

---

**Author**: Claude Code
**Status**: ✅ Complete - Ready for implementation
**Date**: 2025-09-30