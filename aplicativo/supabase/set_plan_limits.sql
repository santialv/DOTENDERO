-- SET PLAN LIMITS
-- Update the 'features' JSONB to include explicit limits

UPDATE public.plans 
SET features = '{"labels": ["1 Usuario", "1 Caja", "Gestión de fiados"], "max_users": 1, "max_registers": 1}'
WHERE id = 'free';

UPDATE public.plans 
SET features = '{"labels": ["2 Usuarios", "Facturación Electrónica", "Reportes"], "max_users": 2, "max_registers": 2}'
WHERE id = 'basic';

UPDATE public.plans 
SET features = '{"labels": ["5 Usuarios", "Multi-Caja", "Asesoría mensual"], "max_users": 5, "max_registers": 99}'
WHERE id = 'pro';
