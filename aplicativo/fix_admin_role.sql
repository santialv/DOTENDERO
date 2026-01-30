-- Helper script to fix the super admin role
-- Run this in your Supabase SQL Editor

DO $$
BEGIN
    UPDATE public.profiles
    SET role = 'super_admin'
    WHERE email = 'admin@dontendero.com';

    RAISE NOTICE 'Role updated for admin@dontendero.com';
END $$;
