-- Updated Process Sale RPC with Shift Support
CREATE OR REPLACE FUNCTION public.process_sale(
    p_org_id UUID,
    p_user_id UUID,
    p_invoice_number INT,
    p_customer_id UUID,
    p_total NUMERIC,
    p_payment_method TEXT,
    p_items JSONB, -- Array of objects
    p_shift_id UUID DEFAULT NULL -- Added shift_id
)
RETURNS UUID -- Returns the new Invoice ID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_invoice_id UUID;
    v_item JSONB;
    v_product_id UUID;
    v_quantity NUMERIC;
    v_unit_price NUMERIC;
    v_subtotal NUMERIC;
    v_cost NUMERIC;
BEGIN
    -- 1. Create Invoice
    INSERT INTO public.invoices (
        organization_id,
        seller_id,
        customer_id,
        invoice_number,
        total,
        payment_method,
        status,
        created_at,
        shift_id -- Track the shift
    ) VALUES (
        p_org_id,
        p_user_id,
        p_customer_id,
        p_invoice_number,
        p_total,
        p_payment_method,
        'paid', 
        NOW(),
        p_shift_id
    ) RETURNING id INTO v_invoice_id;

    -- 2. Process Items
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        v_product_id := (v_item->>'product_id')::UUID;
        v_quantity := (v_item->>'quantity')::NUMERIC;
        v_unit_price := (v_item->>'price')::NUMERIC; -- Support both 'price' and 'unit_price' if needed, mapping to schema
        v_subtotal := (v_item->>'subtotal')::NUMERIC;

        -- Get current cost for profit calculation
        SELECT cost INTO v_cost FROM public.products WHERE id = v_product_id;

        -- Insert Item
        INSERT INTO public.invoice_items (
            invoice_id,
            product_id,
            quantity,
            unit_price,
            subtotal,
            unit_cost,
            organization_id, 
            product_name 
        ) VALUES (
            v_invoice_id,
            v_product_id,
            v_quantity,
            COALESCE(v_unit_price, 0),
            v_subtotal,
            COALESCE(v_cost, 0),
            p_org_id,
            (SELECT name FROM public.products WHERE id = v_product_id)
        );

        -- 3. Update Inventory
        UPDATE public.products
        SET stock = stock - v_quantity
        WHERE id = v_product_id;
        
    END LOOP;

    -- 4. Handle Credit (Fiado)
    IF p_payment_method = 'credit' AND p_customer_id IS NOT NULL THEN
        UPDATE public.customers
        SET current_debt = COALESCE(current_debt, 0) + p_total
        WHERE id = p_customer_id;
        
        UPDATE public.invoices SET status = 'pending' WHERE id = v_invoice_id;
    END IF;

    RETURN v_invoice_id;

EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Transaction Failed: %', SQLERRM;
END;
$$;
