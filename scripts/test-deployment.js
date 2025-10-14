#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

console.log('🚀 PortScope Dev - Deployment Test\n');

// Check environment variables
console.log('📋 Checking environment variables...');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const appName = process.env.NEXT_PUBLIC_APP_NAME;
const appUrl = process.env.NEXT_PUBLIC_APP_URL;
const appPassword = process.env.APP_PASSWORD;

console.log(`NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✅ Set' : '❌ Missing'}`);
console.log(`NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseKey ? '✅ Set' : '❌ Missing'}`);
console.log(`NEXT_PUBLIC_APP_NAME: ${appName ? '✅ Set' : '❌ Missing'}`);
console.log(`NEXT_PUBLIC_APP_URL: ${appUrl ? '✅ Set' : '❌ Missing'}`);
console.log(`APP_PASSWORD: ${appPassword ? '✅ Set' : '❌ Missing'}`);

if (!supabaseUrl || !supabaseKey) {
  console.log('\n❌ Missing critical Supabase environment variables!');
  console.log('\n📝 Please add these to your Vercel environment variables:');
  console.log('NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here');
  process.exit(1);
}

// Test Supabase connection
console.log('\n🔍 Testing Supabase connection...');
const supabase = createClient(supabaseUrl, supabaseKey);

async function testDeployment() {
  try {
    // Test database connection
    const { data, error } = await supabase.from('portfolio_companies').select('count').limit(1);
    
    if (error && error.code !== 'PGRST116') {
      console.log('⚠️  Database tables not created yet');
      console.log('   Please run the SQL schema in your Supabase dashboard');
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

    // Check for required buckets
    const requiredBuckets = ['documents', 'company-docs', 'financial-reports', 'legal-documents'];
    const existingBucketNames = buckets.map(b => b.name);
    
    console.log('\n🔧 Checking required storage buckets...');
    requiredBuckets.forEach(bucketName => {
      if (existingBucketNames.includes(bucketName)) {
        console.log(`✅ ${bucketName} bucket exists`);
      } else {
        console.log(`❌ ${bucketName} bucket missing - please create it in Supabase`);
      }
    });

    console.log('\n🎉 Deployment test completed!');
    console.log('\n📝 Next steps:');
    console.log('1. Set up Supabase database schema (run supabase/schema.sql)');
    console.log('2. Create required storage buckets');
    console.log('3. Deploy to Vercel with environment variables');
    console.log('4. Test the deployed application');

  } catch (error) {
    console.error('❌ Deployment test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check your Supabase project is active');
    console.log('2. Verify your API keys are correct');
    console.log('3. Make sure your project URL is correct');
  }
}

testDeployment();
