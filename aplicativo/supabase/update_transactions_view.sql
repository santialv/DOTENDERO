-- Mejorar la vista de transacciones para incluir nombres reales de clientes y usar created_at si está disponible (o date con cast)
-- Esto arregla el filtrado por cliente y asegura tipos de datos consistentes.

CREATE OR REPLACE VIEW all_transactions_view AS
SELECT 
    i.id::text AS id, -- Cast a texto para uniformidad
    i.date AS date,   -- Asumimos que date es TIMESTAMP o TIMESTAMPTZ. Si fuera DATE puro, habría que castear.
    'income' AS type,
    CASE 
        WHEN i.payment_method ILIKE '%Tarjeta%' THEN 'Tarjeta'
        WHEN i.payment_method ILIKE '%QR%' THEN 'QR'
        WHEN i.payment_method ILIKE '%Fiado%' THEN 'Fiado'
        ELSE 'Efectivo'
    END AS method,
    i.total AS amount,
    ('Venta #' || COALESCE(i.number::text, '???')) AS description,
    COALESCE(c.name, 'Cliente General') AS customer_name,
    i.organization_id,
    i.number::text AS reference_number
FROM invoices i
LEFT JOIN customers c ON i.customer_id = c.id

UNION ALL

SELECT 
    e.id::text AS id,
    e.date AS date,
    CASE WHEN e.amount < 0 THEN 'expense' ELSE 'income' END AS type,
    e.payment_method AS method,
    e.amount AS amount,
    e.description AS description,
    'General' AS customer_name,
    e.organization_id,
    'MANUAL' AS reference_number
FROM expenses e;
