-- UNIFY PLANS AND SUBSCRIPTIONS
-- Use the 'plans' table as the single source of truth

-- 1. Update 'plans' table structure
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS duration_days INTEGER DEFAULT 30;
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS code TEXT;

-- Update codes for existing plans
UPDATE public.plans SET code = id WHERE code IS NULL;

-- 2. Update Organizations to use the correct plan identifier if needed
-- (They currently use 'subscription_plan' column)

-- 3. Update the activation function to use the 'plans' table
-- First drop the old version to avoid parameter name mismatch error (42P13)
DROP FUNCTION IF EXISTS activate_subscription_plan(uuid,text,text,numeric);

CREATE OR REPLACE FUNCTION activate_subscription_plan(
    p_org_id UUID,
    p_plan_id TEXT, -- Changed to TEXT to match plans.id
    p_payment_ref TEXT,
    p_amount NUMERIC
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_duration INTEGER;
    v_current_end TIMESTAMPTZ;
    v_new_end TIMESTAMPTZ;
BEGIN
    -- 1. Buscar Plan en la tabla 'plans'
    SELECT duration_days INTO v_duration 
    FROM public.plans WHERE id = p_plan_id;

    IF v_duration IS NULL THEN
        -- Fallback to search by price if ID fails (for backward compatibility during migration)
        SELECT id, duration_days INTO p_plan_id, v_duration 
        FROM public.plans WHERE price = p_amount LIMIT 1;
        
        IF v_duration IS NULL THEN
            RAISE EXCEPTION 'Plan no encontrado por ID ni por precio: %', p_plan_id;
        END IF;
    END IF;

    -- 2. Calcular vigencia
    SELECT subscription_end_date INTO v_current_end 
    FROM organizations WHERE id = p_org_id;

    IF v_current_end IS NULL OR v_current_end < NOW() THEN
        v_new_end := NOW() + (v_duration || ' days')::INTERVAL;
    ELSE
        v_new_end := v_current_end + (v_duration || ' days')::INTERVAL;
    END IF;

    -- 3. Registrar Historial (Opcional: puedes crear una tabla compatible si quieres guardar logs)
    -- Para este despliegue, asumimos que organizations es la base.

    -- 4. Actualizar Organización
    UPDATE organizations 
    SET 
        subscription_status = 'active',
        plan = p_plan_id, -- Using 'plan' column (standard in aplicativo)
        subscription_plan = p_plan_id, -- Keep for compatibility with scripts looking for this
        subscription_end_date = v_new_end
    WHERE id = p_org_id;

    RETURN jsonb_build_object(
        'success', true,
        'new_end_date', v_new_end,
        'plan', p_plan_id
    );
END;
$$;
