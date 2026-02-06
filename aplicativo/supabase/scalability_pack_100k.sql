-- ==============================================================================
-- PAQUETE DE ESCALABILIDAD DONTENDERO (100K USUARIOS)
-- Objetivo: Optimizar consultas críticas y búsquedas de texto.
-- ==============================================================================

-- 1. Habilitar extensión pg_trgm para búsquedas de texto ultra rápidas (fuzzy search)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. ÍNDICES ESTRATÉGICOS
-- Evitan "Sequential Scans" que matan la CPU cuando la tabla crece.

-- A. Búsqueda de Productos (Vital para el POS)
-- Permite buscar 'arroz' o '770' instantáneamente sin recorrer toda la tabla.
CREATE INDEX IF NOT EXISTS idx_products_search_trgm 
ON products 
USING GIN (name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_products_barcode 
ON products (barcode);

-- B. Filtros Comunes de Inventario
-- Acelera: "Dame todos los productos activos de esta categoría"
CREATE INDEX IF NOT EXISTS idx_products_org_status_category 
ON products (organization_id, status, category);

-- C. Ventas e Historial (Facturas)
-- Acelera: "Ventas del día" y reportes.
CREATE INDEX IF NOT EXISTS idx_invoices_org_date 
ON invoices (organization_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id 
ON invoice_items (invoice_id);

-- D. Clientes
-- Acelera la búsqueda de clientes en el POS.
CREATE INDEX IF NOT EXISTS idx_customers_search 
ON customers 
USING GIN (full_name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_customers_identification 
ON customers (document_number);

-- 3. FUNCIÓN RPC OPTIMIZADA PARA ESTADÍSTICAS
-- Reemplaza la lógica lenta del frontend. Calcula todo en DB en una sola pasada.

CREATE OR REPLACE FUNCTION get_inventory_stats_v2(org_id UUID)
RETURNS TABLE (
    total_products BIGINT,
    total_value NUMERIC,
    low_stock_count BIGINT,
    inactive_count BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) AS total_products,
        COALESCE(SUM(stock * cost), 0) AS total_value,
        COUNT(*) FILTER (WHERE stock <= min_stock AND status = 'active') AS low_stock_count,
        COUNT(*) FILTER (WHERE status = 'inactive') AS inactive_count
    FROM products
    WHERE organization_id = org_id;
END;
$$;

-- 4. FUNCIÓN ULTRARÁPIDA PARA CATEGORÍAS ÚNICAS
-- Evita traer duplicados.
CREATE OR REPLACE FUNCTION get_unique_categories(p_org_id UUID)
RETURNS TABLE (category TEXT) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT p.category
    FROM products p
    WHERE p.organization_id = p_org_id
    AND p.status = 'active'
    ORDER BY p.category;
END;
$$;

-- 5. MANTENIMIENTO PREVENTIVO (Comentario)
-- Supabase ejecuta autovacuum, pero estos índices mantendrán las consultas rápidas.
-- Recomendar correr: ANALYZE products; ANALYZE invoices; después de cargar datos masivos.
