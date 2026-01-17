-- Drop existing functions to avoid conflict
DROP FUNCTION IF EXISTS get_monthly_sales_stats(uuid, int, int);
DROP FUNCTION IF EXISTS get_dashboard_kpis(uuid);
DROP FUNCTION IF EXISTS get_top_selling_products(uuid);

-- 1. Fixed Monthly Sales Stats
CREATE OR REPLACE FUNCTION get_monthly_sales_stats(p_org_id uuid, p_start_year int, p_end_year int)
RETURNS TABLE (
    year int,
    month int,
    total numeric
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        EXTRACT(YEAR FROM date)::int as year,
        EXTRACT(MONTH FROM date)::int as month,
        COALESCE(SUM(i.total), 0) as total
    FROM invoices i
    WHERE i.organization_id = p_org_id
    AND EXTRACT(YEAR FROM i.date) BETWEEN p_start_year AND p_end_year
    GROUP BY 1, 2
    ORDER BY 1, 2;
END;
$$ LANGUAGE plpgsql;

-- 2. Fixed Dashboard KPIs
CREATE OR REPLACE FUNCTION get_dashboard_kpis(p_org_id uuid)
RETURNS TABLE (
    revenue numeric,
    revenueGrowth numeric,
    profit numeric,
    profitGrowth numeric,
    ticket numeric,
    ticketGrowth numeric
) AS $$
DECLARE
    current_month_start timestamp;
    last_month_start timestamp;
    
    current_rev numeric;
    last_rev numeric;
    
    current_prof numeric;
    last_prof numeric;
    
    current_count int;
    last_count int;
BEGIN
    current_month_start := date_trunc('month', now());
    last_month_start := date_trunc('month', now() - interval '1 month');
    
    -- Revenue
    SELECT COALESCE(SUM(total), 0), COUNT(*)
    INTO current_rev, current_count
    FROM invoices 
    WHERE organization_id = p_org_id 
    AND date >= current_month_start;
    
    SELECT COALESCE(SUM(total), 0), COUNT(*)
    INTO last_rev, last_count
    FROM invoices 
    WHERE organization_id = p_org_id 
    AND date >= last_month_start 
    AND date < current_month_start;

    -- Profit (Approximation: 20% margin if no cost data, implies simplified view)
    -- In real app, sum (total - total_cost). Assuming 20% margin for robust fallback
    current_prof := current_rev * 0.2;
    last_prof := last_rev * 0.2;

    -- Return row
    RETURN QUERY SELECT 
        current_rev,
        CASE WHEN last_rev = 0 THEN 0 ELSE ((current_rev - last_rev) / last_rev) * 100 END,
        current_prof,
        CASE WHEN last_prof = 0 THEN 0 ELSE ((current_prof - last_prof) / last_prof) * 100 END,
        CASE WHEN current_count = 0 THEN 0::numeric else (current_rev / current_count) END,
        0::numeric; -- Simplified ticket growth
END;
$$ LANGUAGE plpgsql;

-- 3. Top Products (By Quantity or Revenue)
CREATE OR REPLACE FUNCTION get_top_selling_products(p_org_id uuid)
RETURNS TABLE (
    product_name text,
    value numeric -- Can be quantity or total revenue
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ii.product_name,
        SUM(ii.quantity)::numeric as value
    FROM invoice_items ii
    JOIN invoices i ON i.id = ii.invoice_id
    WHERE i.organization_id = p_org_id
    GROUP BY ii.product_name
    ORDER BY value DESC
    LIMIT 5;
END;
$$ LANGUAGE plpgsql;
