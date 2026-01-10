-- 1. Asegurar que RLS esté activo en todas las tablas críticas
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- 2. Eliminar políticas antiguas (para evitar duplicados o conflictos)
DROP POLICY IF EXISTS "Users can view own organization products" ON products;
DROP POLICY IF EXISTS "Users can create products for own organization" ON products;
DROP POLICY IF EXISTS "Users can update own organization products" ON products;
DROP POLICY IF EXISTS "Users can delete own organization products" ON products;

-- 3. Crear Políticas Estrictas para Productos
-- Solo ver productos donde organization_id coincida con la org del usuario
CREATE POLICY "Strict View Own Products" ON products
FOR SELECT
USING (
    organization_id IN (
        SELECT id FROM organizations 
        WHERE id = products.organization_id -- redundante pero claro
        AND (
            -- El usuario es dueño de la org (asumiendo link por auth.uid() si existiera columna, 
            -- pero como usamos profiles/trigger, lo mejor es usar la función get_my_org_id())
            id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
        )
    )
);

-- O más simple usando la función helper si ya la creaste:
-- USING (organization_id = get_my_org_id());

-- 4. Limpieza de Datos "Huérfanos" (Datos viejos de prueba)
-- Opción A: Borrarlos (Descomentar si el usuario quiere borrar todo lo viejo)
-- DELETE FROM products WHERE organization_id IS NULL;

-- Opción B: Asignarlos a una "Organización Fantasma" para ocultarlos
-- Inserta una org dummy si no existe
INSERT INTO organizations (id, name, created_at)
VALUES ('00000000-0000-0000-0000-000000000000', 'Old Data Archive', now())
ON CONFLICT (id) DO NOTHING;

-- Mueve productos huérfanos a esa org
UPDATE products 
SET organization_id = '00000000-0000-0000-0000-000000000000'
WHERE organization_id IS NULL;

-- Repetir para otras tablas
UPDATE customers SET organization_id = '00000000-0000-0000-0000-000000000000' WHERE organization_id IS NULL;
UPDATE sales SET organization_id = '00000000-0000-0000-0000-000000000000' WHERE organization_id IS NULL;
-- (Ajusta 'sales' por el nombre real de tu tabla de ventas/facturas si es 'invoices')
UPDATE invoices SET organization_id = '00000000-0000-0000-0000-000000000000' WHERE organization_id IS NULL;

-- 5. Política para INSERT (Crear)
CREATE POLICY "Strict Create Products" ON products
FOR INSERT
WITH CHECK (
    organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
);
