-- Multi-Cashier (Multi-Caja) Functionality Extension
-- This script extends the existing basic shift tracking to support multiple registers.

-- 1. Create Cash Registers table if not exists
create table if not exists public.cash_registers (
  id uuid default gen_random_uuid() primary key,
  organization_id uuid references public.organizations(id) on delete cascade not null,
  name text not null,
  description text,
  status text default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Enable RLS for cash_registers
alter table public.cash_registers enable row level security;
do $$ 
begin
  if not exists (select 1 from pg_policies where policyname = 'Users can manage their organization registers') then
    create policy "Users can manage their organization registers" on public.cash_registers
      for all using (organization_id = (select organization_id from profiles where id = auth.uid()));
  end if;
end $$;

-- 2. Add register_id to cash_shifts if not exists
do $$ 
begin
  if not exists (select 1 from information_schema.columns where table_name='cash_shifts' and column_name='register_id') then
    alter table public.cash_shifts add column register_id uuid references public.cash_registers(id);
  end if;
end $$;

-- 3. Ensure cash_movements has what we need
do $$ 
begin
  if not exists (select 1 from information_schema.columns where table_name='cash_movements' and column_name='organization_id') then
    alter table public.cash_movements add column organization_id uuid references public.organizations(id);
  end if;
  if not exists (select 1 from information_schema.columns where table_name='cash_movements' and column_name='user_id') then
    alter table public.cash_movements add column user_id uuid references auth.users(id);
  end if;
end $$;

-- 4. Link Invoices to Shifts if not exists
do $$ 
begin
  if not exists (select 1 from information_schema.columns where table_name='invoices' and column_name='shift_id') then
    alter table public.invoices add column shift_id uuid references public.cash_shifts(id);
  end if;
end $$;

-- 5. Default Register Logic:
-- For every organization, create a "Caja Principal" if they don't have any.
-- Then link existing shifts to that Caja.
do $$
declare
  v_org record;
  v_reg_id uuid;
begin
  for v_org in select id from public.organizations loop
    -- Check if it has any register
    select id into v_reg_id from public.cash_registers where organization_id = v_org.id limit 1;
    
    if v_reg_id is null then
      insert into public.cash_registers (organization_id, name, description)
      values (v_org.id, 'Caja Principal', 'Caja creada automáticamente por el sistema')
      returning id into v_reg_id;
    end if;
    
    -- Link existing shifts of this org that have no register_id
    update public.cash_shifts set register_id = v_reg_id 
    where organization_id = v_org.id and register_id is null;
  end loop;
end $$;

-- 6. Add constraints after data fix
alter table public.cash_shifts alter column register_id set not null;

-- Indexes for performance
create index if not exists idx_cash_shifts_register on public.cash_shifts(register_id);
create index if not exists idx_invoices_shift_id on public.invoices(shift_id);
create index if not exists idx_cash_registers_org on public.cash_registers(organization_id);
