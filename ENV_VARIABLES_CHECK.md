# Environment Variables Check

## ✅ Required Environment Variables

Based on the codebase analysis, here are the **correct** environment variable names:

### **Client-Side (NEXT_PUBLIC_ prefix required for Next.js)**

1. **`NEXT_PUBLIC_SUPABASE_URL`** ✅
   - Used in: `src/lib/supabase.ts`, `src/middleware.ts`, `src/hooks/features/useSignUp.ts`
   - **Required**: Yes
   - **Example**: `https://your-project.supabase.co`

2. **`NEXT_PUBLIC_SUPABASE_ANON_KEY`** ✅
   - Used in: `src/lib/supabase.ts`, `src/middleware.ts`, `src/hooks/features/useSignUp.ts`
   - **Required**: Yes
   - **Example**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### **Server-Side (API Routes - no NEXT_PUBLIC_ prefix)**

3. **`SUPABASE_SERVICE_ROLE_KEY`** ✅
   - Used in: `api/lib/supabase.ts`
   - **Required**: Optional (for admin operations)
   - **Note**: This is a secret key - never expose to client
   - **Example**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### **Fallback Support**

The API routes also support these fallback names (for compatibility):
- `SUPABASE_URL` (fallback for `NEXT_PUBLIC_SUPABASE_URL`)
- `SUPABASE_ANON_KEY` (fallback for `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

## ❌ Incorrect Variable Names (DO NOT USE)

- ❌ `VITE_SUPABASE_URL` - This is for Vite, not Next.js
- ❌ `SUPABASE_URL` (client-side) - Missing `NEXT_PUBLIC_` prefix
- ❌ `SUPABASE_ANON_KEY` (client-side) - Missing `NEXT_PUBLIC_` prefix

## 📋 Your .env File Should Contain:

```bash
# Supabase Configuration (Client-Side - Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Supabase Service Role Key (Server-Side - Optional, for admin operations)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

## 🔍 How to Verify

1. **Check your `.env` file**:
   ```bash
   cat .env | grep SUPABASE
   ```

2. **Verify in code**:
   - Client-side code uses: `process.env.NEXT_PUBLIC_SUPABASE_URL`
   - Server-side API uses: `process.env.SUPABASE_SERVICE_ROLE_KEY`

3. **Common Issues**:
   - ❌ Missing `NEXT_PUBLIC_` prefix → Variable won't be available in browser
   - ❌ Typos in variable names → Will be `undefined`
   - ❌ Wrong file location → Should be in project root

## 🚀 For Vercel Deployment

Make sure to add these in Vercel Dashboard:
- Settings → Environment Variables
- Add both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- For production, preview, and development environments

## ✅ Quick Check Command

Run this to verify your env variables are set:
```bash
cd /home/kevin_admin/projects/portscope-dev
echo "NEXT_PUBLIC_SUPABASE_URL: ${NEXT_PUBLIC_SUPABASE_URL:0:30}..."
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY: ${NEXT_PUBLIC_SUPABASE_ANON_KEY:0:30}..."
```

