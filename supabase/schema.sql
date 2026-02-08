-- AI-Powered Bug Management Platform - Database Schema
-- This schema supports role-based access, AI features, and vector similarity search

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ============================================================================
-- PROFILES TABLE (extends Supabase auth.users)
-- ============================================================================
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('tester', 'developer', 'manager')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- PROJECTS TABLE
-- ============================================================================
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Policies for projects
CREATE POLICY "Users can view projects they're involved in"
  ON public.projects FOR SELECT
  USING (true); -- For now, all authenticated users can see all projects

CREATE POLICY "Only managers can create projects"
  ON public.projects FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'manager'
    )
  );

CREATE POLICY "Only managers can update projects"
  ON public.projects FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'manager'
    )
  );

-- ============================================================================
-- BUGS TABLE (with vector embeddings for AI)
-- ============================================================================
CREATE TABLE public.bugs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  
  -- Bug details
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  
  -- Classification
  category TEXT CHECK (category IN (
    'ui_ux', 'functional', 'performance', 'security', 'data_logic', 'integration'
  )),
  severity TEXT CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  status TEXT DEFAULT 'open' CHECK (status IN (
    'open', 'in_progress', 'resolved', 'closed', 'duplicate'
  )),
  
  -- AI features
  embedding vector(384), -- Sentence transformer embeddings (all-MiniLM-L6-v2)
  ai_metadata JSONB DEFAULT '{}', -- Stores predictions, confidence, explanations
  
  -- Duplicate tracking
  duplicate_of UUID REFERENCES public.bugs(id) ON DELETE SET NULL,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.bugs ENABLE ROW LEVEL SECURITY;

-- Create vector similarity index for fast duplicate detection
CREATE INDEX bugs_embedding_idx ON public.bugs 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Create regular indexes
CREATE INDEX bugs_project_id_idx ON public.bugs(project_id);
CREATE INDEX bugs_status_idx ON public.bugs(status);
CREATE INDEX bugs_severity_idx ON public.bugs(severity);
CREATE INDEX bugs_created_by_idx ON public.bugs(created_by);

-- Policies for bugs
CREATE POLICY "Users can view bugs in their projects"
  ON public.bugs FOR SELECT
  USING (true); -- All authenticated users can view bugs

CREATE POLICY "Testers and managers can create bugs"
  ON public.bugs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('tester', 'manager')
    )
  );

CREATE POLICY "Developers and managers can update bugs"
  ON public.bugs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('developer', 'manager')
    )
  );

-- ============================================================================
-- BUG ASSIGNMENTS TABLE
-- ============================================================================
CREATE TABLE public.bug_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bug_id UUID REFERENCES public.bugs(id) ON DELETE CASCADE NOT NULL,
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(bug_id, assigned_to)
);

ALTER TABLE public.bug_assignments ENABLE ROW LEVEL SECURITY;

CREATE INDEX bug_assignments_bug_id_idx ON public.bug_assignments(bug_id);
CREATE INDEX bug_assignments_assigned_to_idx ON public.bug_assignments(assigned_to);

-- Policies for assignments
CREATE POLICY "Users can view all assignments"
  ON public.bug_assignments FOR SELECT
  USING (true);

CREATE POLICY "Only managers can assign bugs"
  ON public.bug_assignments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'manager'
    )
  );

CREATE POLICY "Only managers can remove assignments"
  ON public.bug_assignments FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'manager'
    )
  );

-- ============================================================================
-- COMMENTS TABLE
-- ============================================================================
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bug_id UUID REFERENCES public.bugs(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE INDEX comments_bug_id_idx ON public.comments(bug_id);
CREATE INDEX comments_user_id_idx ON public.comments(user_id);

-- Policies for comments
CREATE POLICY "Users can view all comments"
  ON public.comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create comments"
  ON public.comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
  ON public.comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON public.comments FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- AI PREDICTIONS TABLE (for tracking model performance)
-- ============================================================================
CREATE TABLE public.ai_predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bug_id UUID REFERENCES public.bugs(id) ON DELETE CASCADE NOT NULL,
  model_version TEXT NOT NULL,
  predictions JSONB NOT NULL, -- {category: {prediction: 'ui_ux', confidence: 0.92}}
  explanations JSONB, -- Human-readable explanations
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.ai_predictions ENABLE ROW LEVEL SECURITY;

CREATE INDEX ai_predictions_bug_id_idx ON public.ai_predictions(bug_id);

-- Policies for AI predictions
CREATE POLICY "Users can view AI predictions"
  ON public.ai_predictions FOR SELECT
  USING (true);

-- ============================================================================
-- NOTIFICATIONS TABLE
-- ============================================================================
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT CHECK (type IN ('assignment', 'comment', 'status_update')) NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policies for notifications
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true); -- Allow service role or authenticated users to trigger notifications

-- ============================================================================
-- FUNCTIONS FOR VECTOR SIMILARITY SEARCH
-- ============================================================================

-- Function to find similar bugs using cosine similarity
CREATE OR REPLACE FUNCTION match_bugs(
  query_embedding vector(384),
  match_threshold float DEFAULT 0.85,
  match_count int DEFAULT 5,
  project_filter uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  category text,
  severity text,
  status text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    bugs.id,
    bugs.title,
    bugs.description,
    bugs.category,
    bugs.severity,
    bugs.status,
    1 - (bugs.embedding <=> query_embedding) AS similarity
  FROM public.bugs
  WHERE 
    bugs.embedding IS NOT NULL
    AND bugs.status != 'closed'
    AND (project_filter IS NULL OR bugs.project_id = project_filter)
    AND 1 - (bugs.embedding <=> query_embedding) > match_threshold
  ORDER BY bugs.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bugs_updated_at
  BEFORE UPDATE ON public.bugs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SEED DATA (for development/testing)
-- ============================================================================

-- Note: You'll need to create users through Supabase Auth first
-- Then insert their profiles manually or through a signup function

-- Example: Insert a sample project (after creating users)
-- INSERT INTO public.projects (name, description, created_by)
-- VALUES ('Demo Project', 'A sample project for testing', '<user-uuid>');
