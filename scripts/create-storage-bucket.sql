-- ============================================================================
-- SUPABASE STORAGE BUCKET SETUP
-- ============================================================================
-- IMPORTANT: You cannot create storage buckets directly via SQL in Supabase.
-- Use the Supabase Dashboard or the Storage API instead.
-- 
-- This SQL file contains ONLY the RLS policies for the storage.objects table.
-- ============================================================================
-- 
-- STEP 1: Create the bucket via Dashboard
--   1. Go to Supabase Dashboard → Storage
--   2. Click "New bucket"
--   3. Name: documents
--   4. Public: No (unchecked)
--   5. File size limit: 100MB
--   6. Click "Create bucket"
--
-- STEP 2: Run the policies below (this file)
-- ============================================================================

-- ============================================================================
-- STORAGE RLS POLICIES
-- ============================================================================
-- These policies control access to files in the 'documents' bucket
-- ============================================================================

-- Policy: Allow authenticated users to upload documents to their company folders
DROP POLICY IF EXISTS "Users can upload documents to their companies" ON storage.objects;
CREATE POLICY "Users can upload documents to their companies"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM portfolio_companies 
    WHERE created_by = auth.uid()
  )
);

-- Policy: Allow users to read documents from their companies
DROP POLICY IF EXISTS "Users can read documents from their companies" ON storage.objects;
CREATE POLICY "Users can read documents from their companies"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM portfolio_companies 
    WHERE created_by = auth.uid()
  )
);

-- Policy: Allow users to update documents from their companies
DROP POLICY IF EXISTS "Users can update documents from their companies" ON storage.objects;
CREATE POLICY "Users can update documents from their companies"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM portfolio_companies 
    WHERE created_by = auth.uid()
  )
);

-- Policy: Allow users to delete documents from their companies
DROP POLICY IF EXISTS "Users can delete documents from their companies" ON storage.objects;
CREATE POLICY "Users can delete documents from their companies"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM portfolio_companies 
    WHERE created_by = auth.uid()
  )
);

