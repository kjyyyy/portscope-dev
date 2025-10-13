# 🚀 Manual Supabase Setup Guide

Your Supabase connection is working! Now you need to set up the database and storage manually through the Supabase dashboard.

## ✅ Connection Status
- **Supabase URL**: ✅ Connected
- **API Key**: ✅ Valid
- **Database**: ⚠️ Tables need to be created
- **Storage**: ⚠️ Buckets need to be created

## 📊 Step 1: Set Up Database Schema

1. **Go to your Supabase dashboard**: https://supabase.com/dashboard
2. **Select your project**: `cissaskkkeevehhlkmiu`
3. **Go to SQL Editor** (left sidebar)
4. **Click "New Query"**
5. **Copy the entire contents of `supabase/schema.sql`** and paste it
6. **Click "Run"** to execute the schema

This will create all the necessary tables:
- `portfolio_companies`
- `documents`
- `document_tags`
- `investment_contacts`
- `performance_updates`

## 📁 Step 2: Set Up Storage Buckets

1. **Go to Storage** (left sidebar in Supabase dashboard)
2. **Click "Create a new bucket"**

### Create these 4 buckets:

#### Bucket 1: `documents`
- **Name**: `documents`
- **Public**: ✅ Yes
- **File size limit**: 50MB
- **Allowed MIME types**: 
  - `application/pdf`
  - `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
  - `application/vnd.ms-excel`
  - `text/csv`
  - `application/msword`
  - `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
  - `image/png`
  - `image/jpeg`
  - `image/gif`

#### Bucket 2: `company-docs`
- **Name**: `company-docs`
- **Public**: ❌ No (Private)
- **File size limit**: 100MB
- **Same MIME types as above**

#### Bucket 3: `financial-reports`
- **Name**: `financial-reports`
- **Public**: ❌ No (Private)
- **File size limit**: 100MB
- **Same MIME types as above**

#### Bucket 4: `legal-documents`
- **Name**: `legal-documents`
- **Public**: ❌ No (Private)
- **File size limit**: 100MB
- **Same MIME types as above**

## 🧪 Step 3: Test Your Setup

After setting up the database and storage, run:

```bash
node scripts/test-connection.js
```

You should see:
- ✅ Database connection successful
- ✅ Storage connection successful
- ✅ All required buckets found

## 🚀 Step 4: Start Your App

```bash
npm run dev
```

Visit `http://localhost:3000` and test the portfolio company onboarding!

## 📋 What You'll Be Able to Do

Once set up, you can:
1. **Onboard new portfolio companies** with comprehensive forms
2. **Upload and tag documents** with metadata
3. **Search and filter** documents by type, quarter, tags
4. **Track performance metrics** and financial data
5. **Manage key contacts** for each company

## 🔧 Troubleshooting

### If database setup fails:
- Check the SQL executed without errors
- Verify all tables were created in the Table Editor
- Make sure you have the correct permissions

### If storage setup fails:
- Check bucket names match exactly
- Verify bucket permissions are set correctly
- Make sure you have storage access enabled

### If the app doesn't work:
- Check your `.env` file has the correct Supabase credentials
- Verify your Supabase project is active (not paused)
- Make sure all tables and buckets were created successfully

## 🎉 You're Almost Ready!

Once you complete these steps, your PortScope Dev application will be fully functional with:
- ✅ Portfolio company onboarding
- ✅ Document management with tagging
- ✅ Search and filtering capabilities
- ✅ Performance tracking
- ✅ Secure file storage
