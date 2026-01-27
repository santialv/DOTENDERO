-- Type for input items
DO $$ BEGIN
    CREATE TYPE public.invoice_item_input AS (
        product_id UUID,
        quantity NUMERIC,
        unit_price NUMERIC,
        subtotal NUMERIC
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Main Function
CREATE OR REPLACE FUNCTION public.process_sale(
    p_org_id UUID,
    p_user_id UUID,
    p_invoice_number INT,
    p_customer_id UUID,
    p_total NUMERIC,
    p_payment_method TEXT,
    p_items JSONB -- Array of objects
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
        created_at
    ) VALUES (
        p_org_id,
        p_user_id,
        p_customer_id,
        p_invoice_number,
        p_total,
        p_payment_method,
        'paid', -- Default to paid, handled by frontend logic for now
        NOW()
    ) RETURNING id INTO v_invoice_id;

    -- 2. Process Items
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        v_product_id := (v_item->>'product_id')::UUID;
        v_quantity := (v_item->>'quantity')::NUMERIC;
        v_unit_price := (v_item->>'unit_price')::NUMERIC;
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
            organization_id, -- Redundant but good for partitioning/RLS
            product_name -- Snapshot name in case it changes? For now relation is fine, or fetch name.
            -- Simplifying schema match. Assuming invoice_items has these cols.
        ) VALUES (
            v_invoice_id,
            v_product_id,
            v_quantity,
            v_unit_price,
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
        -- Update customer balance (Assuming 'balance' column exists on customers or separate ledger)
        -- Let's assume 'customers' table has 'balance' or equivalent.
        -- If not, we might fail here. Let's try standard update.
        UPDATE public.customers
        SET current_debt = COALESCE(current_debt, 0) + p_total
        WHERE id = p_customer_id;
        
        -- Also set invoice status to 'pending' if credit?
        UPDATE public.invoices SET status = 'pending' WHERE id = v_invoice_id;
    END IF;

    RETURN v_invoice_id;

EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Transaction Failed: %', SQLERRM;
END;
$$;
