-- FIX RLS FOR PLANS TABLE
-- Upsert requires both INSERT and UPDATE permissions

DROP POLICY IF EXISTS "Allow admin update access to plans" ON public.plans;
DROP POLICY IF EXISTS "Allow admin insert access to plans" ON public.plans;
DROP POLICY IF EXISTS "Allow admin all access to plans" ON public.plans;

-- Create a comprehensive policy for authenticated users (admins)
CREATE POLICY "Allow admin all access to plans" ON public.plans
    FOR ALL 
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Ensure the columns we are sending in upsert are correctly handled
-- If 'features' is stored as JSONB, Postgres handles it automatically if passed as object.
