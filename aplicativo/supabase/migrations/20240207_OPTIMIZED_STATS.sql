-- ==============================================================================
-- DONTENDERO: PERFORMANCE PACK (INDICES + MATERIALIZED VIEWS)
-- ==============================================================================
-- Instrucciones: Copia y pega todo este contenido en el SQL Editor de Supabase.
-- ==============================================================================

-- 1. INDICES DE BÚSQUEDA RÁPIDA (Performance Inmediato)
-- ==============================================================================

-- Acelerar filtrado de facturas/gastos por fecha en Dashboards
CREATE INDEX IF NOT EXISTS idx_invoices_org_date_status ON invoices(organization_id, date, status);
CREATE INDEX IF NOT EXISTS idx_expenses_org_date ON expenses(organization_id, date);

-- Acelerar búsqueda de Productos (Barcode y Nombre) en POS
CREATE INDEX IF NOT EXISTS idx_products_search_composite ON products(organization_id, name text_pattern_ops);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);

-- Acelerar búsqueda de Clientes en POS
CREATE INDEX IF NOT EXISTS idx_customers_search_composite ON customers(organization_id, full_name text_pattern_ops);
CREATE INDEX IF NOT EXISTS idx_customers_doc ON customers(document_number);

-- Acelerar Historial de Turnos y Cajas
CREATE INDEX IF NOT EXISTS idx_cash_shifts_org_start ON cash_shifts(organization_id, start_time DESC);

-- Acelerar Kardex de Inventario (Movimientos)
-- (Tabla no existe en esquema actual, omitiendo optimización de movimientos)
-- CREATE INDEX ...


-- 2. VISTA MATERIALIZADA DE VENTAS (Analytics Avanzado)
-- ==============================================================================
-- Esta vista guarda el resultado de la suma de ventas por día.
-- El Dashboard consultará esto en lugar de sumar millones de filas.

CREATE MATERIALIZED VIEW IF NOT EXISTS analytics_daily_sales AS
SELECT
    organization_id,
    DATE(date) as day,
    COUNT(*) as total_transactions,
    SUM(total) as total_revenue
FROM invoices
WHERE status = 'paid' -- Solo ventas pagadas
GROUP BY organization_id, DATE(date)
ORDER BY day DESC;

-- Índice para que consultar esta vista sea instantáneo (O(1))
CREATE UNIQUE INDEX IF NOT EXISTS idx_mat_sales_org_day ON analytics_daily_sales(organization_id, day);


-- 3. FUNCIÓN DE ACTUALIZACIÓN
-- ==============================================================================
-- Llama a esta función para actualizar los datos de la vista materializada.
-- Puedes configurarla en un Cron Job o llamarla tras cerrar caja.

CREATE OR REPLACE FUNCTION refresh_analytics_sales()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY analytics_daily_sales;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- FIN DEL SCRIPT
-- ==============================================================================
