-- Asegurar que la tabla de planes exista y tenga la estructura correcta
CREATE TABLE IF NOT EXISTS public.plans (
    id TEXT PRIMARY KEY, -- 'free', 'pro', 'premium'
    name TEXT NOT NULL,
    price NUMERIC NOT NULL DEFAULT 0,
    currency TEXT DEFAULT 'COP',
    description TEXT,
    features JSONB,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Habilitar RLS
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

-- Permitir lectura pública de los planes (importante para que el frontend los vea)
DROP POLICY IF EXISTS "Public read access" ON public.plans;
CREATE POLICY "Public read access" ON public.plans
    FOR SELECT USING (true);

-- Permitir edición solo a administradores (o autenticados por ahora para facilitar gestión)
DROP POLICY IF EXISTS "Admin update access" ON public.plans;
CREATE POLICY "Admin update access" ON public.plans
    FOR ALL USING (auth.role() = 'authenticated'); -- Idealmente restringir a rol 'super_admin'

-- Insertar o Actualizar los planes por defecto para asegurar que coincidan con la lógica de negocio
INSERT INTO public.plans (id, name, price, description, features)
VALUES 
    ('free', 'Plan Gratuito', 0, 'Ideal para comenzar', '["Ventas ilimitadas", "Inventario básico", "Sin costo mensual"]'),
    ('pro', 'Plan Pro', 50000, 'Para negocios en crecimiento', '["Todo lo del Free", "Facturación Electrónica", "Reportes Avanzados", "Soporte Prioritario"]'),
    ('premium', 'Plan Premium', 90000, 'Para grandes volúmenes', '["Todo lo del Pro", "Multi-Bodega", "API Access", "Gerente de Cuenta"]')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    price = EXCLUDED.price,
    features = EXCLUDED.features;
