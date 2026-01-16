-- OPTIMIZACIÓN ANALÍTICA Y DASHBOARD (100k USUARIOS)
-- Este script mueve la carga de procesamiento de reportes del cliente al servidor.

-- 1. KPI PRINCIPALES DEL DASHBOARD
-- Calcula Ventas Mes Actual vs Anterior y Crecimiento %
CREATE OR REPLACE FUNCTION get_dashboard_kpis(p_org_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_current_month_total NUMERIC := 0;
    v_last_month_total NUMERIC := 0;
    v_revenue_growth NUMERIC := 0;
    
    v_current_count INTEGER := 0;
    v_last_count INTEGER := 0;
    
    v_current_ticket NUMERIC := 0;
    v_last_ticket NUMERIC := 0;
    v_ticket_growth NUMERIC := 0;

    v_current_profit NUMERIC := 0;
    v_last_profit NUMERIC := 0;
    v_profit_growth NUMERIC := 0;

    -- Fechas
    v_now TIMESTAMP := NOW();
    v_start_month TIMESTAMP := date_trunc('month', v_now);
    v_start_last_month TIMESTAMP := date_trunc('month', v_now - INTERVAL '1 month');
    v_end_last_month TIMESTAMP := date_trunc('month', v_now) - INTERVAL '1 second';
BEGIN
    -- 1. Totales Mes Actual
    SELECT 
        COALESCE(SUM(total), 0),
        COUNT(*)
    INTO v_current_month_total, v_current_count
    FROM invoices 
    WHERE organization_id = p_org_id 
    AND date >= v_start_month 
    AND status <> 'cancelled';

    -- 2. Totales Mes Anterior
    SELECT 
        COALESCE(SUM(total), 0),
        COUNT(*)
    INTO v_last_month_total, v_last_count
    FROM invoices 
    WHERE organization_id = p_org_id 
    AND date >= v_start_last_month AND date <= v_end_last_month
    AND status <> 'cancelled';

    -- 3. Margen Real (Usando Invoice Items y Costo Histórico si existe, o estimado)
    -- Para rapidez, sumamos (subtotal - (unit_cost * quantity)) de los items de facturas de este mes
    SELECT COALESCE(SUM(subtotal - (unit_cost * quantity)), 0)
    INTO v_current_profit
    FROM invoice_items
    WHERE organization_id = p_org_id
    AND invoice_id IN (
        SELECT id FROM invoices 
        WHERE organization_id = p_org_id 
        AND date >= v_start_month 
        AND status <> 'cancelled'
    );

    SELECT COALESCE(SUM(subtotal - (unit_cost * quantity)), 0)
    INTO v_last_profit
    FROM invoice_items
    WHERE organization_id = p_org_id
    AND invoice_id IN (
        SELECT id FROM invoices 
        WHERE organization_id = p_org_id 
        AND date >= v_start_last_month AND date <= v_end_last_month
        AND status <> 'cancelled'
    );

    -- 4. Calculos de Variación y Ticket
    IF v_last_month_total > 0 THEN
        v_revenue_growth := ((v_current_month_total - v_last_month_total) / v_last_month_total) * 100;
    ELSE
        v_revenue_growth := 100; -- Si antes era 0 y ahora vendo, 100% (o infinito)
    END IF;

    IF v_current_count > 0 THEN v_current_ticket := v_current_month_total / v_current_count; END IF;
    IF v_last_count > 0 THEN v_last_ticket := v_last_month_total / v_last_count; END IF;

    IF v_last_ticket > 0 THEN
        v_ticket_growth := ((v_current_ticket - v_last_ticket) / v_last_ticket) * 100;
    ELSE
        v_ticket_growth := 0;
    END IF;

    IF v_last_profit > 0 THEN
        v_profit_growth := ((v_current_profit - v_last_profit) / v_last_profit) * 100;
    ELSE
        v_profit_growth := 0;
    END IF;

    RETURN jsonb_build_object(
        'revenue', v_current_month_total,
        'revenueGrowth', v_revenue_growth,
        'profit', v_current_profit,
        'profitGrowth', v_profit_growth,
        'ticket', v_current_ticket,
        'ticketGrowth', v_ticket_growth
    );
END;
$$;


-- 2. DATOS PARA GRÁFICA COMPARATIVA (Agrupados por Mes)
-- Recibe un rango de años (ej: 2024, 2025) y devuelve totales por mes.
CREATE OR REPLACE FUNCTION get_monthly_sales_stats(p_org_id UUID, p_start_year INTEGER, p_end_year INTEGER)
RETURNS TABLE (
    year DOUBLE PRECISION,
    month DOUBLE PRECISION,
    total DOUBLE PRECISION
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        date_part('year', date) as year,
        date_part('month', date) as month,
        SUM(invoices.total) as total
    FROM invoices
    WHERE organization_id = p_org_id
    AND date_part('year', date) BETWEEN p_start_year AND p_end_year
    AND status <> 'cancelled'
    GROUP BY 1, 2
    ORDER BY 1, 2;
END;
$$;

-- 3. PRODUCTOS MÁS VENDIDOS (TOP 5)
CREATE OR REPLACE FUNCTION get_top_products_stats(p_org_id UUID)
RETURNS TABLE (
    product_name TEXT,
    total_sold NUMERIC,
    amount_sold NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ii.product_name::TEXT,
        SUM(ii.quantity) as total_sold,
        SUM(ii.subtotal) as amount_sold
    FROM invoice_items ii
    JOIN invoices i ON i.id = ii.invoice_id
    WHERE i.organization_id = p_org_id
    AND i.date >= date_trunc('month', NOW()) -- Top del Mes Actual
    AND i.status <> 'cancelled'
    GROUP BY 1
    ORDER BY 3 DESC
    LIMIT 5;
END;
$$;
