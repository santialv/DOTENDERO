-- ==============================================================================
-- REPARACIÓN SISTEMA DE PAGOS DONTENDERO
-- Objetivo: Asegurar que el RPC de activación de plan exista y funcione correctamente.
-- ==============================================================================

-- 1. Asegurar Tabla de Suscripciones (Opcional si ya existe, pero por seguridad)
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    plan_id TEXT NOT NULL REFERENCES plans(id),
    status TEXT NOT NULL DEFAULT 'active', -- active, cancelled, past_due
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    payment_ref TEXT,
    amount_paid NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. FUNCIÓN RPC PARA ACTIVAR PLAN
-- Esta función es llamada desde el servidor (Next.js) cuando Wompi confirma el pago.

CREATE OR REPLACE FUNCTION activate_subscription_plan(
    p_org_id UUID,
    p_plan_id TEXT,
    p_payment_ref TEXT,
    p_amount NUMERIC
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_plan_duration_days INT := 30; -- Default mensual
    v_end_date TIMESTAMP WITH TIME ZONE;
    v_plan_record RECORD;
BEGIN
    -- Verificar que el plan existe
    SELECT * INTO v_plan_record FROM plans WHERE id = p_plan_id;
    
    IF NOT FOUND THEN
        -- Fallback: Si no encuentra el plan exacto, asigna 'basic' si pago > 0
        IF p_amount > 0 THEN
             p_plan_id := 'basic';
        ELSE
             RAISE EXCEPTION 'Plan no encontrado y monto es 0';
        END IF;
    END IF;

    -- Calcular fecha fin (si es anual, dar 365 días)
    -- Asumimos por ahora mensual si no hay lógica compleja
    -- Detectar si es anual por monto (simplificación robusta)
    IF p_amount > 100000 THEN 
        v_plan_duration_days := 365;
    END IF;

    v_end_date := NOW() + (v_plan_duration_days || ' days')::INTERVAL;

    -- 1. Actualizar Organización
    UPDATE organizations
    SET 
        plan = p_plan_id,
        subscription_status = 'active',
        subscription_end_date = v_end_date
    WHERE id = p_org_id;

    -- 2. Registrar en Historial de Suscripciones
    INSERT INTO subscriptions (organization_id, plan_id, status, start_date, end_date, payment_ref, amount_paid)
    VALUES (p_org_id, p_plan_id, 'active', NOW(), v_end_date, p_payment_ref, p_amount);

    RETURN json_build_object(
        'success', true,
        'plan', p_plan_id,
        'end_date', v_end_date
    );
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'success', false,
        'error', SQLERRM
    );
END;
$$;

-- 3. PERMISOS
GRANT EXECUTE ON FUNCTION activate_subscription_plan TO authenticated;
GRANT EXECUTE ON FUNCTION activate_subscription_plan TO service_role;
