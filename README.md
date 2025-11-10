# PortScope Dev

A professional portfolio management platform built with Next.js 15, TypeScript, Supabase, and Tailwind CSS.

## Features

- **Supabase Authentication**: Secure email/password authentication with email confirmation
- **B2B Partner Onboarding**: Company creation and linking during signup
- **Portfolio Dashboard**: Overview of all companies, signoff processes, and latest activities
- **Company Detail View**: 4-quadrant view with business details, financials, commentary, and investment thesis
- **Monthly Performance Tracking**: Track performance metrics across companies
- **Modern UI**: Built with Radix UI, Shadcn UI, and Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Vercel account (for deployment)

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables template
cp env.example .env.local

# Edit .env.local with your Supabase credentials
```

### Environment Variables

Create a `.env.local` file with the following:

```bash
# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Optional: Supabase Service Role Key (for server-side operations)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Application Configuration
NEXT_PUBLIC_APP_NAME=PortScope Dev
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Database Setup

1. **Create Supabase Project**: Go to [supabase.com/dashboard](https://supabase.com/dashboard) and create a new project

2. **Run Schema**: Execute the SQL schema from `supabase/schema.sql` in your Supabase SQL Editor

3. **Configure Authentication URLs**:
   - Go to **Authentication** → **URL Configuration**
   - Set **Site URL** to your production domain (e.g., `https://your-app.vercel.app`)
   - Add **Redirect URLs**:
     - `http://localhost:3000/auth/callback` (for local development)
     - `https://your-app.vercel.app/auth/callback` (for production)

### Development

```bash
# Run development server
npm run dev

# Run without Turbopack (if you encounter issues)
npm run dev:stable

# Clean build cache
npm run clean

# Build for production
npm run build
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── auth/              # Auth callback handler
│   ├── dashboard/         # Dashboard pages
│   │   ├── companies/    # Company detail pages
│   │   └── page.tsx      # Dashboard overview
│   ├── login/            # Login page
│   ├── signup/           # Signup page
│   └── api/              # API routes
├── auth/                  # Authentication context
│   └── AuthProvider.tsx  # Auth state management
├── components/            # React components
│   └── ui/              # Shadcn UI components
├── hooks/                 # Custom React hooks
│   └── features/        # Feature-specific hooks
├── lib/                   # Utilities
│   └── supabase.ts      # Supabase client
└── types/                 # TypeScript types
```

## Technologies

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Supabase** - Authentication and database
- **Tailwind CSS** - Styling
- **Shadcn UI** - UI component library
- **Radix UI** - Accessible primitives
- **TanStack Query** - Data fetching and caching
- **Recharts** - Data visualization
- **Lucide React** - Icons

## Authentication Flow

1. **Sign Up**: User creates account with email/password
2. **Email Confirmation**: Supabase sends confirmation email
3. **Email Verification**: User clicks link, redirects to `/auth/callback`
4. **Session Creation**: Callback page creates session and redirects to dashboard
5. **Protected Routes**: Middleware protects dashboard routes

## B2B Partner Onboarding

During signup, users can optionally:
- Provide company name and unique link
- Link to existing company or create new one
- Automatically associate user profile with company

## Deployment

### Deploy to Vercel

1. **Push to GitHub**: Your code should be in a GitHub repository

2. **Import to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Import your repository

3. **Add Environment Variables** in Vercel:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

4. **Update Supabase Redirect URLs**:
   - Add your Vercel domain to Supabase redirect URLs
   - Update Site URL to your Vercel domain

5. **Deploy!** Vercel will automatically build and deploy

### Manual Deployment

```bash
npm run build
npm start
```

## Development Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run dev:stable` - Start development server without Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run clean` - Clean build cache
- `npm run clean:build` - Clean and rebuild

## Troubleshooting

### Build Cache Issues

If you encounter build errors, try:
```bash
npm run clean
npm run build
```

### Email Confirmation Not Working

1. Check Supabase Dashboard → Authentication → URL Configuration
2. Ensure redirect URLs include `/auth/callback` path
3. Verify Site URL is set to production domain (not localhost)
4. Check browser console for errors

### Supabase Connection Issues

1. Verify environment variables are set correctly
2. Check Supabase project is active
3. Ensure RLS policies are configured (if needed)

## License

MIT License - see LICENSE file for details.
