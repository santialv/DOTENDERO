-- ==============================================================================
-- REPARACIÓN PROCESO DE VENTA (POS) - VERSIÓN CON PRODUCT_NAME
-- Objetivo: Incluir el nombre del producto en invoice_items para cumplir restricción NOT NULL
-- ==============================================================================

-- 1. LIMPIEZA: Borrar versiones anteriores
DO $$ 
DECLARE 
    r RECORD; 
BEGIN 
    FOR r IN SELECT oid::regprocedure AS func_signature 
             FROM pg_proc 
             WHERE proname = 'process_sale' 
             AND pronamespace = 'public'::regnamespace 
    LOOP 
        EXECUTE 'DROP FUNCTION ' || r.func_signature || ' CASCADE'; 
    END LOOP; 
END $$;

-- 2. CREACIÓN: Definir la función correcta
CREATE FUNCTION public.process_sale(
    p_org_id UUID,
    p_user_id UUID,
    p_invoice_number INT,
    p_customer_id UUID,
    p_total NUMERIC,
    p_payment_method TEXT,
    p_items JSONB,
    p_shift_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_invoice_id UUID;
    v_item JSONB;
BEGIN
    -- a. Insertar Factura (Cabecera)
    INSERT INTO invoices (
        organization_id,
        user_id,
        customer_id,
        period_number,
        total,
        status,
        payment_method,
        shift_id,
        type,
        created_at
    ) VALUES (
        p_org_id,
        p_user_id,
        p_customer_id,
        p_invoice_number,
        p_total,
        'paid',
        p_payment_method,
        p_shift_id,
        'sale',
        NOW()
    )
    RETURNING id INTO v_invoice_id;

    -- b. Procesar Items (Detalle)
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        -- Insertar Detalle (INCLUYENDO product_name)
        INSERT INTO invoice_items (
            invoice_id,
            product_id,
            product_name, -- CAMPO REQUERIDO
            quantity,
            unit_price,
            organization_id,
            subtotal
        ) VALUES (
            v_invoice_id,
            (v_item->>'product_id')::UUID,
            COALESCE(v_item->>'name', 'Producto Sin Nombre'), -- Fallback de seguridad
            (v_item->>'quantity')::NUMERIC,
            (v_item->>'unit_price')::NUMERIC,
            p_org_id,
            (v_item->>'subtotal')::NUMERIC
        );

        -- Descontar Inventario
        UPDATE products
        SET stock = stock - (v_item->>'quantity')::NUMERIC
        WHERE id = (v_item->>'product_id')::UUID
          AND organization_id = p_org_id;
    END LOOP;

    RETURN v_invoice_id;
EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Error procesando venta: %', SQLERRM;
END;
$$;

-- 3. PERMISOS
GRANT EXECUTE ON FUNCTION public.process_sale TO authenticated;
GRANT EXECUTE ON FUNCTION public.process_sale TO service_role;
