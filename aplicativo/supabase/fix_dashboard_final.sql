-- ==========================================
-- FINAL DASHBOARD FIX SCRIPT
-- Run this entire script in Supabase SQL Editor
-- ==========================================

-- 1. DROP Existing Functions to avoid return type errors
DROP FUNCTION IF EXISTS get_dashboard_stats(UUID);
DROP FUNCTION IF EXISTS get_low_stock_products(UUID);

-- 2. Create get_dashboard_stats (Version 2 - Real Profit & Top Products)
CREATE OR REPLACE FUNCTION get_dashboard_stats(p_org_id UUID)
RETURNS TABLE (
    sales_today NUMERIC,
    transactions_today INTEGER,
    profit_today NUMERIC,
    avg_ticket NUMERIC,
    low_stock_count INTEGER,
    top_products JSONB
) LANGUAGE plpgsql AS $$
DECLARE
    v_start_day TIMESTAMP WITH TIME ZONE;
    v_end_day   TIMESTAMP WITH TIME ZONE;
BEGIN
    v_start_day := date_trunc('day', now());
    v_end_day   := date_trunc('day', now()) + interval '1 day';

    RETURN QUERY
    WITH daily_invoices AS (
        SELECT id, total
        FROM invoices
        WHERE organization_id = p_org_id
        AND created_at >= v_start_day 
        AND created_at < v_end_day
        AND status = 'paid'
    ),
    sales_metrics AS (
        SELECT 
            COALESCE(SUM(total), 0) as total_sales,
            COUNT(*) as tx_count
        FROM daily_invoices
    ),
    profit_metrics AS (
        SELECT 
            COALESCE(SUM((unit_price - COALESCE(unit_cost, 0)) * quantity), 0) as total_profit
        FROM invoice_items ii
        JOIN daily_invoices di ON ii.invoice_id = di.id
        WHERE ii.organization_id = p_org_id
    ),
    stock_metrics AS (
        SELECT COUNT(*)::integer as low_stock 
        FROM products 
        WHERE organization_id = p_org_id 
        AND status = 'active'
        AND stock <= min_stock
    ),
    top_selling AS (
        SELECT 
            jsonb_agg(sub) as top_prods
        FROM (
            SELECT 
                ii.product_name, 
                SUM(ii.quantity) as total_qty,
                SUM(ii.subtotal) as total_rev
            FROM invoice_items ii
            JOIN daily_invoices di ON ii.invoice_id = di.id
            WHERE ii.organization_id = p_org_id
            GROUP BY ii.product_name
            ORDER BY total_qty DESC
            LIMIT 5
        ) sub
    )
    SELECT 
        sm.total_sales,
        sm.tx_count::integer,
        pm.total_profit,
        CASE 
            WHEN sm.tx_count > 0 THEN sm.total_sales / sm.tx_count 
            ELSE 0 
        END as avg_ticket,
        st.low_stock,
        COALESCE(ts.top_prods, '[]'::jsonb)
    FROM sales_metrics sm, profit_metrics pm, stock_metrics st, top_selling ts;
END;
$$;

-- 3. Create get_low_stock_products (Missing Function Fix)
CREATE OR REPLACE FUNCTION get_low_stock_products(p_org_id UUID)
RETURNS TABLE (
    id UUID,
    name TEXT,
    stock INTEGER, -- Changed to INTEGER to match definition better
    min_stock INTEGER
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        p.stock::INTEGER,
        p.min_stock::INTEGER
    FROM products p
    WHERE p.organization_id = p_org_id 
    AND p.status = 'active'
    AND p.stock <= p.min_stock
    ORDER BY p.stock ASC
    LIMIT 20;
END;
$$;
