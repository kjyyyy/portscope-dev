#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

console.log('🔧 PortScope Dev - Supabase Connection Test\n');

// Check environment variables
console.log('📋 Checking environment variables...');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log(`NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✅ Set' : '❌ Missing'}`);
console.log(`NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseKey ? '✅ Set' : '❌ Missing'}`);

if (!supabaseUrl || !supabaseKey) {
  console.log('\n❌ Missing Supabase environment variables!');
  console.log('\n📝 Please add these to your .env.local file:');
  console.log('NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here');
  console.log('\n🔗 Get these values from your Supabase dashboard:');
  console.log('1. Go to https://supabase.com/dashboard');
  console.log('2. Select your project');
  console.log('3. Go to Settings → API');
  console.log('4. Copy the Project URL and anon public key');
  process.exit(1);
}

// Test connection
console.log('\n🔍 Testing Supabase connection...');
const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    // Test basic connection
    const { data, error } = await supabase.from('portfolio_companies').select('count').limit(1);
    
    if (error && error.code !== 'PGRST116') {
      console.log('⚠️  Database tables not created yet (this is normal)');
      console.log('   Error:', error.message);
    } else {
      console.log('✅ Database connection successful!');
    }

    // Test storage
    console.log('\n📁 Testing storage...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.log('❌ Storage test failed:', bucketsError.message);
      return;
    }

    console.log('✅ Storage connection successful!');
    console.log(`📋 Found ${buckets.length} storage buckets:`);
    
    buckets.forEach(bucket => {
      console.log(`  📁 ${bucket.name} (${bucket.public ? 'public' : 'private'})`);
    });

    // Create required buckets if they don't exist
    console.log('\n🔧 Setting up required storage buckets...');
    
    const requiredBuckets = [
      { name: 'documents', public: true },
      { name: 'company-docs', public: false },
      { name: 'financial-reports', public: false },
      { name: 'legal-documents', public: false }
    ];

    for (const bucketConfig of requiredBuckets) {
      const existingBucket = buckets.find(b => b.name === bucketConfig.name);
      
      if (existingBucket) {
        console.log(`✅ ${bucketConfig.name} bucket already exists`);
      } else {
        try {
          const { data, error } = await supabase.storage
            .createBucket(bucketConfig.name, {
              public: bucketConfig.public,
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
              fileSizeLimit: 100 * 1024 * 1024 // 100MB
            });

          if (error) {
            console.log(`⚠️  Could not create ${bucketConfig.name}:`, error.message);
          } else {
            console.log(`✅ Created ${bucketConfig.name} bucket`);
          }
        } catch (err) {
          console.log(`⚠️  Error creating ${bucketConfig.name}:`, err.message);
        }
      }
    }

    console.log('\n🎉 Supabase setup completed!');
    console.log('\n📝 Next steps:');
    console.log('1. Run the database schema in your Supabase dashboard');
    console.log('2. Copy the SQL from supabase/schema.sql');
    console.log('3. Run it in the SQL Editor');
    console.log('4. Start your app: npm run dev');

  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check your Supabase project is active');
    console.log('2. Verify your API keys are correct');
    console.log('3. Make sure your project URL is correct');
  }
}

testConnection();
