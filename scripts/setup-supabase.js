#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function setupSupabase() {
  console.log('🔧 Setting up Supabase connection and storage...\n');

  // Check if environment variables are set
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables!');
    console.log('Please make sure you have:');
    console.log('- NEXT_PUBLIC_SUPABASE_URL');
    console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY');
    console.log('in your .env.local file');
    process.exit(1);
  }

  console.log('✅ Environment variables found');
  console.log(`📡 Supabase URL: ${supabaseUrl}`);

  // Initialize Supabase client
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Test connection
    console.log('\n🔍 Testing Supabase connection...');
    const { data, error } = await supabase.from('portfolio_companies').select('count').limit(1);
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "relation does not exist" which is expected if tables aren't created yet
      throw error;
    }
    
    console.log('✅ Supabase connection successful!');

    // Set up storage buckets
    console.log('\n📁 Setting up storage buckets...');
    
    // Create documents bucket
    try {
      const { data: documentsBucket, error: documentsError } = await supabase.storage
        .createBucket('documents', {
          public: true,
          allowedMimeTypes: [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
            'text/csv',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'image/png',
            'image/jpeg',
            'image/gif'
          ],
          fileSizeLimit: 50 * 1024 * 1024 // 50MB limit
        });

      if (documentsError) {
        if (documentsError.message.includes('already exists')) {
          console.log('✅ Documents bucket already exists');
        } else {
          throw documentsError;
        }
      } else {
        console.log('✅ Documents bucket created successfully');
      }
    } catch (error) {
      console.log('⚠️  Documents bucket setup:', error.message);
    }

    // Create company-specific buckets (we'll create a few example ones)
    const companyBuckets = ['company-docs', 'financial-reports', 'legal-documents'];
    
    for (const bucketName of companyBuckets) {
      try {
        const { data, error } = await supabase.storage
          .createBucket(bucketName, {
            public: false, // Private buckets for company-specific docs
            allowedMimeTypes: [
              'application/pdf',
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              'application/vnd.ms-excel',
              'text/csv',
              'application/msword',
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
              'image/png',
              'image/jpeg',
              'image/gif'
            ],
            fileSizeLimit: 100 * 1024 * 1024 // 100MB limit
          });

        if (error) {
          if (error.message.includes('already exists')) {
            console.log(`✅ ${bucketName} bucket already exists`);
          } else {
            throw error;
          }
        } else {
          console.log(`✅ ${bucketName} bucket created successfully`);
        }
      } catch (error) {
        console.log(`⚠️  ${bucketName} bucket setup:`, error.message);
      }
    }

    // Test file upload (create a test file)
    console.log('\n🧪 Testing file upload...');
    const testContent = 'This is a test document for PortScope Dev';
    const testFileName = `test-${Date.now()}.txt`;
    
    try {
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(`test/${testFileName}`, testContent, {
          contentType: 'text/plain'
        });

      if (uploadError) {
        throw uploadError;
      }

      console.log('✅ Test file upload successful');
      console.log(`📄 Uploaded: ${uploadData.path}`);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(`test/${testFileName}`);
      
      console.log(`🔗 Public URL: ${urlData.publicUrl}`);

      // Clean up test file
      const { error: deleteError } = await supabase.storage
        .from('documents')
        .remove([`test/${testFileName}`]);
      
      if (!deleteError) {
        console.log('🧹 Test file cleaned up');
      }

    } catch (error) {
      console.log('⚠️  File upload test failed:', error.message);
    }

    // List all buckets
    console.log('\n📋 Current storage buckets:');
    try {
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        throw bucketsError;
      }

      buckets.forEach(bucket => {
        console.log(`  📁 ${bucket.name} (${bucket.public ? 'public' : 'private'})`);
      });
    } catch (error) {
      console.log('⚠️  Could not list buckets:', error.message);
    }

    console.log('\n🎉 Supabase setup completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Run the database schema: supabase/schema.sql');
    console.log('2. Start your development server: npm run dev');
    console.log('3. Test the portfolio company onboarding flow');

  } catch (error) {
    console.error('❌ Supabase setup failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check your .env.local file has correct Supabase credentials');
    console.log('2. Make sure your Supabase project is active');
    console.log('3. Verify your Supabase URL and API key are correct');
    process.exit(1);
  }
}

setupSupabase();
