-- GESTIÓN DE SUSCRIPCIONES Y PLANES
-- Este script crea la infraestructura para manejar planes SaaS (Básico, Pro, etc.) y registrar pagos de Wompi.

-- 1. TABLA DE PLANES (Catálogo)
CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE, -- 'basic_monthly', 'pro_annual'
    name TEXT NOT NULL,
    price NUMERIC NOT NULL,
    currency TEXT DEFAULT 'COP',
    duration_days INTEGER NOT NULL, -- 30 para mes, 365 para año
    features JSONB, -- Lista de beneficios
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar Planes por Defecto
INSERT INTO subscription_plans (code, name, price, duration_days) 
VALUES 
('basic_monthly', 'Plan Emprendedor (Mes)', 29900, 30),
('pro_monthly', 'Plan Don Tendero Pro (Mes)', 59900, 30),
('pro_annual', 'Plan Don Tendero Pro (Año)', 599000, 365)
ON CONFLICT (code) DO NOTHING;


-- 2. TABLA DE HISTORIAL DE SUSCRIPCIONES (Logs)
CREATE TABLE IF NOT EXISTS subscription_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id),
    plan_id UUID REFERENCES subscription_plans(id),
    payment_reference TEXT, -- Referencia Wompi
    amount_paid NUMERIC,
    status TEXT, -- 'approved', 'pending'
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- 3. FUNCIÓN BLINDADA PARA ACTIVAR PLAN
-- Se llama desde el backend/webhook cuando Wompi confirma el pago.
CREATE OR REPLACE FUNCTION activate_subscription_plan(
    p_org_id UUID,
    p_plan_code TEXT,
    p_payment_ref TEXT,
    p_amount NUMERIC
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_plan_id UUID;
    v_duration INTEGER;
    v_current_end TIMESTAMPTZ;
    v_new_end TIMESTAMPTZ;
BEGIN
    -- 1. Buscar Plan
    SELECT id, duration_days INTO v_plan_id, v_duration 
    FROM subscription_plans WHERE code = p_plan_code;

    IF v_plan_id IS NULL THEN
        RAISE EXCEPTION 'Plan no encontrado: %', p_plan_code;
    END IF;

    -- 2. Calcular vigencia
    -- Si ya tiene suscripción activa, se suma al final. Si no, empieza hoy.
    SELECT subscription_end_date INTO v_current_end 
    FROM organizations WHERE id = p_org_id;

    IF v_current_end IS NULL OR v_current_end < NOW() THEN
        v_new_end := NOW() + (v_duration || ' days')::INTERVAL;
    ELSE
        v_new_end := v_current_end + (v_duration || ' days')::INTERVAL;
    END IF;

    -- 3. Registrar Historial
    INSERT INTO subscription_history (
        organization_id, plan_id, payment_reference, amount_paid, status, start_date, end_date
    ) VALUES (
        p_org_id, v_plan_id, p_payment_ref, p_amount, 'approved', NOW(), v_new_end
    );

    -- 4. Actualizar Organización
    UPDATE organizations 
    SET 
        subscription_status = 'active',
        subscription_plan = p_plan_code,
        subscription_end_date = v_new_end
    WHERE id = p_org_id;

    RETURN jsonb_build_object(
        'success', true,
        'new_end_date', v_new_end,
        'plan', p_plan_code
    );
END;
$$;
