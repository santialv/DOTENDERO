-- SCRIPT PARA CORREGIR USUARIO VINCULADO INCORRECTAMENTE
-- Ejecuta esto en el SQL Editor de Supabase

DO $$
DECLARE
    -- Pon aquí el correo del usuario afectado
    target_email TEXT := 'santyalvpez@gmail.com';
    target_user_id UUID;
    new_org_id UUID;
    current_org_id UUID;
BEGIN
    -- 1. Buscar el ID del usuario
    SELECT id INTO target_user_id FROM auth.users WHERE email = target_email;

    IF target_user_id IS NULL THEN
        RAISE EXCEPTION 'El usuario % no existe en auth.users', target_email;
    END IF;

    -- 2. Crear una NUEVA Organización limpia para este usuario
    INSERT INTO public.organizations (name, created_at, plan, subscription_status)
    VALUES ('Tienda de ' || target_email, now(), 'free', 'active')
    RETURNING id INTO new_org_id;

    -- 3. Actualizar el perfil del usuario para que apunte a la nueva organización
    UPDATE public.profiles
    SET organization_id = new_org_id
    WHERE id = target_user_id;

    RAISE NOTICE 'CORREGIDO: El usuario % ha sido movido a su propia organización nueva (ID: %)', target_email, new_org_id;
END $$;
