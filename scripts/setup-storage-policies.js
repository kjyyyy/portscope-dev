#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

async function setupStoragePolicies() {
  console.log('🔧 Setting up Supabase Storage RLS Policies...\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase environment variables!');
    console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // SQL to create storage policies
    const policies = `
-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to upload documents to their company folders
CREATE POLICY IF NOT EXISTS "Users can upload documents to their companies"
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
CREATE POLICY IF NOT EXISTS "Users can read documents from their companies"
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
CREATE POLICY IF NOT EXISTS "Users can update documents from their companies"
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
CREATE POLICY IF NOT EXISTS "Users can delete documents from their companies"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM portfolio_companies 
    WHERE created_by = auth.uid()
  )
);
`;

    console.log('📝 Creating storage policies...');
    
    // Execute policies using Supabase REST API (via SQL)
    const { data, error } = await supabase.rpc('exec_sql', { sql: policies });
    
    if (error) {
      // If RPC doesn't exist, provide manual instructions
      console.log('⚠️  Could not execute policies automatically.');
      console.log('📋 Please run the following SQL in your Supabase SQL Editor:\n');
      console.log(policies);
      console.log('\n');
    } else {
      console.log('✅ Storage policies created successfully!');
    }

    console.log('\n🎉 Storage policy setup completed!');
    console.log('\n📝 Note: If policies were not created automatically,');
    console.log('   please run the SQL above in your Supabase SQL Editor.');

  } catch (error) {
    console.error('❌ Storage policy setup failed:', error.message);
    console.log('\n📋 Please run the following SQL manually in your Supabase SQL Editor:\n');
    console.log(`
-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to upload documents to their company folders
CREATE POLICY IF NOT EXISTS "Users can upload documents to their companies"
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
CREATE POLICY IF NOT EXISTS "Users can read documents from their companies"
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
CREATE POLICY IF NOT EXISTS "Users can update documents from their companies"
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
CREATE POLICY IF NOT EXISTS "Users can delete documents from their companies"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM portfolio_companies 
    WHERE created_by = auth.uid()
  )
);
    `);
  }
}

setupStoragePolicies();

