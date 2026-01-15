-- Create table for storing cash closes (Cierres de Caja)
create table if not exists public.cash_closes (
  id uuid default gen_random_uuid() primary key,
  organization_id uuid references public.organizations(id) not null,
  user_id uuid references auth.users(id),
  opened_at timestamptz, -- Optional: when the shift started
  closed_at timestamptz default now() not null,
  
  -- System calculated totals
  system_cash_total numeric default 0,
  system_card_total numeric default 0,
  system_transfer_total numeric default 0,
  system_credit_total numeric default 0,
  system_other_total numeric default 0,
  system_grand_total numeric default 0,
  
  -- User counted totals
  counted_cash_total numeric default 0,
  
  -- Difference (Counted - System Cash)
  difference numeric default 0,
  
  -- Breakdown of cash denominations (stored as JSON)
  -- Example: { "100000": 5, "50000": 2, ... }
  cash_denomination_details jsonb default '{}'::jsonb,
  
  observations text,
  
  created_at timestamptz default now() not null
);

-- Enable RLS
alter table public.cash_closes enable row level security;

-- Policies
create policy "Users can view cash closes for their organization"
  on public.cash_closes for select
  using ( organization_id in (
    select organization_id from public.profiles 
    where id = auth.uid()
  ));

create policy "Users can insert cash closes for their organization"
  on public.cash_closes for insert
  with check ( organization_id in (
    select organization_id from public.profiles 
    where id = auth.uid()
  ));
