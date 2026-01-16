-- FIX CRITICAL ERROR: Add missing unit_price and others to invoice_items
DO $$ 
BEGIN 
    -- 1. FIX INVOICE_ITEMS
    
    -- organization_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoice_items' AND column_name = 'organization_id') THEN
        ALTER TABLE invoice_items ADD COLUMN organization_id UUID REFERENCES organizations(id);
    END IF;

    -- unit_price (El error actual)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoice_items' AND column_name = 'unit_price') THEN
        ALTER TABLE invoice_items ADD COLUMN unit_price NUMERIC DEFAULT 0;
    END IF;

    -- unit_cost
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoice_items' AND column_name = 'unit_cost') THEN
        ALTER TABLE invoice_items ADD COLUMN unit_cost NUMERIC DEFAULT 0;
    END IF;
    
    -- subtotal (Por si acaso falta también)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoice_items' AND column_name = 'subtotal') THEN
        ALTER TABLE invoice_items ADD COLUMN subtotal NUMERIC DEFAULT 0;
    END IF;

    -- product_name (A veces falta si la tabla era muy vieja)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoice_items' AND column_name = 'product_name') THEN
        ALTER TABLE invoice_items ADD COLUMN product_name TEXT;
    END IF;

    -- quantity
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoice_items' AND column_name = 'quantity') THEN
        ALTER TABLE invoice_items ADD COLUMN quantity INTEGER DEFAULT 1;
    END IF;

END $$;
