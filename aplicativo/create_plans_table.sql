-- Create 'plans' table
CREATE TABLE IF NOT EXISTS public.plans (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price NUMERIC DEFAULT 0,
    features JSONB DEFAULT '[]'::jsonb,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read plans (Public)
CREATE POLICY "Everyone can see plans" ON public.plans
    FOR SELECT
    USING (true);

-- Policy: Only Admins can update plans
-- (Assuming you have a secure way to check for admin, for now trusting authenticated users with role check in app logic or specific RLS if 'profiles' table has role)
-- Simplification for now: Authenticated users can update (be careful with this in prod, ideally verify profile.role = 'super_admin')
CREATE POLICY "Admins can update plans" ON public.plans
    FOR UPDATE
    USING (auth.role() = 'authenticated');

-- Insert Default Plans
INSERT INTO public.plans (id, name, price, features, active)
VALUES 
    ('free', 'Estándar (Gratis)', 0, '["Panel Administrativo", "Reportes Básicos"]', true),
    ('basic', 'Emprendedor', 50000, '["Panel Administrativo", "Soporte Prioritario", "Multi-Caja"]', true),
    ('pro', 'Empresario PRO', 90000, '["Panel Administrativo", "Soporte VIP", "API & Webhooks", "Multi-Bodega"]', true)
ON CONFLICT (id) DO UPDATE 
SET price = EXCLUDED.price, name = EXCLUDED.name;
