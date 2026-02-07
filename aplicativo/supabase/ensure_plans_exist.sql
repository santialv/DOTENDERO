-- Asegurar que existan los planes 'pro' y 'basic' como IDs de texto para evitar errores de FK
-- Si tu tabla usa UUIDs, esto insertará registros con ID específico si es posible, o deberíamos ajustar la lógica.
-- Asumimos que la columna 'id' de 'plans' es text o permite estos valores.

INSERT INTO plans (id, name, price, features, description)
VALUES 
    ('pro', 'Plan Pro', 90000, '["Control de Inventario", "Punto de Venta", "Reportes Avanzados", "Soporte Prioritario", "Múltiples Usuarios"]', 'Para negocios en crecimiento'),
    ('basic', 'Plan Básico', 25000, '["Control de Inventario", "Punto de Venta", "Reportes Básicos"]', 'Para empezar')
ON CONFLICT (id) DO UPDATE 
SET 
  name = EXCLUDED.name,
  price = EXCLUDED.price;
