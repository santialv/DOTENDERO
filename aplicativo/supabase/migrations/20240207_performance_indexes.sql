-- OPTIMIZACIÓN DE RENDIMIENTO DONTENDERO
-- Ejecutar en Supabase SQL Editor

-- 1. Transacciones (Facturas y Gastos)
-- Acelera el Dashboard y Reportes de Caja al filtrar por fecha y tienda.
CREATE INDEX IF NOT EXISTS idx_invoices_org_date ON invoices(organization_id, date);
CREATE INDEX IF NOT EXISTS idx_expenses_org_date ON expenses(organization_id, date);

-- 2. Búsquedas de Productos
-- Acelera el POS y el Inventario al buscar por nombre o código de barras.
CREATE INDEX IF NOT EXISTS idx_products_org_search ON products(organization_id, name);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);

-- 3. Clientes
-- Acelera la búsqueda de clientes en el POS.
CREATE INDEX IF NOT EXISTS idx_customers_org_search ON customers(organization_id, name);
CREATE INDEX IF NOT EXISTS idx_customers_nit ON customers(document_number);

-- 4. Turnos de Caja
-- Acelera el historial de turnos.
CREATE INDEX IF NOT EXISTS idx_cash_shifts_org_date ON cash_shifts(organization_id, start_time);

-- 5. Movimientos de Inventario (Kardex)
-- Vital para que el reporte de movimientos no se vuelva lento con el tiempo.
CREATE INDEX IF NOT EXISTS idx_inventory_moves_product_date ON inventory_movements(product_id, created_at);

-- Comentario:
-- Estos índices hacen que las consultas pasen de complejidad O(N) (leer todo) a O(log N) (búsqueda binaria).
-- Con 1 millón de registros, la diferencia es de 1 segundo vs 0.001 segundos.
