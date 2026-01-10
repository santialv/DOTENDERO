-- 1. Helper Function to get Current User's Organization
create or replace function get_my_org_id()
returns uuid language sql security definer stable as $$
  select organization_id from public.profiles where id = auth.uid()
$$;

-- 2. Trigger for New Users (Auto-create Org & Profile)
create or replace function public.handle_new_user()
returns trigger as $$
declare
  new_org_id uuid;
begin
  -- Create a new Organization for the user
  insert into public.organizations (name, created_at)
  values ('Mi Tienda - ' || new.email, now())
  returning id into new_org_id;

  -- Create a Profile linked to that Org
  insert into public.profiles (id, organization_id, role, created_at)
  values (new.id, new_org_id, 'admin', now());

  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists to avoid dupes during dev re-runs
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. APPLY RLS POLICIES (Lock Down Tables)

-- Products
alter table products enable row level security;
drop policy if exists "Tenant Access" on products;
drop policy if exists "Allow All" on products;
create policy "Tenant Access" on products
  for all using (organization_id = get_my_org_id())
  with check (organization_id = get_my_org_id());

-- Customers
alter table customers enable row level security;
drop policy if exists "Tenant Access" on customers;
drop policy if exists "Allow All" on customers;
create policy "Tenant Access" on customers
  for all using (organization_id = get_my_org_id())
  with check (organization_id = get_my_org_id());

-- Expenses
alter table expenses enable row level security;
drop policy if exists "Tenant Access" on expenses;
drop policy if exists "Allow All" on expenses;
create policy "Tenant Access" on expenses
  for all using (organization_id = get_my_org_id())
  with check (organization_id = get_my_org_id());

-- Invoices (Sales)
alter table invoices enable row level security;
drop policy if exists "Tenant Access" on invoices;
drop policy if exists "Allow All" on invoices;
create policy "Tenant Access" on invoices
  for all using (organization_id = get_my_org_id())
  with check (organization_id = get_my_org_id());

-- Purchases
alter table purchases enable row level security;
drop policy if exists "Tenant Access" on purchases;
drop policy if exists "Allow All" on purchases;
create policy "Tenant Access" on purchases
  for all using (organization_id = get_my_org_id())
  with check (organization_id = get_my_org_id());

-- Movements
alter table movements enable row level security;
drop policy if exists "Tenant Access" on movements;
drop policy if exists "Allow All" on movements;
create policy "Tenant Access" on movements
  for all using (organization_id = get_my_org_id())
  with check (organization_id = get_my_org_id());

-- Invoice Items (Linked via Invoice)
alter table invoice_items enable row level security;
drop policy if exists "Tenant Access" on invoice_items;
drop policy if exists "Allow All" on invoice_items;
create policy "Tenant Access" on invoice_items
  for all using (
    exists (
      select 1 from invoices 
      where invoices.id = invoice_items.invoice_id 
      and invoices.organization_id = get_my_org_id()
    )
  )
  with check (
    exists (
      select 1 from invoices 
      where invoices.id = invoice_items.invoice_id 
      and invoices.organization_id = get_my_org_id()
    )
  );

-- Purchase Items (Linked via Purchase)
alter table purchase_items enable row level security;
drop policy if exists "Tenant Access" on purchase_items;
drop policy if exists "Allow All" on purchase_items;
create policy "Tenant Access" on purchase_items
  for all using (
    exists (
      select 1 from purchases 
      where purchases.id = purchase_items.purchase_id 
      and purchases.organization_id = get_my_org_id()
    )
  )
  with check (
    exists (
      select 1 from purchases 
      where purchases.id = purchase_items.purchase_id 
      and purchases.organization_id = get_my_org_id()
    )
  );

-- Organizations (Read Only Own)
alter table organizations enable row level security;
drop policy if exists "Tenant Access" on organizations;
drop policy if exists "Allow All" on organizations;
create policy "Tenant Access" on organizations
  for select using (id = get_my_org_id());
create policy "Tenant Update" on organizations
  for update using (id = get_my_org_id());

-- Profiles
alter table profiles enable row level security;
drop policy if exists "Tenant Access" on profiles;
drop policy if exists "Allow All" on profiles;
create policy "Tenant Access" on profiles
  for select using (id = auth.uid());
