-- 1. Create/Update email column if needed
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS email TEXT;

-- 2. Drop previous functions to allow clean update
DROP FUNCTION IF EXISTS get_admin_dashboard_stats();
DROP FUNCTION IF EXISTS get_admin_tenants_list();

-- 3. Dashboard Stats Function
CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
RETURNS TABLE (
    total_stores BIGINT,
    active_stores BIGINT,
    total_volume NUMERIC,
    new_stores_week BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT count(*) FROM organizations)::BIGINT,
        (SELECT count(DISTINCT org_id) FROM transactions WHERE created_at > (now() - interval '30 days'))::BIGINT,
        (SELECT COALESCE(sum(amount), 0) FROM transactions WHERE type = 'sale'),
        (SELECT count(*) FROM organizations WHERE created_at > (now() - interval '7 days'))::BIGINT;
END;
$$;

-- 4. Tenants List Function
CREATE OR REPLACE FUNCTION get_admin_tenants_list()
RETURNS TABLE (
    id UUID,
    name TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    email TEXT,
    last_activity TIMESTAMP WITH TIME ZONE,
    status TEXT,
    city TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.id,
        o.name,
        o.created_at,
        o.email,
        (SELECT max(t.created_at) FROM transactions t WHERE t.org_id = o.id) as last_activity,
        CASE 
            WHEN EXISTS (SELECT 1 FROM transactions t WHERE t.org_id = o.id AND t.created_at > (now() - interval '30 days')) THEN 'Activo'
            ELSE 'Inactivo'
        END as status,
        o.city
    FROM organizations o
    ORDER BY o.created_at DESC;
END;
$$;

-- 5. IMPORTANT: GRANT PERMISSIONS
-- This ensures the anonymous or logged-in users can actually CALL these functions
GRANT EXECUTE ON FUNCTION get_admin_dashboard_stats() TO postgres, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_admin_tenants_list() TO postgres, anon, authenticated, service_role;

-- 6. (Optional) Backfill email if possible (only if profiles table exists and is linked)
-- This is a best-effort attempt.
DO $$
BEGIN
    -- Try to update organization email from auth.users via some link if possible.
    -- Assuming no direct link for now, manual update may be needed for old orgs.
    NULL;
END;
$$;
