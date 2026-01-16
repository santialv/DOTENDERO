-- ACTUALIZACIÓN FINAL: AGREGAR CAMPOS DE SUSCRIPCIÓN A ORGANIZACIONES
-- Ejecuta esto para que la tabla organizations pueda guardar el plan y la fecha de vencimiento.

ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active', -- active, past_due, canceled
ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMPTZ;

-- Opcional: Index para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_orgs_subscription ON organizations(subscription_status);
