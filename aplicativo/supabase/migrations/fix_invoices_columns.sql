-- Add missing columns to INVOICES table to support the new POS logic
DO $$ 
BEGIN 
    -- 1. subtotal
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'subtotal') THEN
        ALTER TABLE invoices ADD COLUMN subtotal NUMERIC DEFAULT 0;
    END IF;

    -- 2. tax_total
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'tax_total') THEN
        ALTER TABLE invoices ADD COLUMN tax_total NUMERIC DEFAULT 0;
    END IF;

    -- 3. seller_id (User who made the sale)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'seller_id') THEN
        ALTER TABLE invoices ADD COLUMN seller_id UUID REFERENCES auth.users(id);
    END IF;

    -- 4. payment_method (Sometimes text array or simple text, ensuring it exists as text for the summary)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'payment_method') THEN
        ALTER TABLE invoices ADD COLUMN payment_method TEXT;
    END IF;
END $$;
