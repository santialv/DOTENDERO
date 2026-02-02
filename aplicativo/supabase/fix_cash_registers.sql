-- HEALING SCRIPT: Fix missing cash_registers and associated logic
-- Run this in your Supabase SQL Editor

-- 1. Ensure extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Cash Registers table
CREATE TABLE IF NOT EXISTS public.cash_registers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3. Enable RLS for cash_registers
ALTER TABLE public.cash_registers ENABLE ROW LEVEL SECURITY;

-- 4. Policies for cash_registers
DROP POLICY IF EXISTS "Users can manage their organization registers" ON public.cash_registers;
CREATE POLICY "Users can manage their organization registers" ON public.cash_registers
  FOR ALL USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- 5. Add register_id to cash_shifts if missing
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cash_shifts' AND column_name='register_id') THEN
    ALTER TABLE public.cash_shifts ADD COLUMN register_id UUID REFERENCES public.cash_registers(id);
  END IF;
END $$;

-- 6. Add organization_id to cash_movements if missing
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cash_movements' AND column_name='organization_id') THEN
    ALTER TABLE public.cash_movements ADD COLUMN organization_id UUID REFERENCES public.organizations(id);
  END IF;
END $$;

-- 7. Add shift_id to invoices if missing
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invoices' AND column_name='shift_id') THEN
    ALTER TABLE public.invoices ADD COLUMN shift_id UUID REFERENCES public.cash_shifts(id);
  END IF;
END $$;

-- 8. Default Register Generation & Data Migration
DO $$
DECLARE
  v_org RECORD;
  v_reg_id UUID;
BEGIN
  FOR v_org IN SELECT id FROM public.organizations LOOP
    -- Check if it has any register
    SELECT id INTO v_reg_id FROM public.cash_registers WHERE organization_id = v_org.id LIMIT 1;
    
    IF v_reg_id IS NULL THEN
      INSERT INTO public.cash_registers (organization_id, name, description)
      VALUES (v_org.id, 'Caja Principal', 'Caja creada automáticamente por el sistema')
      RETURNING id INTO v_reg_id;
    END IF;
    
    -- Link existing shifts of this org that have no register_id
    UPDATE public.cash_shifts SET register_id = v_reg_id 
    WHERE organization_id = v_org.id AND register_id IS NULL;
  END LOOP;
END $$;

-- 9. Final constraints (Safe to fail if data not fully migratable, but recommended)
-- ALTER TABLE public.cash_shifts ALTER COLUMN register_id SET NOT NULL;

-- 10. Force Cache Reload (Dummy change)
ALTER TABLE public.cash_registers ALTER COLUMN name SET DATA TYPE TEXT;
