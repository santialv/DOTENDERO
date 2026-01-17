-- SCRIPT DE GENERACIÓN DE DATOS DE PRUEBA MASIVOS
-- Para el usuario: santialvpez@gmail.com
-- Genera: 500 Productos, 100 Clientes, y 200 Ventas históricas.

DO $$
DECLARE
    v_user_email TEXT := 'santialvpez@gmail.com';
    v_user_id UUID;
    v_org_id UUID;
    
    -- Configuración
    v_product_limit INTEGER := 500;
    v_customer_limit INTEGER := 100;
    v_sales_limit INTEGER := 200;
    
    -- Variables temporales
    i INTEGER;
    j INTEGER;
    v_prod_id UUID;
    v_cust_id UUID;
    v_invoice_id UUID;
    v_random_price NUMERIC;
    v_random_qty INTEGER;
    v_random_cat TEXT;
    v_random_date TIMESTAMPTZ;
    v_total NUMERIC;
    v_prod_rows record;
    v_cust_rows record;
BEGIN
    -- 1. OBTENER ID USUARIO Y ORGANIZACIÓN
    SELECT id INTO v_user_id FROM auth.users WHERE email = v_user_email;
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION '❌ Usuario % no encontrado en auth.users', v_user_email;
    END IF;

    SELECT organization_id INTO v_org_id FROM profiles WHERE id = v_user_id;

    IF v_org_id IS NULL THEN
        RAISE EXCEPTION '❌ El usuario no tiene una organización asignada en la tabla profiles';
    END IF;

    RAISE NOTICE '✅ Generando datos para Org ID: %', v_org_id;

    -- 2. GENERAR PRODUCTOS (500)
    RAISE NOTICE '📦 Creando % productos...', v_product_limit;
    FOR i IN 1..v_product_limit LOOP
        v_random_price := (floor(random() * 50) + 1) * 1000; -- Precios: 1000, 2000... 50000
        v_random_cat := (ARRAY['Licores', 'Cervezas', 'Gaseosas', 'Snacks', 'Lácteos', 'Aseo', 'Granos', 'Enlatados'])[floor(random()*8)+1];
        
        INSERT INTO products (
            organization_id, name, description, category, price, cost, stock, min_stock, status
        ) VALUES (
            v_org_id,
            'Producto Test ' || i || ' - ' || v_random_cat,
            'Descripción genérica para prueba de rendimiento ' || i,
            v_random_cat,
            v_random_price,
            v_random_price * 0.65, -- 35% margen
            floor(random() * 100), -- Stock 0-100
            10,
            'active'
        );
    END LOOP;

    -- 3. GENERAR CLIENTES (100)
    RAISE NOTICE '👥 Creando % clientes...', v_customer_limit;
    FOR i IN 1..v_customer_limit LOOP
        INSERT INTO customers (
            organization_id, name, phone, email, cc, city
        ) VALUES (
            v_org_id,
            'Cliente Prueba ' || i,
            '300' || floor(random() * 8999999 + 1000000),
            'cliente' || i || '@prueba.com',
            floor(random() * 89999999 + 10000000)::text,
            (ARRAY['Medellín', 'Bogotá', 'Cali', 'Rionegro'])[floor(random()*4)+1]
        );
    END LOOP;

    -- 4. GENERAR VENTAS HISTÓRICAS (200)
    -- Necesitamos productos y clientes reales para relacionar
    RAISE NOTICE '💰 Generando % ventas históricas (esto puede tardar)...', v_sales_limit;
    
    FOR i IN 1..v_sales_limit LOOP
        -- Seleccionar cliente random
        SELECT id INTO v_cust_id FROM customers WHERE organization_id = v_org_id ORDER BY random() LIMIT 1;
        
        -- Fecha random en los últimos 60 días
        v_random_date := NOW() - (floor(random() * 60) || ' days')::interval;
        
        -- Crear Factura (Invoice)
        INSERT INTO invoices (
            organization_id, customer_id, seller_id, 
            number, date, payment_method, status, 
            subtotal, tax_total, total
        ) VALUES (
            v_org_id, 
            v_cust_id, 
            v_user_id,
            'TEST-' || i,
            v_random_date,
            (ARRAY['Efectivo', 'Tarjeta', 'QR'])[floor(random()*3)+1],
            'paid',
            0, 0, 0 -- Se actualizará luego
        ) RETURNING id INTO v_invoice_id;

        -- Agregar 1 a 5 items por venta
        v_total := 0;
        FOR j IN 1..(floor(random() * 5) + 1) LOOP
            SELECT id, name, price, cost INTO v_prod_rows 
            FROM products WHERE organization_id = v_org_id ORDER BY random() LIMIT 1;
            
            v_random_qty := floor(random() * 5) + 1;
            
            -- Insert Item
            INSERT INTO invoice_items (
                organization_id, invoice_id, product_id, product_name,
                quantity, unit_price, unit_cost, subtotal
            ) VALUES (
                v_org_id, v_invoice_id, v_prod_rows.id, v_prod_rows.name,
                v_random_qty, v_prod_rows.price, v_prod_rows.cost, (v_prod_rows.price * v_random_qty)
            );
            
            v_total := v_total + (v_prod_rows.price * v_random_qty);
        END LOOP;

        -- Actualizar total factura
        UPDATE invoices SET total = v_total, subtotal = v_total WHERE id = v_invoice_id;
        
    END LOOP;

    RAISE NOTICE '✨ ¡GENERACIÓN COMPLETADA EXITOSAMENTE!';
END $$;
