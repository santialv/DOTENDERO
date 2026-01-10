-- Add email column to organizations table if it doesn't exist
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS email TEXT;

-- Add updated_at if missing (good practice)
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
