-- Create a table for platform-wide configuration
-- This table is intended to hold a single row of configuration
CREATE TABLE IF NOT EXISTS platform_config (
    id SERIAL PRIMARY KEY,
    terms_and_conditions TEXT DEFAULT 'Términos y Condiciones Pendientes...',
    privacy_policy TEXT DEFAULT 'Política de Privacidad Pendiente...',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert the default row if it doesn't exist
INSERT INTO platform_config (id, terms_and_conditions, privacy_policy)
SELECT 1, 'Bienvenido a DonTendero. Al usar nuestra plataforma...', 'En DonTendero respetamos tu privacidad...'
WHERE NOT EXISTS (SELECT 1 FROM platform_config WHERE id = 1);

-- Enable RLS (Optional but good practice, though public needs read access)
ALTER TABLE platform_config ENABLE ROW LEVEL SECURITY;

-- Allow everyone to READ (public pages)
CREATE POLICY "Public can view platform config" 
ON platform_config FOR SELECT 
USING (true);

-- Allow only admins (or authenticated users for now) to UPDATE
-- In a stricter system, we'd check for specific admin role
CREATE POLICY "Admins can update platform config" 
ON platform_config FOR UPDATE 
TO authenticated 
USING (true)
WITH CHECK (true);
