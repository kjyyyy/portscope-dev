# 🚀 Vercel Deployment Guide for PortScope Dev

## Quick Deploy to Vercel

### Option 1: Deploy from GitHub (Recommended)

1. **Go to [vercel.com](https://vercel.com)**
2. **Sign in with your GitHub account**
3. **Click "New Project"**
4. **Import your repository**: `kjyyyy/portscope-dev`
5. **Configure the project**:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next` (default)

### Option 2: Deploy with Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd /home/kevin_admin/projects/portscope-dev
vercel

# Follow the prompts:
# - Link to existing project? No
# - Project name: portscope-dev
# - Directory: ./
# - Override settings? No
```

## Environment Variables Setup

### Required Environment Variables

In your Vercel dashboard, go to **Settings → Environment Variables** and add:

```bash
# Supabase Configuration (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Application Configuration
NEXT_PUBLIC_APP_NAME=PortScope Dev
NEXT_PUBLIC_APP_URL=https://your-vercel-app.vercel.app

# Authentication
APP_PASSWORD=portscope2024
```

### How to Get Supabase Credentials

1. **Go to [supabase.com/dashboard](https://supabase.com/dashboard)**
2. **Select your project**
3. **Go to Settings → API**
4. **Copy**:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Database Setup (Required Before Deployment)

### 1. Set Up Supabase Database

1. **Go to your Supabase dashboard**
2. **Go to SQL Editor**
3. **Copy the contents of `supabase/schema.sql`**
4. **Paste and run the SQL** to create all tables

### 2. Create Storage Buckets

1. **Go to Storage in your Supabase dashboard**
2. **Create these buckets**:

#### Bucket 1: `documents`
- **Name**: `documents`
- **Public**: ✅ Yes
- **File size limit**: 50MB

#### Bucket 2: `company-docs`
- **Name**: `company-docs`
- **Public**: ❌ No (Private)
- **File size limit**: 100MB

#### Bucket 3: `financial-reports`
- **Name**: `financial-reports`
- **Public**: ❌ No (Private)
- **File size limit**: 100MB

#### Bucket 4: `legal-documents`
- **Name**: `legal-documents`
- **Public**: ❌ No (Private)
- **File size limit**: 100MB

## Deployment Steps

### Step 1: Prepare Supabase
- ✅ Set up database schema
- ✅ Create storage buckets
- ✅ Get API credentials

### Step 2: Deploy to Vercel
- ✅ Connect GitHub repository
- ✅ Add environment variables
- ✅ Deploy

### Step 3: Test Deployment
- ✅ Visit your Vercel URL
- ✅ Test authentication (password: `portscope2024`)
- ✅ Test demo mode
- ✅ Test portfolio company onboarding
- ✅ Test document upload

## Post-Deployment Checklist

- [ ] **Database schema** is set up in Supabase
- [ ] **Storage buckets** are created
- [ ] **Environment variables** are configured in Vercel
- [ ] **App is accessible** at your Vercel URL
- [ ] **Authentication** works (password: `portscope2024`)
- [ ] **Demo mode** works
- [ ] **Portfolio onboarding** works
- [ ] **Document upload** works

## Troubleshooting

### If deployment fails:
1. **Check environment variables** are set correctly
2. **Verify Supabase credentials** are valid
3. **Check build logs** in Vercel dashboard
4. **Ensure database schema** is set up

### If app doesn't work after deployment:
1. **Verify Supabase connection** is working
2. **Check storage buckets** exist
3. **Test with demo mode** first
4. **Check browser console** for errors

### If database operations fail:
1. **Run the SQL schema** in Supabase
2. **Check RLS policies** are set up
3. **Verify API keys** have correct permissions

## Custom Domain (Optional)

1. **Go to Vercel dashboard**
2. **Go to Settings → Domains**
3. **Add your custom domain**
4. **Update `NEXT_PUBLIC_APP_URL`** in environment variables

## Performance Optimization

- **Enable Vercel Analytics** (optional)
- **Set up Vercel Speed Insights** (optional)
- **Configure CDN** for file uploads
- **Set up monitoring** for production

## Security Considerations

- **Change the default password** in production
- **Set up proper RLS policies** in Supabase
- **Use environment variables** for all secrets
- **Enable HTTPS** (automatic with Vercel)
- **Set up proper CORS** policies

## Support

If you encounter issues:
1. **Check the build logs** in Vercel
2. **Verify Supabase setup** is complete
3. **Test locally** first with `npm run dev`
4. **Check the documentation** in the repository

---

**Your app will be available at**: `https://your-app-name.vercel.app`

**GitHub Repository**: `https://github.com/kjyyyy/portscope-dev`
