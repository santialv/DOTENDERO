-- SCRIPT CORREGIDO: LIMPIEZA INTELIGENTE DE HQs
-- Este script soluciona el error de "Foreign Key Constraint" moviendo primero a los usuarios.

DO $$
DECLARE
    target_email TEXT := 'admin@dontendero.com';
    user_id UUID;
    final_hq_id UUID;
    org_rec RECORD;
BEGIN
    -- 1. Obtener ID del usuario Admin
    SELECT id INTO user_id FROM auth.users WHERE email = target_email;
    IF user_id IS NULL THEN
        RAISE EXCEPTION 'Usuario % no encontrado', target_email;
    END IF;

    -- 2. Identificar o Crear la HQ Definitiva
    -- Buscamos si ya existe alguna, tomamos la más reciente para salvarla.
    SELECT id INTO final_hq_id FROM public.organizations 
    WHERE name = 'DonTendero HQ' 
    ORDER BY created_at DESC 
    LIMIT 1;

    -- Si no existe ninguna, la creamos.
    IF final_hq_id IS NULL THEN
        INSERT INTO public.organizations (name, legal_name, created_at, plan, subscription_status)
        VALUES ('DonTendero HQ', 'DonTendero SAS', now(), 'pro', 'active')
        RETURNING id INTO final_hq_id;
        RAISE NOTICE 'Se creó una nueva HQ: %', final_hq_id;
    ELSE
        RAISE NOTICE 'Se utilizará la HQ existente: %', final_hq_id;
    END IF;

    -- 3. MIGRACIÓN MASIVA (El paso clave)
    -- Asignamos a todos los usuarios que estén en CUALQUIER "DonTendero HQ" para que apunten a la FINAL.
    -- Esto libera las otras HQs para poder borrarlas.
    UPDATE public.profiles
    SET organization_id = final_hq_id,
        home_organization_id = final_hq_id -- Arregla el Ghost Mode
    WHERE organization_id IN (SELECT id FROM public.organizations WHERE name = 'DonTendero HQ')
       OR id = user_id; -- Aseguramos que el Admin también quede aquí sí o sí.

    -- 4. AHORA SÍ: Borrar las HQs duplicadas (todas menos la final)
    DELETE FROM public.organizations 
    WHERE name = 'DonTendero HQ' 
      AND id != final_hq_id;

    -- 5. Asegurar Rol de Super Admin
    UPDATE public.profiles
    SET role = 'super_admin'
    WHERE id = user_id;

    RAISE NOTICE 'LIMPIEZA COMPLETADA. Solo queda una HQ y el usuario % está vinculado correctamente a ella.', target_email;
END $$;
