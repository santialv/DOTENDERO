-- Versión corregida: Sin columna 'description' que no existe
INSERT INTO plans (id, name, price, features)
VALUES 
    ('pro', 'Plan Pro', 90000, '["Control de Inventario", "Punto de Venta", "Reportes Avanzados", "Soporte Prioritario", "Múltiples Usuarios"]'),
    ('basic', 'Plan Básico', 25000, '["Control de Inventario", "Punto de Venta", "Reportes Básicos"]')
ON CONFLICT (id) DO UPDATE 
SET 
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  features = EXCLUDED.features;
