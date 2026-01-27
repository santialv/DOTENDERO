-- Function to safely activate subscription
-- This handles upgrading plan and extending expiration date
CREATE OR REPLACE FUNCTION public.activate_subscription_plan(
    p_org_id TEXT,
    p_plan_code TEXT,
    p_payment_ref TEXT,
    p_amount NUMERIC
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with elevated privileges to update profiles
AS $$
DECLARE
    v_current_expiry TIMESTAMPTZ;
    v_new_expiry TIMESTAMPTZ;
    v_duration_months INT := 1;
    v_result JSONB;
BEGIN
    -- Determine duration based on plan code suffix (simple logic for now)
    IF p_plan_code LIKE '%_annual' THEN
        v_duration_months := 12;
    ELSE
        v_duration_months := 1;
    END IF;

    -- Get current plan expiry
    -- Assuming 'profiles' or 'business_profiles' table holds this. Adjust table name if needed.
    -- Let's assume 'business_info' or where you keep 'organization_id' is mapped to profiles.
    -- EDIT: Based on codebase, it seems we store plan in 'profiles' or 'organizations'.
    -- Let's try to update 'profiles' where organization_id matches (if multi-user this might be tricky, usually subscription is per org).
    -- Let's assume 'profiles' has 'organization_id'.
    
    SELECT plan_expiry INTO v_current_expiry
    FROM public.profiles
    WHERE organization_id = p_org_id
    LIMIT 1;

    -- Calculate new expiry
    IF v_current_expiry IS NULL OR v_current_expiry < NOW() THEN
        -- If expired or never had one, start from NOW
        v_new_expiry := NOW() + (v_duration_months || ' months')::INTERVAL;
    ELSE
        -- If active, add to existing expiry
        v_new_expiry := v_current_expiry + (v_duration_months || ' months')::INTERVAL;
    END IF;

    -- Update the profile/organization
    UPDATE public.profiles
    SET 
        plan = split_part(p_plan_code, '_', 1), -- 'pro_monthly' -> 'pro'
        plan_expiry = v_new_expiry,
        subscription_status = 'active',
        updated_at = NOW()
    WHERE organization_id = p_org_id;

    -- Log transaction (Optional, good for audit)
    -- INSERT INTO payment_logs ...

    v_result := jsonb_build_object(
        'success', true,
        'new_plan', split_part(p_plan_code, '_', 1),
        'new_expiry', v_new_expiry
    );

    RETURN v_result;
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;
