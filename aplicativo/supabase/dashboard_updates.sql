-- RPC to get low stock products
CREATE OR REPLACE FUNCTION get_low_stock_products(p_org_id UUID)
RETURNS TABLE (
    id UUID,
    name TEXT,
    stock NUMERIC,
    min_stock NUMERIC
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        p.stock,
        p.min_stock
    FROM products p
    WHERE p.organization_id = p_org_id 
    AND p.status = 'active'
    AND p.stock <= p.min_stock
    ORDER BY p.stock ASC
    LIMIT 20; -- Show top 20 most critical
END;
$$;
