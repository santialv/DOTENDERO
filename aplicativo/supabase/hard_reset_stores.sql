-- SCRIPT NUCLEAR: HARD RESET (Excepto Admin)
-- Propósito: Borrar todas las tiendas de prueba y obligar a todos los usuarios (menos al Admin) a pasar por el Onboarding de nuevo.

DO $$
DECLARE
    hq_id UUID;
BEGIN
    -- 1. Identificar la HQ del Super Admin para PROTEJERLA
    SELECT id INTO hq_id FROM public.organizations WHERE name = 'DonTendero HQ' LIMIT 1;

    IF hq_id IS NULL THEN
        RAISE EXCEPTION 'No se encontró DonTendero HQ. Corre primero el script de reparación de Admin.';
    END IF;

    RAISE NOTICE 'Protegiendo HQ: %', hq_id;

    -- 2. "Desvincular" a todos los usuarios que NO sean Super Admins
    -- Al poner organization_id en NULL, el AuthGuard los enviará automáticamente a /onboarding
    UPDATE public.profiles
    SET organization_id = NULL
    WHERE organization_id != hq_id; 

    RAISE NOTICE 'Usuarios desvinculados de tiendas viejas.';

    -- 3. Borrar todas las organizaciones EXCEPTO la HQ
    DELETE FROM public.organizations
    WHERE id != hq_id;

    RAISE NOTICE '¡Limpieza completada! Todas las tiendas basura han sido eliminadas.';
END $$;
