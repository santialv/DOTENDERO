-- 1. FIX THE RPC for "Estado" column
CREATE OR REPLACE FUNCTION get_admin_tenants_list()
RETURNS TABLE (
    id UUID,
    name TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    email TEXT,
    last_activity TIMESTAMP WITH TIME ZONE,
    status TEXT,
    city TEXT,
    nit TEXT
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
        (SELECT max(i.created_at) FROM invoices i WHERE i.organization_id = o.id) as last_activity,
        CASE 
            WHEN EXISTS (SELECT 1 FROM invoices i WHERE i.organization_id = o.id AND i.created_at > (now() - interval '30 days')) THEN 'Activo'
            ELSE 'Inactivo'
        END as status,
        o.city,
        o.nit
    FROM organizations o
    ORDER BY o.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION get_admin_tenants_list() TO postgres, anon, authenticated, service_role;

-- 2. SEED DATA for "El Vecino" with Categories
DO $$
DECLARE
    v_org_id UUID;
    v_cat_alim UUID;
    v_cat_aseo UUID;
    v_cat_bebidas UUID;
    v_cat_snack UUID;
BEGIN
    -- Get the organization ID
    SELECT id INTO v_org_id FROM public.organizations WHERE email = 'brandonruda70@gmail.com';
    
    IF v_org_id IS NULL THEN
        RAISE NOTICE 'Tienda con email brandonruda70@gmail.com no encontrada.';
        RETURN;
    END IF;

    -- A. CREATE CATEGORIES
    INSERT INTO public.categories (organization_id, name) VALUES (v_org_id, 'Alimentos') RETURNING id INTO v_cat_alim;
    INSERT INTO public.categories (organization_id, name) VALUES (v_org_id, 'Aseo') RETURNING id INTO v_cat_aseo;
    INSERT INTO public.categories (organization_id, name) VALUES (v_org_id, 'Bebidas') RETURNING id INTO v_cat_bebidas;
    INSERT INTO public.categories (organization_id, name) VALUES (v_org_id, 'Snacks') RETURNING id INTO v_cat_snack;

    RAISE NOTICE 'Categorías creadas.';

    -- B. INSERT PRODUCTS LINKED TO CATEGORIES
    -- We delete previous test data to avoid duplicates if re-running
    DELETE FROM public.products WHERE organization_id = v_org_id AND name LIKE 'Producto %'; -- Cleanup old simple names
    
    INSERT INTO public.products (organization_id, name, price, cost, stock, category_id, barcode, created_at)
    SELECT 
        v_org_id,
         (ARRAY['Leche', 'Arroz', 'Pan', 'Gaseosa', 'Aceite', 'Huevos', 'Azúcar', 'Sal', 'Café', 'Chocolate'])[floor(random() * 10 + 1)] || ' ' || 
        (ARRAY['Marca A', 'Marca B', 'Marca C', 'Premium', 'Económico'])[floor(random() * 5 + 1)] || ' ' || 
        floor(random() * 1000)::text,
        (floor(random() * 20 + 1) * 500)::NUMERIC,
        0,
        floor(random() * 100)::NUMERIC,
        (ARRAY[v_cat_alim, v_cat_alim, v_cat_alim, v_cat_bebidas, v_cat_alim, v_cat_alim, v_cat_alim, v_cat_alim, v_cat_bebidas, v_cat_snack])[floor(random() * 10 + 1)], -- Rough match
        'EAN' || floor(random() * 1000000000000)::text,
        NOW() - (random() * interval '60 days')
    FROM generate_series(1, 100);

    -- Update costs
    UPDATE public.products SET cost = price * 0.7 WHERE organization_id = v_org_id AND cost = 0;

    -- C. INSERT CLIENTS
    INSERT INTO public.customers (organization_id, full_name, phone, email, current_debt, created_at)
    SELECT 
        v_org_id,
        'Cliente ' || floor(random() * 1000)::text,
        '3' || floor(random() * 100000000 + 10000000)::text,
        'cliente' || floor(random() * 10000)::text || '@ejemplo.com',
        0,
        NOW() - (random() * interval '30 days')
    FROM generate_series(1, 50);

    RAISE NOTICE 'Datos de prueba insertados con categorías.';

END $$;