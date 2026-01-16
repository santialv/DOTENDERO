-- 1. Añadir columna seller_id a la tabla Invoices (si no existe)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'seller_id') THEN
        ALTER TABLE invoices ADD COLUMN seller_id UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- 2. Secure Checkout Transaction (RPC) -- VERSION FINAL (CON SELLER_ID)
-- Incluye el registro de quién vendió.

CREATE OR REPLACE FUNCTION process_sale(
  p_org_id UUID,
  p_seller_id UUID,
  p_customer_id UUID,
  p_items JSONB,
  p_payments JSONB,
  p_sale_number TEXT 
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER 
AS $$
DECLARE
  v_invoice_id UUID;
  v_total NUMERIC := 0;
  v_tax_total NUMERIC := 0;
  v_item JSONB;
  v_prod_price NUMERIC;
  v_prod_cost NUMERIC;
  v_prod_tax NUMERIC;
  v_prod_stock INTEGER;
  v_prod_name TEXT;
  v_prod_id UUID;
  v_qty INTEGER;
  v_subtotal_line NUMERIC;
  v_new_stock INTEGER;
  v_payment JSONB;
  v_payment_methods TEXT := '';
  v_generated_number TEXT;
  v_current_count INTEGER;
BEGIN
  -- Generar consecutivo
  SELECT count(*) INTO v_current_count FROM invoices WHERE organization_id = p_org_id;
  v_generated_number := 'POS-' || (v_current_count + 1024 + 1);

  -- Calcular Totales y Bloquear Stock
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_prod_id := (v_item->>'id')::UUID;
    v_qty := (v_item->>'quantity')::INTEGER;

    SELECT price, cost, tax_rate, stock, name 
    INTO v_prod_price, v_prod_cost, v_prod_tax, v_prod_stock, v_prod_name
    FROM products 
    WHERE id = v_prod_id AND organization_id = p_org_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Producto no encontrado: %', v_prod_id;
    END IF;

    v_subtotal_line := v_prod_price * v_qty;
    v_total := v_total + v_subtotal_line;
  END LOOP;

  -- Métodos de Pago
  SELECT string_agg(value->>'method', ', ') INTO v_payment_methods
  FROM jsonb_array_elements(p_payments);

  -- Crear Factura (CON SELLER ID)
  INSERT INTO invoices (
    organization_id, 
    customer_id, 
    seller_id, -- ¡Aquí está!
    number, 
    date, 
    payment_method, 
    subtotal, 
    tax_total, 
    total, 
    status
  ) VALUES (
    p_org_id, 
    p_customer_id, 
    p_seller_id, -- ¡Y aquí se guarda!
    v_generated_number, 
    NOW(), 
    v_payment_methods, 
    v_total, 
    0, 
    v_total, 
    'paid'
  ) RETURNING id INTO v_invoice_id;

  -- Procesar Items
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_prod_id := (v_item->>'id')::UUID;
    v_qty := (v_item->>'quantity')::INTEGER;
    
    SELECT price, cost, stock, name INTO v_prod_price, v_prod_cost, v_prod_stock, v_prod_name
    FROM products WHERE id = v_prod_id;

    v_new_stock := v_prod_stock - v_qty;
    v_subtotal_line := v_prod_price * v_qty;

    UPDATE products SET stock = v_new_stock WHERE id = v_prod_id;

    INSERT INTO invoice_items (
      organization_id, invoice_id, product_id, product_name, 
      quantity, unit_price, unit_cost, subtotal
    ) VALUES (
      p_org_id, v_invoice_id, v_prod_id, v_prod_name, 
      v_qty, v_prod_price, v_prod_cost, v_subtotal_line
    );

    INSERT INTO movements (
      organization_id, product_id, invoice_id, type, 
      quantity, previous_stock, new_stock, unit_cost, reference
    ) VALUES (
      p_org_id, v_prod_id, v_invoice_id, 'OUT', 
      v_qty, v_prod_stock, v_new_stock, v_prod_cost, 'Venta ' || v_generated_number
    );
  END LOOP;

  -- Manejo de Fiado
  FOR v_payment IN SELECT * FROM jsonb_array_elements(p_payments)
  LOOP
    IF (v_payment->>'method') = 'Fiado' THEN
       IF p_customer_id IS NULL THEN
          RAISE EXCEPTION 'Cliente requerido para fiar.';
       END IF;
       UPDATE customers
       SET current_debt = COALESCE(current_debt, 0) + (v_payment->>'amount')::NUMERIC
       WHERE id = p_customer_id;
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'invoice_id', v_invoice_id,
    'sale_number', v_generated_number,
    'total', v_total
  );

EXCEPTION WHEN OTHERS THEN
  RAISE EXCEPTION 'Error procesando venta: %', SQLERRM;
END;
$$;
