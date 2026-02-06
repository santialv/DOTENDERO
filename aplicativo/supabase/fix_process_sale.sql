-- ==============================================================================
-- REPARACIÓN PROCESO DE VENTA (POS)
-- Objetivo: Crear/Reemplazar la función RPC process_sale con la firma exacta que usa el Frontend.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.process_sale(
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
    v_type TEXT := 'sale';
BEGIN
    -- 1. Insertar Factura (Cabecera)
    INSERT INTO invoices (
        organization_id,
        user_id, -- Vendedor que hizo la venta
        customer_id,
        period_number, -- Mapeado desde invoice_number (frontend counter)
        total,
        status, -- 'paid'
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

    -- 2. Procesar Items (Detalle)
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        -- a. Insertar Detalle
        INSERT INTO invoice_items (
            invoice_id,
            product_id,
            quantity,
            unit_price,
            organization_id, -- Denormalizado para RLS/Queries rápidos
            subtotal
        ) VALUES (
            v_invoice_id,
            (v_item->>'product_id')::UUID,
            (v_item->>'quantity')::NUMERIC,
            (v_item->>'unit_price')::NUMERIC,
            p_org_id,
            (v_item->>'subtotal')::NUMERIC
        );

        -- b. Descontar Inventario
        UPDATE products
        SET stock = stock - (v_item->>'quantity')::NUMERIC
        WHERE id = (v_item->>'product_id')::UUID
          AND organization_id = p_org_id;
          
    END LOOP;

    RETURN v_invoice_id;

EXCEPTION WHEN OTHERS THEN
    -- Propagar error para que el Frontend lo vea
    RAISE EXCEPTION 'Error procesando venta: %', SQLERRM;
END;
$$;

-- Permisos
GRANT EXECUTE ON FUNCTION public.process_sale TO authenticated;
GRANT EXECUTE ON FUNCTION public.process_sale TO service_role;
