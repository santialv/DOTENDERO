DROP FUNCTION IF EXISTS public.get_dashboard_stats(UUID);

CREATE OR REPLACE FUNCTION public.get_dashboard_stats(p_org_id UUID)
RETURNS TABLE (
    sales_today NUMERIC,
    transactions_today BIGINT,
    profit_today NUMERIC,
    avg_ticket NUMERIC,
    low_stock_count BIGINT,
    top_products JSONB
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH daily_sales AS (
        SELECT 
            COALESCE(SUM(total), 0) as total_sales,
            COUNT(*) as tx_count
        FROM invoices
        WHERE organization_id = p_org_id
        AND created_at >= CURRENT_DATE
        AND status = 'paid'
    ),
    daily_profit AS (
        SELECT 
            COALESCE(SUM( (ii.unit_price - COALESCE(ii.unit_cost, 0)) * ii.quantity ), 0) as profit
        FROM invoice_items ii
        JOIN invoices i ON i.id = ii.invoice_id
        WHERE i.organization_id = p_org_id
        AND i.created_at >= CURRENT_DATE
        AND i.status = 'paid'
    ),
    low_stock AS (
        SELECT COUNT(*) as ls_count
        FROM products
        WHERE organization_id = p_org_id
        AND stock <= min_stock
        AND status = 'active'
    ),
    top_prod AS (
        SELECT jsonb_agg(t) as products
        FROM (
            SELECT 
                COALESCE(p.name, 'Producto desconocido') as name, 
                SUM(ii.quantity) as qty, 
                SUM(ii.subtotal) as total
            FROM invoice_items ii
            JOIN invoices i ON i.id = ii.invoice_id
            -- Usamos LEFT JOIN para que si el producto fue borrado, no desaparezca la venta del reporte
            LEFT JOIN products p ON p.id = ii.product_id
            WHERE i.organization_id = p_org_id
            GROUP BY p.name
            ORDER BY qty DESC
            LIMIT 5
        ) t
    )
    SELECT
        ds.total_sales,
        ds.tx_count,
        dp.profit,
        CASE WHEN ds.tx_count > 0 THEN ds.total_sales / ds.tx_count ELSE 0 END,
        ls.ls_count,
        COALESCE(tp.products, '[]'::jsonb)
    FROM daily_sales ds
    CROSS JOIN daily_profit dp
    CROSS JOIN low_stock ls
    CROSS JOIN top_prod tp;
END;
$$;
