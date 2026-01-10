-- PERFORMANCE INDEXES FOR MULTI-TENANCY SCALING (1000+ Stores)
-- Run this script in Supabase SQL Editor to improve query speed immediately.

-- 1. Products (Search & POS)
-- Speeds up: POS product search by name/barcode within an organization.
CREATE INDEX IF NOT EXISTS idx_products_org_search ON products (organization_id, name, barcode);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products (barcode); -- Global lookup if needed, but usually filtered by org

-- 2. Sales / Invoices (Reports & Dashboard)
-- Speeds up: Dashboard charts, "Sales of the Month", historical reports.
-- Including 'date' and 'status' covers 90% of report queries.
CREATE INDEX IF NOT EXISTS idx_invoices_org_date ON invoices (organization_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_org_status ON invoices (organization_id, status);

-- 3. Inventory Movements (Kardex)
-- Speeds up: Viewing product history in "Kardex". Crucial as this table grows fastest.
CREATE INDEX IF NOT EXISTS idx_movements_org_product ON movements (organization_id, product_id, created_at DESC);

-- 4. Customers (CRM & POS)
-- Speeds up: Analyzing who owes money ("Cuantas por Cobrar") and search at POS.
CREATE INDEX IF NOT EXISTS idx_customers_org_debt ON customers (organization_id, current_debt DESC);
CREATE INDEX IF NOT EXISTS idx_customers_org_search ON customers (organization_id, full_name, document_number);

-- 5. Purchases (Expenses)
-- Speeds up: Purchase history view.
CREATE INDEX IF NOT EXISTS idx_purchases_org_date ON purchases (organization_id, date DESC);

-- 6. Expenses (Financial Reports)
-- Speeds up: P&L reports.
CREATE INDEX IF NOT EXISTS idx_expenses_org_date ON expenses (organization_id, date DESC);

-- 7. Organizations (Config Load)
-- Speeds up: Initial app load (useConfiguration hook).
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles (id);
-- profiles.id is usually PK so it's indexed, but organization_id lookup helps.
CREATE INDEX IF NOT EXISTS idx_profiles_org_id ON profiles (organization_id);
