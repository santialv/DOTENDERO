-- FIX: RLS Policies for Onboarding Flow
-- Allows users to find their own organizations even if they are not linked yet,
-- and allows them to create their first organization if the trigger is not working.

-- 1. Allow search by email (even if not linked to profile)
drop policy if exists "Allow Find By Email" on organizations;
create policy "Allow Find By Email" on organizations
  for select
  using (email = auth.jwt() ->> 'email');

-- 2. Allow creating a new organization during onboarding
drop policy if exists "Allow Insert During Onboarding" on organizations;
create policy "Allow Insert During Onboarding" on organizations
  for insert
  with check (true); -- We rely on the app logic to link it to the profile immediately

-- 3. Ensure profiles are publicly readable by owners (already exists but just in case)
drop policy if exists "Users can see own profile" on profiles;
create policy "Users can see own profile" on profiles
  for select
  using (id = auth.uid());

-- 4. Allow profile update for organization link
drop policy if exists "Allow link org to profile" on profiles;
create policy "Allow link org to profile" on profiles
  for all -- Permitimos 'all' para manejar upsert (insert+update)
  using (id = auth.uid())
  with check (id = auth.uid());
