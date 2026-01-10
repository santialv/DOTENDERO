-- Run this in your Supabase SQL Editor to fix the missing policies for the Kardex (Movements)

-- 1. Policies for Movements Table
alter table movements enable row level security;

create policy "View Org Movements" on movements
  for select
  using (organization_id = get_org_id());

create policy "Manage Org Movements" on movements
  for all
  using (organization_id = get_org_id());

-- 2. Verify get_org_id function exists (Dependency)
-- create or replace function get_org_id()
-- returns uuid as $$
--   select organization_id from profiles where id = auth.uid();
-- $$ language sql security definer;
