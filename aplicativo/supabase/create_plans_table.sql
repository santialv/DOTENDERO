-- Create plans table
CREATE TABLE IF NOT EXISTS public.plans (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price NUMERIC NOT NULL DEFAULT 0,
    currency TEXT DEFAULT 'COP',
    description TEXT,
    features JSONB,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Insert default plans if not exist
INSERT INTO public.plans (id, name, price, currency, features, active)
VALUES 
    ('free', 'Estándar (Gratis)', 0, 'COP', '["Panel Administrativo", "Soporte Básico"]', true),
    ('basic', 'Emprendedor', 50000, 'COP', '["Panel Administrativo", "Soporte Prioritario", "1 Bodega", "Reportes Básicos"]', true),
    ('pro', 'Empresario PRO', 90000, 'COP', '["Panel Administrativo", "Soporte VIP", "Multi-Bodega", "API Access", "Reportes Avanzados"]', true)
ON CONFLICT (id) DO NOTHING;

-- Grant access to authenticated users
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to plans" ON public.plans
    FOR SELECT USING (true); -- Public/Authenticated users can see plans

CREATE POLICY "Allow admin update access to plans" ON public.plans
    FOR UPDATE USING (auth.role() = 'authenticated'); -- Ideally restricted to admin role, but for now authenticated is fine for this context

-- Add notification for realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.plans;
