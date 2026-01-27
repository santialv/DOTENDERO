-- MASTER FIX: Add all potentially missing columns for sales logic

-- 1. Fix Invoices
ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS invoice_number INTEGER,
ADD COLUMN IF NOT EXISTS payment_method TEXT,
ADD COLUMN IF NOT EXISTS seller_id UUID,
ADD COLUMN IF NOT EXISTS customer_id UUID,
ADD COLUMN IF NOT EXISTS organization_id UUID;

-- 2. Fix Invoice Items
ALTER TABLE public.invoice_items
ADD COLUMN IF NOT EXISTS unit_cost NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS product_name TEXT,
ADD COLUMN IF NOT EXISTS organization_id UUID;

-- 3. Fix Customers
ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS current_debt NUMERIC DEFAULT 0;

-- 4. Fix Products
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS cost NUMERIC DEFAULT 0;

-- 5. Fix Organizations (Subscriptions)
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS plan_expiry TIMESTAMPTZ;

-- Re-Apply RPC (In case it was created before columns existed)
-- (Copy logic from create_rpc_process_sale.sql here if executing manually)
