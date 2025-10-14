# ✅ Vercel Deployment Checklist for PortScope Dev

## Pre-Deployment Checklist

### 1. ✅ Code Quality
- [x] **Build passes locally**: `npm run build` ✅
- [x] **No TypeScript errors**: All components compile ✅
- [x] **Dependencies are up to date**: All packages installed ✅
- [x] **Git repository is clean**: All changes committed ✅

### 2. ✅ Repository Status
- [x] **GitHub repository**: `https://github.com/kjyyyy/portscope-dev` ✅
- [x] **All files committed**: Latest changes pushed ✅
- [x] **No sensitive data**: No API keys in code ✅

### 3. ✅ Vercel Configuration
- [x] **vercel.json exists**: Framework configuration ✅
- [x] **package.json scripts**: Build commands defined ✅
- [x] **Next.js 15**: Latest version configured ✅

## Required Environment Variables

### 🔑 **Critical Variables (Must be set in Vercel)**

```bash
# Supabase Configuration (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Application Configuration
NEXT_PUBLIC_APP_NAME=PortScope Dev
NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app

# Authentication
APP_PASSWORD=portscope2024
```

### 📋 **How to Set Environment Variables in Vercel**

1. **Go to your Vercel dashboard**
2. **Select your project**
3. **Go to Settings → Environment Variables**
4. **Add each variable** with the correct values
5. **Make sure to set for Production, Preview, and Development**

## Supabase Setup (Required Before Deployment)

### 1. Database Schema
- [ ] **Run SQL schema**: Copy `supabase/schema.sql` to Supabase SQL Editor
- [ ] **Verify tables created**: Check `portfolio_companies`, `documents`, etc.
- [ ] **RLS policies active**: Row Level Security enabled

### 2. Storage Buckets
- [ ] **Create `documents` bucket**: Public, 50MB limit
- [ ] **Create `company-docs` bucket**: Private, 100MB limit
- [ ] **Create `financial-reports` bucket**: Private, 100MB limit
- [ ] **Create `legal-documents` bucket**: Private, 100MB limit

### 3. API Credentials
- [ ] **Get Project URL**: From Supabase Settings → API
- [ ] **Get anon key**: From Supabase Settings → API
- [ ] **Test connection**: Use the test script

## Vercel Deployment Steps

### Step 1: Import Project
1. **Go to [vercel.com](https://vercel.com)**
2. **Click "New Project"**
3. **Import from GitHub**: `kjyyyy/portscope-dev`
4. **Framework**: Next.js (auto-detected)
5. **Root Directory**: `./` (default)

### Step 2: Configure Environment Variables
1. **Go to Settings → Environment Variables**
2. **Add all required variables** (see above)
3. **Set for all environments**: Production, Preview, Development

### Step 3: Deploy
1. **Click "Deploy"**
2. **Wait for build to complete**
3. **Check build logs** for any errors

## Post-Deployment Testing

### 1. Basic Functionality
- [ ] **App loads**: Visit your Vercel URL
- [ ] **Authentication works**: Try password `portscope2024`
- [ ] **Demo mode works**: Click "Launch Demo Mode"
- [ ] **Navigation works**: All menu items functional

### 2. Portfolio Features
- [ ] **Portfolio page loads**: `/dashboard/portfolio`
- [ ] **Add company form**: `/dashboard/portfolio/new`
- [ ] **Form submission**: Test company creation
- [ ] **Document upload**: Test file upload functionality

### 3. Database Integration
- [ ] **Supabase connection**: Check browser console for errors
- [ ] **Data persistence**: Create a company and verify it's saved
- [ ] **File upload**: Upload a document and verify it's stored

## Troubleshooting Common Issues

### Build Failures
- **Check build logs** in Vercel dashboard
- **Verify all dependencies** are in package.json
- **Check for TypeScript errors** locally first

### Runtime Errors
- **Check environment variables** are set correctly
- **Verify Supabase credentials** are valid
- **Check browser console** for client-side errors

### Database Issues
- **Verify SQL schema** was run in Supabase
- **Check RLS policies** are not blocking access
- **Test Supabase connection** with the test script

## Performance Optimization

### Vercel Settings
- **Enable Vercel Analytics** (optional)
- **Set up Speed Insights** (optional)
- **Configure CDN** for static assets

### Security
- **Change default password** in production
- **Set up proper CORS** policies
- **Enable HTTPS** (automatic with Vercel)

## Monitoring

### Health Checks
- **App availability**: Regular uptime checks
- **Database connectivity**: Monitor Supabase connection
- **File upload functionality**: Test document uploads

### Logs
- **Vercel function logs**: Check for server errors
- **Browser console**: Monitor client-side errors
- **Supabase logs**: Check database operations

## Rollback Plan

### If Deployment Fails
1. **Check build logs** for specific errors
2. **Verify environment variables** are correct
3. **Test locally** with `npm run dev`
4. **Fix issues** and redeploy

### If App Doesn't Work
1. **Check Supabase setup** is complete
2. **Verify all environment variables** are set
3. **Test with demo mode** first
4. **Check browser console** for errors

## Success Criteria

### ✅ Deployment is successful when:
- [ ] **App loads** at Vercel URL without errors
- [ ] **Authentication** works with password
- [ ] **Demo mode** functions properly
- [ ] **Portfolio onboarding** creates companies
- [ ] **Document upload** stores files in Supabase
- [ ] **All navigation** works correctly
- [ ] **No console errors** in browser

---

## 🚀 Ready to Deploy!

Your PortScope Dev application is ready for Vercel deployment. Follow the checklist above to ensure a successful deployment.

**GitHub Repository**: `https://github.com/kjyyyy/portscope-dev`
**Vercel Dashboard**: `https://vercel.com/dashboard`
