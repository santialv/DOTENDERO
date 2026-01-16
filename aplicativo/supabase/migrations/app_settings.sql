-- TABLA PARA CONFIGURACIÓN GLOBAL DE LA APP
-- Almacena "Feature Flags" como si está abierto el registro, modo mantenimiento, etc.

CREATE TABLE IF NOT EXISTS app_settings (
    key TEXT PRIMARY KEY, -- ej: 'registrations_open', 'maintenance_mode'
    value JSONB NOT NULL, -- ej: true, false, { "message": "..." }
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID -- Opcional: ID del admin que lo cambió
);

-- Insertar configuraciones por defecto
INSERT INTO app_settings (key, value, description)
VALUES 
    ('registrations_open', 'true'::jsonb, 'Permitir que nuevos usuarios se registren.'),
    ('maintenance_mode', 'false'::jsonb, 'Poner la app en modo mantenimiento global.')
ON CONFLICT (key) DO NOTHING;

-- Habilitar RLS (Row Level Security)
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS DE ACCESO
-- 1. Lectura pública (Cualquiera puede ver si el registro está abierto)
CREATE POLICY "Public Read Settings" 
    ON app_settings FOR SELECT 
    USING (true);

-- 2. Escritura solo Admins (Necesitas definir quién es admin, por ahora permitimos a auth users si no hay rol)
-- TODO: Ajustar esto a tu rol de admin real. Por ahora, permitimos update a usuarios autenticados para que puedas probar.
CREATE POLICY "Admin Update Settings" 
    ON app_settings FOR UPDATE 
    USING (auth.role() = 'authenticated'); 
    -- Idealmente: USING ( auth.uid() IN (SELECT id FROM users WHERE role = 'admin') )
