# 🚀 Supabase Setup Guide for PortScope Dev

## Step 1: Create Supabase Project

1. **Go to [supabase.com](https://supabase.com/dashboard)**
2. **Click "New Project"**
3. **Choose your organization**
4. **Enter project details:**
   - Name: `portscope-dev` (or any name you prefer)
   - Database Password: Choose a strong password
   - Region: Choose closest to your location
5. **Click "Create new project"**
6. **Wait for the project to be ready** (usually 1-2 minutes)

## Step 2: Get Your Credentials

1. **In your Supabase dashboard, go to Settings → API**
2. **Copy these values:**
   - **Project URL** (looks like: `https://abcdefghijklmnop.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

## Step 3: Update Environment Variables

Edit your `.env.local` file and replace the placeholder values:

```bash
# Replace these with your actual values from Step 2:
NEXT_PUBLIC_SUPABASE_URL=https://your-actual-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key_here

# Keep these as they are:
NEXT_PUBLIC_APP_NAME=PortScope Dev
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 4: Configure Authentication URLs

1. **In your Supabase dashboard, go to Authentication → URL Configuration**
2. **Set Site URL** to your production domain (e.g., `https://your-app.vercel.app`)
   - For local development, you can keep `http://localhost:3000` temporarily
3. **Add Redirect URLs**:
   - `http://localhost:3000/auth/callback` (for local development)
   - `https://your-app.vercel.app/auth/callback` (for production)
4. **Click "Save changes"**

## Step 5: Set Up Database Schema

1. **In your Supabase dashboard, go to SQL Editor**
2. **Copy the entire contents of `supabase/schema.sql`**
3. **Paste it into the SQL Editor**
4. **Click "Run" to execute the schema**

## Step 6: Set Up File Storage

1. **In your Supabase dashboard, go to Storage**
2. **Click "Create a new bucket"**
3. **Create these buckets:**

### Bucket 1: `documents`
- **Name:** `documents`
- **Public:** ✅ Yes
- **File size limit:** 50MB
- **Allowed MIME types:** 
  - `application/pdf`
  - `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
  - `application/vnd.ms-excel`
  - `text/csv`
  - `application/msword`
  - `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
  - `image/png`
  - `image/jpeg`
  - `image/gif`

### Bucket 2: `company-docs`
- **Name:** `company-docs`
- **Public:** ❌ No (Private)
- **File size limit:** 100MB
- **Same MIME types as above**

### Bucket 3: `financial-reports`
- **Name:** `financial-reports`
- **Public:** ❌ No (Private)
- **File size limit:** 100MB
- **Same MIME types as above**

### Bucket 4: `legal-documents`
- **Name:** `legal-documents`
- **Public:** ❌ No (Private)
- **File size limit:** 100MB
- **Same MIME types as above**

## Step 7: Test the Connection

Run this command to test your setup:

```bash
node scripts/test-connection.js
```

You should see:
- ✅ Environment variables found
- ✅ Database connection successful
- ✅ Storage connection successful
- ✅ All required buckets created

## Step 8: Start Your App

```bash
npm run dev
```

Visit `http://localhost:3000` and test the portfolio company onboarding!

## 🔧 Troubleshooting

### If connection fails:
1. **Check your `.env.local` file** has the correct Supabase URL and key
2. **Make sure your Supabase project is active** (not paused)
3. **Verify the URL format** should be `https://your-project-id.supabase.co`
4. **Check the API key** should start with `eyJ`

### If storage fails:
1. **Make sure you created the storage buckets** in Step 5
2. **Check bucket permissions** are set correctly
3. **Verify bucket names** match exactly: `documents`, `company-docs`, etc.

### If database fails:
1. **Make sure you ran the SQL schema** from `supabase/schema.sql`
2. **Check the SQL executed without errors**
3. **Verify all tables were created** in the Table Editor

## 📞 Need Help?

If you run into issues:
1. **Check the Supabase dashboard** for any error messages
2. **Verify your project is not paused** (check the project status)
3. **Make sure you have the correct permissions** on your Supabase project
