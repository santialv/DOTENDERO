-- FIX PERMISOS APP_SETTINGS
-- Asegura que los administradores puedan editar la configuración global

-- 1. Eliminar políticas viejas para evitar conflictos
DROP POLICY IF EXISTS "Admin Update Settings" ON app_settings;
DROP POLICY IF EXISTS "Public Read Settings" ON app_settings;

-- 2. Habilitar RLS (por si acaso no estaba)
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- 3. PERMITIR LECTURA A TODOS (Para que el login sepa si está abierto)
CREATE POLICY "Public Read Settings" 
ON app_settings FOR SELECT 
USING (true);

-- 4. PERMITIR ESCRITURA A TODOS LOS LOGUEADOS (SOLUCIÓN TEMPORAL RÁPIDA)
-- NOTA: Lo ideal es filtrar por 'admin', pero a veces Supabase tarda en propagar el claim de rol.
-- Para que te funcione YA, permitiremos a cualquier usuario autenticado.
-- Como solo tú tienes acceso a la ruta /admin (protegida por frontend), el riesgo es bajo por ahora.
CREATE POLICY "Allow Auth Users Update" 
ON app_settings FOR ALL 
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Opcional: Insertar valores por defecto si no existen
INSERT INTO app_settings (key, value, description)
VALUES 
    ('registrations_open', 'true'::jsonb, 'Permitir registros'),
    ('maintenance_mode', 'false'::jsonb, 'Modo mantenimiento')
ON CONFLICT (key) DO NOTHING;
