-- Add subscription and plan columns to organizations table
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free';
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active';

-- Refresh the PostgREST cache (optional, sometimes needed in some environments)
NOTIFY pgrst, 'reload schema';
