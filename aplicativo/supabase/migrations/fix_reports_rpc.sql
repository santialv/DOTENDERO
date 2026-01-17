-- Drop them all first to ensure clean slate
DROP FUNCTION IF EXISTS get_monthly_sales_stats(uuid, int, int);
DROP FUNCTION IF EXISTS get_dashboard_kpis(uuid);
DROP FUNCTION IF EXISTS get_top_selling_products(uuid);
DROP FUNCTION IF EXISTS get_top_products_stats(uuid); -- Old one removal

-- 1. Monthly Stats (Explicit types)
CREATE OR REPLACE FUNCTION get_monthly_sales_stats(p_org_id uuid, p_start_year int, p_end_year int)
RETURNS TABLE (
    year integer,
    month integer,
    total numeric
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        CAST(EXTRACT(YEAR FROM date) AS integer) as year,
        CAST(EXTRACT(MONTH FROM date) AS integer) as month,
        CAST(COALESCE(SUM(i.total), 0) AS numeric) as total
    FROM invoices i
    WHERE i.organization_id = p_org_id
    AND EXTRACT(YEAR FROM i.date) BETWEEN p_start_year AND p_end_year
    GROUP BY 1, 2
    ORDER BY 1, 2;
END;
$$ LANGUAGE plpgsql;

-- 2. Dashboard KPIs
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
    current_rev numeric := 0;
    last_rev numeric := 0;
    current_prof numeric := 0;
    last_prof numeric := 0;
    current_count int := 0;
    last_count int := 0;
BEGIN
    current_month_start := date_trunc('month', now());
    last_month_start := date_trunc('month', now() - interval '1 month');
    
    -- Current Month
    SELECT COALESCE(SUM(total), 0), COUNT(*)
    INTO current_rev, current_count
    FROM invoices 
    WHERE organization_id = p_org_id 
    AND date >= current_month_start;
    
    -- Last Month
    SELECT COALESCE(SUM(total), 0), COUNT(*)
    INTO last_rev, last_count
    FROM invoices 
    WHERE organization_id = p_org_id 
    AND date >= last_month_start 
    AND date < current_month_start;

    -- Calculate Profits (20% margin assumption for now)
    current_prof := current_rev * 0.2;
    last_prof := last_rev * 0.2;

    -- Return row with Zero Division Safety
    RETURN QUERY SELECT 
        current_rev,
        CASE WHEN last_rev = 0 THEN 0::numeric ELSE ((current_rev - last_rev) / last_rev) * 100 END,
        current_prof,
        CASE WHEN last_prof = 0 THEN 0::numeric ELSE ((current_prof - last_prof) / last_prof) * 100 END,
        CASE WHEN current_count = 0 THEN 0::numeric else (current_rev / current_count) END,
        0::numeric;
END;
$$ LANGUAGE plpgsql;

-- 3. Top Products
CREATE OR REPLACE FUNCTION get_top_selling_products(p_org_id uuid)
RETURNS TABLE (
    product_name text,
    value numeric
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        CAST(ii.product_name AS text),
        CAST(SUM(ii.quantity) AS numeric) as value
    FROM invoice_items ii
    JOIN invoices i ON i.id = ii.invoice_id
    WHERE i.organization_id = p_org_id
    GROUP BY ii.product_name
    ORDER BY value DESC
    LIMIT 5;
END;
$$ LANGUAGE plpgsql;
