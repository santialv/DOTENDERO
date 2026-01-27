-- Add missing columns to invoices table to match the process_sale logic
ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS invoice_number INTEGER,
ADD COLUMN IF NOT EXISTS payment_method TEXT,
ADD COLUMN IF NOT EXISTS seller_id UUID REFERENCES auth.users(id);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_invoices_number ON public.invoices(invoice_number);
