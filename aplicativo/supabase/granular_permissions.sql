-- 1. Add permissions column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{"create_customers": true, "view_purchase_costs": false, "apply_discounts": true}'::jsonb;

-- 2. Update existing owners and admins to have all permissions
UPDATE public.profiles 
SET permissions = '{"create_customers": true, "view_purchase_costs": true, "apply_discounts": true, "manage_team": true}'::jsonb
WHERE role IN ('owner', 'admin');

-- 3. Update existing cashiers to have basic permissions
UPDATE public.profiles 
SET permissions = '{"create_customers": true, "view_purchase_costs":  false, "apply_discounts": true}'::jsonb
WHERE role = 'cashier';
