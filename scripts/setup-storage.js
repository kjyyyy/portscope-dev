#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

async function setupStorage() {
  console.log('🔧 Setting up Supabase Storage Buckets...\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase environment variables!');
    console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // List existing buckets
    console.log('📋 Checking existing buckets...');
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Error listing buckets:', listError.message);
      return;
    }

    console.log(`Found ${buckets.length} existing buckets:`);
    buckets.forEach(bucket => {
      console.log(`  📁 ${bucket.name} (${bucket.public ? 'public' : 'private'})`);
    });

    // Create required buckets (only the one actually used by the code)
    // Using private bucket for security (documents should be protected)
    const requiredBuckets = [
      { name: 'documents', public: false, fileSizeLimit: 100 * 1024 * 1024 } // 100MB
    ];

    console.log('\n🔧 Creating required buckets...');

    for (const bucketConfig of requiredBuckets) {
      const existingBucket = buckets.find(b => b.name === bucketConfig.name);
      
      if (existingBucket) {
        console.log(`✅ ${bucketConfig.name} already exists`);
        continue;
      }

      try {
        // Try creating via SQL (more reliable)
        const sql = `
          INSERT INTO storage.buckets (id, name, public, file_size_limit)
          VALUES (
            '${bucketConfig.name}',
            '${bucketConfig.name}',
            ${bucketConfig.public},
            ${bucketConfig.fileSizeLimit || 50 * 1024 * 1024}
          )
          ON CONFLICT (id) DO NOTHING;
        `;
        
        const { error: sqlError } = await supabase.rpc('exec_sql', { sql });
        
        if (sqlError) {
          // Fallback to storage API
          const { data, error } = await supabase.storage
            .createBucket(bucketConfig.name, {
              public: bucketConfig.public
            });

          if (error) {
            console.log(`⚠️  ${bucketConfig.name}: ${error.message}`);
            console.log(`\n📋 Please create the bucket manually using this SQL in Supabase SQL Editor:\n`);
            console.log(`INSERT INTO storage.buckets (id, name, public, file_size_limit)`);
            console.log(`VALUES ('${bucketConfig.name}', '${bucketConfig.name}', ${bucketConfig.public}, ${bucketConfig.fileSizeLimit || 50 * 1024 * 1024});\n`);
          } else {
            console.log(`✅ Created ${bucketConfig.name} bucket`);
          }
        } else {
          console.log(`✅ Created ${bucketConfig.name} bucket (via SQL)`);
        }
      } catch (err) {
        console.log(`⚠️  ${bucketConfig.name}: ${err.message}`);
        console.log(`\n📋 Please create the bucket manually using this SQL in Supabase SQL Editor:\n`);
        console.log(`INSERT INTO storage.buckets (id, name, public, file_size_limit)`);
        console.log(`VALUES ('${bucketConfig.name}', '${bucketConfig.name}', ${bucketConfig.public}, ${bucketConfig.fileSizeLimit || 50 * 1024 * 1024});\n`);
      }
    }

    // Test file upload
    console.log('\n🧪 Testing file upload...');
    try {
      const testContent = 'Test document for PortScope Dev';
      const testFileName = `test-${Date.now()}.txt`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(`test/${testFileName}`, testContent, {
          contentType: 'text/plain'
        });

      if (uploadError) {
        console.log('⚠️  Upload test failed:', uploadError.message);
      } else {
        console.log('✅ Upload test successful');
        
        // Get public URL
        const { data: urlData } = supabase.storage
          .from('documents')
          .getPublicUrl(`test/${testFileName}`);
        
        console.log(`🔗 Test file URL: ${urlData.publicUrl}`);

        // Clean up
        const { error: deleteError } = await supabase.storage
          .from('documents')
          .remove([`test/${testFileName}`]);
        
        if (!deleteError) {
          console.log('🧹 Test file cleaned up');
        }
      }
    } catch (err) {
      console.log('⚠️  Upload test error:', err.message);
    }

    console.log('\n🎉 Storage setup completed!');
    console.log('\n📝 Next steps:');
    console.log('1. Set up the database schema (run supabase/schema.sql in your Supabase dashboard)');
    console.log('2. Start your app: npm run dev');

  } catch (error) {
    console.error('❌ Storage setup failed:', error.message);
  }
}

setupStorage();
