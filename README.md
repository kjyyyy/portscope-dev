# PortScope Dev

A professional portfolio management platform built with Next.js 15, TypeScript, and Tailwind CSS.

## Features

- **Simple Authentication**: Password-based access control
- **Demo Mode**: Explore the full UI without authentication
- **Portfolio Dashboard**: Overview of investments and performance
- **Analytics**: Advanced charts and performance metrics
- **Valuations**: Track and manage company valuations
- **Modern UI**: Built with Radix UI and Tailwind CSS

## Getting Started

### Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### Authentication

- **Demo Mode**: Click "Launch Demo Mode" to explore without authentication
- **Secure Access**: Use password `portscope2024` for authenticated access

## 🚀 Deployment

### Quick Deploy to Vercel

**Your code is already pushed to GitHub**: `https://github.com/kjyyyy/portscope-dev`

1. **Go to [vercel.com](https://vercel.com)**
2. **Sign in with GitHub**
3. **Import repository**: `kjyyyy/portscope-dev`
4. **Add Environment Variables**:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   NEXT_PUBLIC_APP_NAME=PortScope Dev
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   APP_PASSWORD=portscope2024
   ```
5. **Deploy!**

### Prerequisites (Required Before Deployment)

1. **Set up Supabase Database**:
   - Run the SQL schema from `supabase/schema.sql`
   - Create storage buckets: `documents`, `company-docs`, `financial-reports`, `legal-documents`

2. **Get Supabase Credentials**:
   - Go to [supabase.com/dashboard](https://supabase.com/dashboard)
   - Copy Project URL and anon key

### Detailed Deployment Guide

See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for complete instructions.

### Manual Deployment

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── dashboard/         # Dashboard pages
│   ├── api/              # API routes
│   └── page.tsx          # Home page
├── components/           # React components
│   └── ui/              # UI components
└── lib/                 # Utilities
```

## Technologies

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Radix UI** - Accessible components
- **Recharts** - Data visualization
- **Lucide React** - Icons

## Customization

### Change Password
Update the `APP_PASSWORD` constant in `src/app/page.tsx`:

```typescript
const APP_PASSWORD = 'your-new-password';
```

### Add Features
- Add new dashboard pages in `src/app/dashboard/`
- Create new components in `src/components/`
- Add API routes in `src/app/api/`

## License

MIT License - see LICENSE file for details.
