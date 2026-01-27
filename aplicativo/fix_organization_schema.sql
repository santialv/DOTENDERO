-- Add subscription columns to organizations table
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS plan_expiry TIMESTAMPTZ;

-- Add index
CREATE INDEX IF NOT EXISTS idx_org_plan ON public.organizations(plan);
