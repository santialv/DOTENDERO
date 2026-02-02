-- 1. Ensure columns exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;

-- 2. Create a security definer function to get current user's role and org
-- This avoids the infinite recursion in RLS policies
CREATE OR REPLACE FUNCTION public.get_my_org_id()
RETURNS UUID AS $$
    SELECT organization_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- 3. Fix the policies to use the helper functions (avoiding recursion)
DROP POLICY IF EXISTS "Profiles are viewable by everyone in same org" ON public.profiles;
CREATE POLICY "Profiles are viewable by everyone in same org" ON public.profiles
FOR SELECT USING (
    organization_id = public.get_my_org_id()
);

-- Only owners and admins can manage profiles in their org
DROP POLICY IF EXISTS "Owners and admins can manage profiles" ON public.profiles;
CREATE POLICY "Owners and admins can manage profiles" ON public.profiles
FOR ALL USING (
    public.get_my_role() IN ('owner', 'admin')
    AND organization_id = public.get_my_org_id()
);
