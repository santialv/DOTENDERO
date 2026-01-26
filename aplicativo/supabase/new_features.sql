-- 1. Table for Cash Shifts (Turnos de Caja)
CREATE TABLE IF NOT EXISTS public.cash_shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id),
    user_id UUID NOT NULL REFERENCES auth.users(id), -- Quien abrió caja
    start_time TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    end_time TIMESTAMP WITH TIME ZONE,
    
    initial_cash NUMERIC NOT NULL DEFAULT 0, -- Base
    
    -- Calculated at close
    final_cash_expected NUMERIC, -- Sistema dice que hay esto (Base + Ventas Efectivo - Egresos)
    final_cash_real NUMERIC, -- Cajero cuenta esto
    difference NUMERIC, -- Sobrante/Faltante
    
    status TEXT NOT NULL CHECK (status IN ('open', 'closed')) DEFAULT 'open',
    notes TEXT
);

ALTER TABLE public.cash_shifts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see own org shifts" ON public.cash_shifts
    FOR SELECT USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert shifts" ON public.cash_shifts
    FOR INSERT WITH CHECK (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update shifts" ON public.cash_shifts
    FOR UPDATE USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- 2. Table for Cash Movements (Ingresos/Egresos manuales de caja)
CREATE TABLE IF NOT EXISTS public.cash_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shift_id UUID NOT NULL REFERENCES public.cash_shifts(id),
    amount NUMERIC NOT NULL,
    type TEXT CHECK (type IN ('in', 'out')), -- 'in' (ingreso), 'out' (retiro/gasto)
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.cash_movements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see own movements" ON public.cash_movements FOR ALL USING (true); -- Simplificado por ahora

-- 3. RPC: Get Dashboard Stats (Optimized)
-- Returns: sales_today, profit_today, low_stock_count
CREATE OR REPLACE FUNCTION get_dashboard_stats(p_org_id UUID)
RETURNS TABLE (
    sales_today NUMERIC,
    transactions_today INTEGER,
    profit_today NUMERIC,
    low_stock_count INTEGER,
    top_products JSONB
) LANGUAGE plpgsql AS $$
DECLARE
    v_start_day TIMESTAMP WITH TIME ZONE;
    v_end_day   TIMESTAMP WITH TIME ZONE;
BEGIN
    v_start_day := date_trunc('day', now()); -- Hoy a las 00:00 UTC (ajustar segun zona si necesario)
    v_end_day   := date_trunc('day', now()) + interval '1 day';

    RETURN QUERY
    WITH sales_metrics AS (
        SELECT 
            COALESCE(SUM(total), 0) as total_sales,
            COUNT(*) as tx_count,
            -- Profit calc is tricky without line items containing cost. 
            -- Assuming we can join invoice_items -> products to get cost *at the moment of query* (approx)
            -- OR if invoice_items has cost snapshot (ideal). 
            -- For now, let's assume we don't have historical cost snapshot, so we ESTIMATE based on current cost.
            0::numeric as total_profit -- Placeholder till better query
        FROM invoices
        WHERE organization_id = p_org_id 
        AND created_at >= v_start_day 
        AND created_at < v_end_day
        AND status = 'paid'
    ),
    stock_metrics AS (
        SELECT COUNT(*)::integer as low_stock 
        FROM products 
        WHERE organization_id = p_org_id 
        AND status = 'active'
        AND stock <= min_stock
    )
    SELECT 
        sm.total_sales,
        sm.tx_count::integer, -- Cast explicitly
        sm.total_profit,
        st.low_stock,
        '[]'::jsonb -- Placeholder for top products
    FROM sales_metrics sm, stock_metrics st;
END;
$$;

-- 4. RPC: Get Current Open Shift
CREATE OR REPLACE FUNCTION get_open_shift(p_org_id UUID)
RETURNS JSONB LANGUAGE plpgsql AS $$
DECLARE
    v_shift RECORD;
BEGIN
    SELECT * INTO v_shift FROM cash_shifts 
    WHERE organization_id = p_org_id AND status = 'open' 
    LIMIT 1;
    
    IF v_shift IS NULL THEN
        RETURN NULL;
    END IF;
    
    RETURN to_jsonb(v_shift);
END;
$$;
