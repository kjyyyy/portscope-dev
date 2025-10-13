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

## Deployment

### Deploy to Vercel

1. **Connect to Vercel**:
   ```bash
   npx vercel
   ```

2. **Environment Variables** (optional):
   - `NEXT_PUBLIC_APP_NAME`: Your app name
   - `NEXT_PUBLIC_APP_URL`: Your production URL

3. **Deploy**:
   ```bash
   npm run build
   ```

### Manual Deployment

```bash
# Build the application
npm run build

# Start production server
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
