-- Script definitivo para arreglar tabla Invoices de una vez por todas
-- Agrega todas las columnas que usa el sistema POS si no existen

ALTER TABLE invoices ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'sale';
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id); 
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS period_number INT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS shift_id UUID;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'Efectivo';
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'paid';
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS total NUMERIC DEFAULT 0;

-- Asegurar indices básicos para que no vaya lento
CREATE INDEX IF NOT EXISTS idx_invoices_type ON invoices(type);
