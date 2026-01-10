create table if not exists expenses (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references organizations(id),
  description text,
  amount decimal(12,2) not null, -- Negative for expense, positive for adjustment
  type text, -- 'expense', 'income', 'sale' (if we map it here, but sales come from invoices)
  category text, -- 'General', 'Services', etc
  payment_method text default 'Efectivo',
  date timestamp with time zone default now(),
  created_at timestamp with time zone default now(),
  user_id uuid references profiles(id)
);

alter table expenses enable row level security;
drop policy if exists "Allow All" on expenses;
create policy "Allow All" on expenses for all using (true) with check (true);
