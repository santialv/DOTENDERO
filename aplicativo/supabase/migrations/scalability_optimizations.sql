-- OPTIMIZACIÓN ESTRUCTURAL PARA ESCALABILIDAD (100k USUARIOS)
-- Este script crea Vistas y Funciones para descargar el procesamiento del cliente al servidor.

-- 1. FUNCIÓN PARA OBTENER CATEGORÍAS ÚNICAS (Sin descargar 5000 productos)
CREATE OR REPLACE FUNCTION get_unique_categories(p_org_id UUID)
RETURNS TABLE (category TEXT) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT p.category
  FROM products p
  WHERE p.organization_id = p_org_id
  AND p.category IS NOT NULL
  ORDER BY p.category;
END;
$$;

-- 2. VISTA UNIFICADA DE TRANSACCIONES (VENTAS + GASTOS)
-- Permite paginar historial completo ordenado por fecha sin lógica compleja en JS.
CREATE OR REPLACE VIEW all_transactions_view AS
SELECT 
    i.id AS id,
    i.date AS date,
    'income' AS type,
    CASE 
        WHEN i.payment_method ILIKE '%Tarjeta%' THEN 'Tarjeta'
        WHEN i.payment_method ILIKE '%QR%' THEN 'QR'
        WHEN i.payment_method ILIKE '%Fiado%' THEN 'Fiado'
        ELSE 'Efectivo'
    END AS method,
    i.total AS amount,
    ('Venta ' || i.number || ' - ' || i.status) AS description,
    'Cliente' AS customer_name, -- Ojo: En V2 idealmente hacer JOIN con customers
    i.organization_id,
    i.number AS reference_number
FROM invoices i

UNION ALL

SELECT 
    e.id AS id,
    e.date AS date,
    CASE WHEN e.amount < 0 THEN 'expense' ELSE 'income' END AS type,
    e.payment_method AS method,
    e.amount AS amount,
    e.description AS description,
    'General' AS customer_name,
    e.organization_id,
    'MANUAL' AS reference_number
FROM expenses e;

-- 3. FUNCIÓN DE ESTADÍSTICAS RÁPIDAS
-- Calcula totales filtrados sin traer todas las filas a la memoria del navegador.
CREATE OR REPLACE FUNCTION get_transaction_stats(
    p_org_id UUID,
    p_start_date TIMESTAMPTZ DEFAULT NULL,
    p_end_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_total_cash NUMERIC := 0;
    v_total_bank NUMERIC := 0;
    v_total_credit NUMERIC := 0;
BEGIN
    SELECT 
        COALESCE(SUM(CASE WHEN method = 'Efectivo' THEN amount ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN method = 'Tarjeta' OR method = 'QR' THEN amount ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN method = 'Fiado' THEN amount ELSE 0 END), 0)
    INTO v_total_cash, v_total_bank, v_total_credit
    FROM all_transactions_view
    WHERE organization_id = p_org_id
    AND (p_start_date IS NULL OR date >= p_start_date)
    AND (p_end_date IS NULL OR date <= p_end_date);

    RETURN jsonb_build_object(
        'totalCash', v_total_cash,
        'totalBank', v_total_bank,
        'totalFiado', v_total_credit
    );
END;
$$;
