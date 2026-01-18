-- SCRIPT FINAL PARA CREAR SUPER ADMIN
-- Ejecuta esto en el SQL Editor de Supabase

DO $$
DECLARE
    target_email TEXT := 'admin@dontendero.com'; -- CAMBIA ESTO SI ES OTRO CORREO
    target_user_id UUID;
    hq_org_id UUID;
BEGIN
    -- 1. Buscar el ID del usuario (Debe haberse registrado o logueado al menos 1 vez)
    SELECT id INTO target_user_id FROM auth.users WHERE email = target_email;

    IF target_user_id IS NULL THEN
        RAISE EXCEPTION 'El usuario % no existe. Por favor regístrate primero.', target_email;
    END IF;

    -- 2. Crear la Organización "Sede Central" (Si no existe)
    INSERT INTO public.organizations (name, legal_name, created_at, plan, subscription_status)
    VALUES ('DonTendero HQ', 'DonTendero SAS', now(), 'pro', 'active')
    RETURNING id INTO hq_org_id;

    -- 3. Actualizar al usuario para ser SUPER ADMIN y vivir en la HQ
    UPDATE public.profiles
    SET 
        role = 'super_admin',
        organization_id = hq_org_id,
        home_organization_id = hq_org_id
    WHERE id = target_user_id;

    RAISE NOTICE 'ÉXITO: % es ahora Super Admin y vive en la Sede Central (ID: %)', target_email, hq_org_id;
END $$;
