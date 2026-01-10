-- Enable the storage extension if not already enabled (usually enabled by default in Supabase)
-- CREATE EXTENSION IF NOT EXISTS "storage";

-- 1. Create Buckets
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES 
    ('logos', 'logos', true, false, 2097152, ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp']), -- 2MB Limit
    ('documents', 'documents', false, false, 5242880, ARRAY['application/pdf', 'image/jpeg', 'image/png']), -- 5MB Limit (Private)
    ('products', 'products', true, false, 5242880, ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp']) -- 5MB Limit
ON CONFLICT (id) DO UPDATE SET 
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Security Policies (RLS)

-- A. LOGOS BUCKET
-- Allow public access to view logos
CREATE POLICY "Public Access Logos" ON storage.objects FOR SELECT USING (bucket_id = 'logos');

-- Allow authenticated users to upload their own logo
CREATE POLICY "Auth Upload Logos" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'logos' 
    AND auth.role() = 'authenticated'
);

-- Allow users to update their own logo
CREATE POLICY "Auth Update Logos" ON storage.objects FOR UPDATE USING (
    bucket_id = 'logos' 
    AND auth.role() = 'authenticated'
);

-- B. DOCUMENTS BUCKET (RUT, etc.) - PRIVATE
-- Only allow users to see their own documents (logic simplified for now: auth users can read own uploads)
CREATE POLICY "Auth Read Documents" ON storage.objects FOR SELECT USING (
    bucket_id = 'documents' 
    AND auth.role() = 'authenticated' 
    AND (storage.foldername(name))[1] = auth.uid()::text -- Folder strategy: documents/USER_ID/filename
);

-- Allow upload to own folder
CREATE POLICY "Auth Upload Documents" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'documents' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- C. PRODUCTS BUCKET
-- Public read for store fronts
CREATE POLICY "Public Access Products" ON storage.objects FOR SELECT USING (bucket_id = 'products');

-- Auth upload for store owners
CREATE POLICY "Auth Upload Products" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'products' 
    AND auth.role() = 'authenticated'
);
