-- 1. Add role column to profiles if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') THEN
        ALTER TABLE profiles ADD COLUMN role text DEFAULT 'user';
    END IF;
END $$;

-- 2. Create a function to handle new user profile creation with auto-admin assignment
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, organization_id, role)
  VALUES (
    new.id, 
    new.email, 
    (new.raw_user_meta_data->>'organization_id')::uuid,
    CASE 
        WHEN new.email = 'admin@dontendero.com' THEN 'super_admin'
        ELSE 'user'
    END
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Ensure the trigger exists (Recreating it to ensure it uses the new logic)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. If the user ALREADY exists in profiles, update them
UPDATE public.profiles
SET role = 'super_admin'
WHERE email = 'admin@dontendero.com';
