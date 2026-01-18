-- SCRIPT DE DESTRUCCIÓN TOTAL (CORREGIDO ORDEN CASCADA)
DO $$
DECLARE
    hq_id UUID;
BEGIN
    -- 1. Encontrar HQ para salvarla
    SELECT id INTO hq_id FROM public.organizations WHERE name = 'DonTendero HQ' LIMIT 1;
    
    IF hq_id IS NULL THEN
        RAISE EXCEPTION 'No se encontró HQ. No puedo borrar nada sin una HQ segura.';
    END IF;

    RAISE NOTICE 'Preservando HQ: %', hq_id;

    -- 2. Desvincular usuarios
    UPDATE public.profiles 
    SET organization_id = NULL, home_organization_id = NULL
    WHERE organization_id != hq_id;

    -- 3. BORRADO EN CASCADA INTELIGENTE (De abajo hacia arriba)
    
    -- Movimientos dependen de facturas y productos, borrarlos primero
    DELETE FROM public.movements WHERE organization_id != hq_id;
    
    -- Items de factura dependen de facturas y productos
    DELETE FROM public.invoice_items WHERE organization_id != hq_id;
    
    -- Ahora sí podemos borrar Facturas
    DELETE FROM public.invoices WHERE organization_id != hq_id;
    
    -- Productos (ya sin movimientos ni items)
    DELETE FROM public.products WHERE organization_id != hq_id;
    
    -- Otros datos periféricos
    DELETE FROM public.subscription_history WHERE organization_id != hq_id;
    DELETE FROM public.customers WHERE organization_id != hq_id;
    DELETE FROM public.expenses WHERE organization_id != hq_id;
    -- DELETE FROM public.suppliers WHERE organization_id != hq_id; -- Tabla no existe aún
    
    -- FINALMENTE: Las Organizaciones
    DELETE FROM public.organizations WHERE id != hq_id;

    RAISE NOTICE 'LIMPIEZA TOTAL EXITOSA.';
END $$;
