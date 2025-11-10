# 📦 Supabase Storage Bucket Setup Guide

## ⚠️ Important Note

You **cannot** create storage buckets directly via SQL in Supabase. The `storage.buckets` and `storage.objects` tables are managed by Supabase and require special permissions.

## ✅ Correct Setup Method

### Step 1: Create the Bucket via Dashboard

1. **Go to your Supabase Dashboard**
2. **Navigate to Storage** (left sidebar)
3. **Click "New bucket"** button
4. **Configure the bucket:**
   - **Name:** `documents`
   - **Public:** ❌ **No** (uncheck this - documents should be private)
   - **File size limit:** `100` MB (or leave default)
5. **Click "Create bucket"**

### Step 2: Set Up RLS Policies

After creating the bucket, run the RLS policies:

1. **Go to Supabase Dashboard → SQL Editor**
2. **Copy and paste the contents of `scripts/create-storage-bucket.sql`**
   - This file now contains **only the policies** (bucket creation removed)
3. **Click "Run"**

The policies will:
- ✅ Allow authenticated users to upload to their company folders
- ✅ Allow users to read documents from their companies
- ✅ Allow users to update/delete their company documents
- ✅ Restrict access based on `portfolio_companies.created_by = auth.uid()`

## 🔍 Verify Setup

After setup, verify:

1. **Bucket exists:**
   - Go to Storage → You should see `documents` bucket
   - It should be marked as "Private"

2. **Policies are active:**
   - Go to Storage → `documents` bucket → Policies tab
   - You should see 4 policies:
     - Users can upload documents to their companies
     - Users can read documents from their companies
     - Users can update documents from their companies
     - Users can delete documents from their companies

3. **Test upload:**
   - Try creating a company with file uploads
   - Files should upload to `documents/{company_id}/{filename}`
   - Only the company creator should be able to access the files

## 🛠️ Alternative: Programmatic Setup

If you prefer to set up via code, you can use the Node.js script:

```bash
node scripts/setup-storage.js
```

**Note:** This script uses the Storage API, which may have limitations. If it fails, use the Dashboard method above.

## 📁 File Path Structure

Files will be stored as:
```
documents/
  └── {portfolio_company_id}/
      ├── 1234567890-abc123.xlsx
      ├── 1234567891-def456.pdf
      └── ...
```

The RLS policies check that:
- The folder name (first part of path) matches a `portfolio_company_id`
- The company's `created_by` matches the authenticated user's ID

## 🔒 Security Notes

- **Private bucket:** Documents are not publicly accessible
- **RLS policies:** Users can only access their own company documents
- **Authentication required:** All operations require a valid session
- **Path-based access:** Access is controlled by the folder structure

## ❌ Common Errors

### "must be owner of table objects"
- **Cause:** Trying to modify `storage.objects` table directly
- **Solution:** Use the Dashboard to create the bucket, then run only the policies SQL

### "Bucket not found"
- **Cause:** Bucket hasn't been created yet
- **Solution:** Create the bucket via Dashboard first (Step 1)

### "Permission denied"
- **Cause:** RLS policies not set up correctly
- **Solution:** Verify policies are created and check that `portfolio_companies` table exists

## 📝 Summary

1. ✅ Create bucket via **Dashboard** (not SQL)
2. ✅ Run **policies SQL** from `scripts/create-storage-bucket.sql`
3. ✅ Verify bucket and policies are active
4. ✅ Test file upload functionality

