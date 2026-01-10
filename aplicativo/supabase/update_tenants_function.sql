-- Update Tenants List Function to include NIT
CREATE OR REPLACE FUNCTION get_admin_tenants_list()
RETURNS TABLE (
    id UUID,
    name TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    email TEXT,
    last_activity TIMESTAMP WITH TIME ZONE,
    status TEXT,
    city TEXT,
    nit TEXT  -- Added NIT
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
        o.city,
        o.nit -- Added NIT
    FROM organizations o
    ORDER BY o.created_at DESC;
END;
$$;

-- Grant permissions again just in case
GRANT EXECUTE ON FUNCTION get_admin_tenants_list() TO postgres, anon, authenticated, service_role;
