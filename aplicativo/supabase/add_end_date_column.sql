-- Agregar columna faltante para fecha de vencimiento de suscripción
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP WITH TIME ZONE;
