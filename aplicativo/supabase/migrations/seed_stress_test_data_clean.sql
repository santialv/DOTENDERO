DO $$
DECLARE
    v_user_email TEXT := 'santyalvpez@gmail.com';
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
BEGIN
    SELECT id INTO v_user_id FROM auth.users WHERE email = v_user_email;
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Usuario no encontrado: %', v_user_email;
    END IF;

    SELECT organization_id INTO v_org_id FROM profiles WHERE id = v_user_id;

    IF v_org_id IS NULL THEN
        RAISE EXCEPTION 'Organizacion no encontrada para el usuario';
    END IF;

    -- PRODUCTOS
    FOR i IN 1..v_product_limit LOOP
        v_random_price := (floor(random() * 50) + 1) * 1000;
        v_random_cat := (ARRAY['Licores', 'Cervezas', 'Gaseosas', 'Granos', 'Lácteos', 'Aseo', 'Dulces', 'Varios'])[floor(random()*8)+1];
        
        INSERT INTO products (
            organization_id, name, description, category, price, cost, stock, min_stock, status
        ) VALUES (
            v_org_id,
            'Producto Test ' || i || ' - ' || v_random_cat,
            'Descripcion ' || i,
            v_random_cat,
            v_random_price,
            v_random_price * 0.65,
            floor(random() * 100),
            10,
            'active'
        );
    END LOOP;

    -- CLIENTES
    FOR i IN 1..v_customer_limit LOOP
        INSERT INTO customers (
            organization_id, full_name, phone, email, document_number, city
        ) VALUES (
            v_org_id,
            'Cliente Prueba ' || i,
            '300' || floor(random() * 8999999 + 1000000),
            'cliente' || i || '@prueba.com',
            floor(random() * 89999999 + 10000000)::text,
            (ARRAY['Medellin', 'Bogota', 'Cali', 'Rionegro'])[floor(random()*4)+1]
        );
    END LOOP;

    -- VENTAS
    FOR i IN 1..v_sales_limit LOOP
        SELECT id INTO v_cust_id FROM customers WHERE organization_id = v_org_id ORDER BY random() LIMIT 1;
        v_random_date := NOW() - (floor(random() * 60) || ' days')::interval;
        
        INSERT INTO invoices (
            organization_id, customer_id, seller_id, 
            number, date, payment_method, status, 
            subtotal, tax_total, total
        ) VALUES (
            v_org_id, v_cust_id, v_user_id,
            'TEST-' || i, v_random_date,
            (ARRAY['Efectivo', 'Tarjeta', 'QR'])[floor(random()*3)+1],
            'paid', 0, 0, 0
        ) RETURNING id INTO v_invoice_id;

        v_total := 0;
        FOR j IN 1..(floor(random() * 5) + 1) LOOP
            SELECT id, name, price, cost INTO v_prod_rows 
            FROM products WHERE organization_id = v_org_id ORDER BY random() LIMIT 1;
            
            v_random_qty := floor(random() * 5) + 1;
            
            INSERT INTO invoice_items (
                organization_id, invoice_id, product_id, product_name,
                quantity, unit_price, unit_cost, subtotal
            ) VALUES (
                v_org_id, v_invoice_id, v_prod_rows.id, v_prod_rows.name,
                v_random_qty, v_prod_rows.price, v_prod_rows.cost, (v_prod_rows.price * v_random_qty)
            );
            
            v_total := v_total + (v_prod_rows.price * v_random_qty);
        END LOOP;

        UPDATE invoices SET total = v_total, subtotal = v_total WHERE id = v_invoice_id;
    END LOOP;
END $$;
