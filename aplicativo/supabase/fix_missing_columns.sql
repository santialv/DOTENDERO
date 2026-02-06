-- Solo ejecutar estas lineas para corregir la tabla invoices

ALTER TABLE invoices ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

ALTER TABLE invoices ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id);

ALTER TABLE invoices ADD COLUMN IF NOT EXISTS shift_id UUID;
