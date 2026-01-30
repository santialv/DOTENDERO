-- Migration: 20260130_tax_compliance.sql
-- Description: Add support for DIAN tax compliance (taxes table, product_taxes, product fields)

-- 1. Create Taxes Table
CREATE TABLE IF NOT EXISTS public.taxes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL, -- e.g., 'IVA 19%', 'Impoconsumo 8%'
  code TEXT NOT NULL, -- DIAN Code: '01', '04', '22', '23'
  rate NUMERIC NOT NULL DEFAULT 0, -- Percentage or Fixed Value
  type TEXT NOT NULL DEFAULT 'percentage', -- 'percentage', 'fixed'
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on taxes
ALTER TABLE public.taxes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view taxes of their organization" 
ON public.taxes FOR SELECT 
USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert taxes for their organization" 
ON public.taxes FOR INSERT 
WITH CHECK (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update taxes of their organization" 
ON public.taxes FOR UPDATE 
USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can delete taxes of their organization" 
ON public.taxes FOR DELETE 
USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));


-- 2. Create Product-Taxes Join Table (Many-to-Many)
CREATE TABLE IF NOT EXISTS public.product_taxes (
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  tax_id UUID REFERENCES public.taxes(id) ON DELETE CASCADE NOT NULL,
  PRIMARY KEY (product_id, tax_id)
);

-- Enable RLS on product_taxes
ALTER TABLE public.product_taxes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view product_taxes of their organization (via product)" 
ON public.product_taxes FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.products p
    JOIN public.profiles pr ON pr.organization_id = p.organization_id
    WHERE p.id = product_taxes.product_id AND pr.id = auth.uid()
  )
);

CREATE POLICY "Users can edit product_taxes of their organization" 
ON public.product_taxes FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.products p
    JOIN public.profiles pr ON pr.organization_id = p.organization_id
    WHERE p.id = product_taxes.product_id AND pr.id = auth.uid()
  )
);


-- 3. Update Products Table with Mandatory DIAN fields
-- unit field usually exists, checking standardization
-- We'll just ensure columns exist.

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'price_includes_tax') THEN
        ALTER TABLE public.products ADD COLUMN price_includes_tax BOOLEAN DEFAULT false;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'is_service') THEN
        ALTER TABLE public.products ADD COLUMN is_service BOOLEAN DEFAULT false;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'fiscal_classification') THEN
        ALTER TABLE public.products ADD COLUMN fiscal_classification TEXT DEFAULT 'gravado'; -- 'gravado', 'exento', 'excluido', 'no_gravado'
    END IF;

     IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'standard_code_id') THEN
        -- Might be useful for IBUA unit reference or similar, but simplified for now.
        -- ALTER TABLE public.products ADD COLUMN standard_code_id TEXT;
        NULL;
    END IF;
END $$;
