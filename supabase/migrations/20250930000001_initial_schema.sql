-- Migration: Initial Schema for Junielyfe MVP
-- Created: 2025-09-30
-- Description: Users, profiles, goals, ideas, plans, and Clerk webhook tables with RLS

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USERS TABLE (Synced from Clerk)
-- =====================================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_user_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Index for fast Clerk user lookups
CREATE INDEX idx_users_clerk_user_id ON users(clerk_user_id);
CREATE INDEX idx_users_email ON users(email);

-- =====================================================
-- CLERK WEBHOOK EVENTS (for debugging)
-- =====================================================
CREATE TABLE clerk_webhook_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  clerk_user_id TEXT,
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_clerk_webhook_events_type ON clerk_webhook_events(event_type);
CREATE INDEX idx_clerk_webhook_events_processed ON clerk_webhook_events(processed);

-- =====================================================
-- PROFILES TABLE
-- =====================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  clerk_user_id TEXT NOT NULL,

  -- LinkedIn data
  linkedin_profile_url TEXT,
  linkedin_data JSONB,

  -- Resume data
  resume_file_path TEXT,
  resume_parsed_data JSONB,

  -- Narrative
  narrative TEXT,

  -- Consents (GDPR compliance)
  consents JSONB DEFAULT '{"linkedin": false, "resume": false, "narrative": false}'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_clerk_user_id ON profiles(clerk_user_id);

-- =====================================================
-- GOALS TABLE
-- =====================================================
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  clerk_user_id TEXT NOT NULL,

  goal_type TEXT NOT NULL CHECK (goal_type IN ('financial', 'career')),
  goal_text TEXT NOT NULL,

  -- Financial goal specific
  target_income_delta INTEGER,

  -- Career goal specific
  target_role TEXT,
  target_title TEXT,

  -- Constraints
  horizon_weeks INTEGER,
  hours_per_week INTEGER,
  risk_tolerance TEXT CHECK (risk_tolerance IN ('low', 'medium', 'high')),
  remote_only BOOLEAN DEFAULT FALSE,
  budget_for_learning INTEGER,
  ethical_exclusions TEXT[],

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_goals_user_id ON goals(user_id);
CREATE INDEX idx_goals_clerk_user_id ON goals(clerk_user_id);

-- =====================================================
-- QUESTIONNAIRE SESSIONS TABLE
-- =====================================================
CREATE TABLE questionnaire_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  clerk_user_id TEXT NOT NULL,
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,

  depth TEXT NOT NULL CHECK (depth IN ('quick', 'standard', 'in_depth')),
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_questionnaire_sessions_user_id ON questionnaire_sessions(user_id);
CREATE INDEX idx_questionnaire_sessions_clerk_user_id ON questionnaire_sessions(clerk_user_id);
CREATE INDEX idx_questionnaire_sessions_goal_id ON questionnaire_sessions(goal_id);

-- =====================================================
-- ANSWERS TABLE
-- =====================================================
CREATE TABLE answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES questionnaire_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  clerk_user_id TEXT NOT NULL,

  question_key TEXT NOT NULL,
  question_text TEXT NOT NULL,
  answer_text TEXT NOT NULL,
  answer_metadata JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_answers_session_id ON answers(session_id);
CREATE INDEX idx_answers_user_id ON answers(user_id);
CREATE INDEX idx_answers_clerk_user_id ON answers(clerk_user_id);

-- =====================================================
-- IDEAS TABLE
-- =====================================================
CREATE TABLE ideas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  clerk_user_id TEXT NOT NULL,
  session_id UUID NOT NULL REFERENCES questionnaire_sessions(id) ON DELETE CASCADE,

  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('employee', 'freelance', 'builder')),

  -- Scores (1-10)
  fit_score INTEGER CHECK (fit_score >= 1 AND fit_score <= 10),
  market_score INTEGER CHECK (market_score >= 1 AND market_score <= 10),
  speed_score INTEGER CHECK (speed_score >= 1 AND speed_score <= 10),
  risk_score INTEGER CHECK (risk_score >= 1 AND risk_score <= 10),

  -- Reasoning
  why_this_fits TEXT NOT NULL,
  research_sources JSONB,

  -- Flags
  is_intensive BOOLEAN DEFAULT FALSE,

  -- Selection
  is_selected BOOLEAN DEFAULT FALSE,
  selected_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_ideas_user_id ON ideas(user_id);
CREATE INDEX idx_ideas_clerk_user_id ON ideas(clerk_user_id);
CREATE INDEX idx_ideas_session_id ON ideas(session_id);
CREATE INDEX idx_ideas_selected ON ideas(is_selected);

-- =====================================================
-- PLANS TABLE
-- =====================================================
CREATE TABLE plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  clerk_user_id TEXT NOT NULL,

  title TEXT NOT NULL,
  duration_weeks INTEGER NOT NULL DEFAULT 4,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_plans_user_id ON plans(user_id);
CREATE INDEX idx_plans_clerk_user_id ON plans(clerk_user_id);

-- =====================================================
-- PLAN IDEAS (Many-to-Many)
-- =====================================================
CREATE TABLE plan_ideas (
  plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
  PRIMARY KEY (plan_id, idea_id)
);

-- =====================================================
-- TASKS TABLE
-- =====================================================
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  clerk_user_id TEXT NOT NULL,

  title TEXT NOT NULL,
  description TEXT,
  week_number INTEGER NOT NULL CHECK (week_number >= 1 AND week_number <= 4),
  order_in_week INTEGER NOT NULL,

  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')),

  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_tasks_plan_id ON tasks(plan_id);
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_clerk_user_id ON tasks(clerk_user_id);

-- =====================================================
-- ARTIFACTS TABLE
-- =====================================================
CREATE TABLE artifacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  clerk_user_id TEXT NOT NULL,
  plan_id UUID REFERENCES plans(id) ON DELETE CASCADE,

  artifact_type TEXT NOT NULL CHECK (artifact_type IN ('resume', 'linkedin_headline', 'outreach_template', 'portfolio_brief', 'learning_plan')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_artifacts_user_id ON artifacts(user_id);
CREATE INDEX idx_artifacts_clerk_user_id ON artifacts(clerk_user_id);
CREATE INDEX idx_artifacts_plan_id ON artifacts(plan_id);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE questionnaire_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE artifacts ENABLE ROW LEVEL SECURITY;

-- Helper function to get current Clerk user ID from JWT
-- This will be set by middleware in Next.js
CREATE OR REPLACE FUNCTION current_clerk_user_id() RETURNS TEXT AS $$
  SELECT current_setting('request.jwt.claims', true)::json->>'sub';
$$ LANGUAGE SQL STABLE;

-- USERS policies
CREATE POLICY "Users can view own record"
  ON users FOR SELECT
  USING (clerk_user_id = current_clerk_user_id());

CREATE POLICY "Users can update own record"
  ON users FOR UPDATE
  USING (clerk_user_id = current_clerk_user_id());

-- PROFILES policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (clerk_user_id = current_clerk_user_id());

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (clerk_user_id = current_clerk_user_id());

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (clerk_user_id = current_clerk_user_id());

-- GOALS policies
CREATE POLICY "Users can view own goals"
  ON goals FOR SELECT
  USING (clerk_user_id = current_clerk_user_id());

CREATE POLICY "Users can insert own goals"
  ON goals FOR INSERT
  WITH CHECK (clerk_user_id = current_clerk_user_id());

CREATE POLICY "Users can update own goals"
  ON goals FOR UPDATE
  USING (clerk_user_id = current_clerk_user_id());

-- QUESTIONNAIRE_SESSIONS policies
CREATE POLICY "Users can view own sessions"
  ON questionnaire_sessions FOR SELECT
  USING (clerk_user_id = current_clerk_user_id());

CREATE POLICY "Users can insert own sessions"
  ON questionnaire_sessions FOR INSERT
  WITH CHECK (clerk_user_id = current_clerk_user_id());

CREATE POLICY "Users can update own sessions"
  ON questionnaire_sessions FOR UPDATE
  USING (clerk_user_id = current_clerk_user_id());

-- ANSWERS policies
CREATE POLICY "Users can view own answers"
  ON answers FOR SELECT
  USING (clerk_user_id = current_clerk_user_id());

CREATE POLICY "Users can insert own answers"
  ON answers FOR INSERT
  WITH CHECK (clerk_user_id = current_clerk_user_id());

-- IDEAS policies
CREATE POLICY "Users can view own ideas"
  ON ideas FOR SELECT
  USING (clerk_user_id = current_clerk_user_id());

CREATE POLICY "Users can insert own ideas"
  ON ideas FOR INSERT
  WITH CHECK (clerk_user_id = current_clerk_user_id());

CREATE POLICY "Users can update own ideas"
  ON ideas FOR UPDATE
  USING (clerk_user_id = current_clerk_user_id());

-- PLANS policies
CREATE POLICY "Users can view own plans"
  ON plans FOR SELECT
  USING (clerk_user_id = current_clerk_user_id());

CREATE POLICY "Users can insert own plans"
  ON plans FOR INSERT
  WITH CHECK (clerk_user_id = current_clerk_user_id());

CREATE POLICY "Users can update own plans"
  ON plans FOR UPDATE
  USING (clerk_user_id = current_clerk_user_id());

-- PLAN_IDEAS policies (inherit from plans)
CREATE POLICY "Users can view own plan_ideas"
  ON plan_ideas FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM plans WHERE plans.id = plan_ideas.plan_id AND plans.clerk_user_id = current_clerk_user_id()
  ));

CREATE POLICY "Users can insert own plan_ideas"
  ON plan_ideas FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM plans WHERE plans.id = plan_ideas.plan_id AND plans.clerk_user_id = current_clerk_user_id()
  ));

-- TASKS policies
CREATE POLICY "Users can view own tasks"
  ON tasks FOR SELECT
  USING (clerk_user_id = current_clerk_user_id());

CREATE POLICY "Users can insert own tasks"
  ON tasks FOR INSERT
  WITH CHECK (clerk_user_id = current_clerk_user_id());

CREATE POLICY "Users can update own tasks"
  ON tasks FOR UPDATE
  USING (clerk_user_id = current_clerk_user_id());

-- ARTIFACTS policies
CREATE POLICY "Users can view own artifacts"
  ON artifacts FOR SELECT
  USING (clerk_user_id = current_clerk_user_id());

CREATE POLICY "Users can insert own artifacts"
  ON artifacts FOR INSERT
  WITH CHECK (clerk_user_id = current_clerk_user_id());

CREATE POLICY "Users can update own artifacts"
  ON artifacts FOR UPDATE
  USING (clerk_user_id = current_clerk_user_id());

-- =====================================================
-- UPDATED_AT TRIGGERS
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questionnaire_sessions_updated_at BEFORE UPDATE ON questionnaire_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_artifacts_updated_at BEFORE UPDATE ON artifacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();