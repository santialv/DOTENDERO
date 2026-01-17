-- Función para obtener los productos más vendidos para el POS
-- Optimiza la carga inicial mostrando solo los productos más populares

CREATE OR REPLACE FUNCTION get_top_products_for_pos(
    p_org_id UUID,
    p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
    product_id TEXT,
    total_quantity NUMERIC,
    total_revenue NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ii.product_id::TEXT,
        CAST(SUM(ii.quantity) AS NUMERIC) as total_quantity,
        CAST(SUM(ii.subtotal) AS NUMERIC) as total_revenue
    FROM invoice_items ii
    INNER JOIN invoices i ON i.id = ii.invoice_id
    WHERE i.organization_id = p_org_id
    AND i.status <> 'cancelled'
    AND i.date >= NOW() - INTERVAL '90 days' -- Last 3 months
    GROUP BY ii.product_id
    ORDER BY total_quantity DESC
    LIMIT p_limit;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_top_products_for_pos(UUID, INTEGER) TO authenticated;
