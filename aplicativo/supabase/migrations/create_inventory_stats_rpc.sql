CREATE OR REPLACE FUNCTION get_inventory_stats_v2(org_id UUID)
RETURNS TABLE (
  total_products BIGINT,
  total_value NUMERIC,
  low_stock_count BIGINT,
  inactive_count BIGINT
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_products,
    COALESCE(SUM(cost * stock), 0)::NUMERIC as total_value,
    COUNT(*) FILTER (WHERE stock <= min_stock AND status = 'active')::BIGINT as low_stock_count,
    COUNT(*) FILTER (WHERE status = 'inactive')::BIGINT as inactive_count
  FROM products
  WHERE organization_id = org_id;
END;
$$;

GRANT EXECUTE ON FUNCTION get_inventory_stats_v2(UUID) TO authenticated;
