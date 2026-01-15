-- Create expenses table
CREATE TABLE IF NOT EXISTS public.cash_expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES public.organizations(id),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    amount DECIMAL(12, 2) NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('provider', 'utility', 'salary', 'personal', 'other')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.cash_expenses ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view cash_expenses of their organization" 
ON public.cash_expenses FOR SELECT 
USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert cash_expenses for their organization" 
ON public.cash_expenses FOR INSERT 
WITH CHECK (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can delete cash_expenses of their organization" 
ON public.cash_expenses FOR DELETE 
USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- Index
CREATE INDEX idx_cash_expenses_org_date ON public.cash_expenses(organization_id, created_at);
