-- Clean up script with DEPENDENCY HANDLING
-- 1. Unlink profiles from organizations that have no email (garbage orgs)
UPDATE profiles
SET organization_id = NULL
WHERE organization_id IN (
    SELECT id FROM organizations WHERE email IS NULL
);

-- 2. NOW delete the orgs (no more FK violations)
DELETE FROM organizations WHERE email IS NULL;

-- Optional: If you want to delete specific test user 'santyavplez@gmail.com' but clean
-- UPDATE profiles SET organization_id = NULL WHERE organization_id IN (SELECT id FROM organizations WHERE email = 'other@gmail.com');
-- DELETE FROM organizations WHERE email = 'other@gmail.com';
