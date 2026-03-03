-- Migration: Add Slack support to projects
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS slack_webhook_url TEXT,
ADD COLUMN IF NOT EXISTS slack_notifications_enabled BOOLEAN DEFAULT TRUE;

-- Update RLS if needed (Managers can update this)
-- (Existing policies already allow managers to update projects)
