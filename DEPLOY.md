# Portscope Cloud Deployment Guide

Deploy all backend services to the cloud so you only run the Next.js frontend locally.

## Architecture

```
Your Machine (WSL2)              Cloud (Free Tiers)
┌──────────────────┐            ┌──────────────────────────────────┐
│ Next.js :3000     │───────────▶│ NestJS API     (Railway)         │
│ (pnpm dev)        │            │ Python Extract (Railway)         │
└──────────────────┘            │ PostgreSQL     (Neon)            │
                                 │ S3 Storage     (Cloudflare R2)   │
                                 │ LLM            (OpenRouter)      │
                                 └──────────────────────────────────┘
```

## Step 1: Database — Neon (free, 2 min)

1. Go to [neon.tech](https://neon.tech) and sign up
2. Create a new project called `portscope`
3. Copy the connection string from the dashboard
4. It looks like: `postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/portscope?sslmode=require`

**Push the schema:**
```bash
cd packages/db
DATABASE_URL="YOUR_NEON_URL" npx prisma db push
```

## Step 2: Object Storage — Cloudflare R2 (free, 3 min)

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com)
2. Sign up (no payment needed for free tier: 10GB storage, 10M requests/month)
3. Navigate to **R2 Object Storage** → **Create bucket** → Name: `portscope-documents`
4. Go to **R2** → **Manage R2 API Tokens** → **Create API token**
   - Permissions: **Object Read & Write**
   - Specify bucket: `portscope-documents`
5. Copy the **Access Key ID**, **Secret Access Key**, and **Account ID**

Your S3 settings:
```
S3_ENDPOINT=https://<ACCOUNT_ID>.r2.cloudflarestorage.com
S3_ACCESS_KEY=<ACCESS_KEY_ID>
S3_SECRET_KEY=<SECRET_ACCESS_KEY>
S3_BUCKET=portscope-documents
S3_REGION=auto
```

## Step 3: Deploy Backend — Railway (free $5/month credit)

### Install Railway CLI
```bash
npm install -g @railway/cli
railway login
```

### Create project
```bash
cd /home/kevin_admin/projects/portscope-dev
railway init    # Creates a new Railway project
```

### Deploy NestJS API
```bash
railway service create portscope-api
railway link    # Select portscope-api

# Set environment variables
railway variables set \
  DATABASE_URL="YOUR_NEON_URL" \
  S3_BUCKET="portscope-documents" \
  S3_ENDPOINT="https://ACCOUNT_ID.r2.cloudflarestorage.com" \
  S3_REGION="auto" \
  S3_ACCESS_KEY="YOUR_R2_KEY" \
  S3_SECRET_KEY="YOUR_R2_SECRET" \
  EXTRACTOR_URL="http://portscope-extractor.railway.internal:8001" \
  LLM_PROVIDER="openrouter" \
  LLM_API_KEY="YOUR_OPENROUTER_KEY" \
  LLM_MODEL="google/gemini-2.5-flash" \
  NODE_ENV="development" \
  AUTH_SECRET="$(openssl rand -hex 32)" \
  CORS_ORIGIN="http://localhost:3000" \
  PORT="3001" \
  RAILWAY_DOCKERFILE_PATH="apps/api/Dockerfile"

railway up
```

### Deploy Python Extractor
```bash
railway service create portscope-extractor
railway link    # Select portscope-extractor

railway variables set \
  LLM_PROVIDER="openrouter" \
  LLM_BASE_URL="https://openrouter.ai/api/v1" \
  LLM_API_KEY="YOUR_OPENROUTER_KEY" \
  LLM_MODEL="google/gemini-2.5-flash" \
  S3_BUCKET="portscope-documents" \
  S3_ENDPOINT="https://ACCOUNT_ID.r2.cloudflarestorage.com" \
  S3_REGION="auto" \
  S3_ACCESS_KEY="YOUR_R2_KEY" \
  S3_SECRET_KEY="YOUR_R2_SECRET" \
  PORT="8001" \
  RAILWAY_DOCKERFILE_PATH="apps/extractor/Dockerfile"

railway up
```

### Get your API URL
```bash
railway domain    # Generates a public URL like: portscope-api-production.up.railway.app
```

### Seed the database (one-time)
```bash
curl -X POST https://YOUR_RAILWAY_API_URL/api/seed
```

## Step 4: Run Frontend Locally

Update your local `.env`:
```bash
# In portscope-dev/.env, change:
NEXT_PUBLIC_API_URL="https://portscope-api-production.up.railway.app"
```

Start the frontend:
```bash
pnpm --filter @portscope/web dev
# Open http://localhost:3000
```

## Step 5 (Optional): Deploy Frontend to Vercel

If you want the frontend online too:

1. Push your repo to GitHub
2. Go to [vercel.com](https://vercel.com) → Import project
3. Set **Root Directory** to `apps/web`
4. Add environment variable:
   - `NEXT_PUBLIC_API_URL` = `https://portscope-api-production.up.railway.app`
5. Deploy

Then update Railway API's `CORS_ORIGIN` to include your Vercel URL:
```bash
railway variables set CORS_ORIGIN="http://localhost:3000,https://your-app.vercel.app"
```

## Quick Reference

| Service | Provider | Dashboard | Free Tier |
|---------|----------|-----------|-----------|
| Database | Neon | [console.neon.tech](https://console.neon.tech) | 0.5 GB, 100 hours/month |
| Storage | Cloudflare R2 | [dash.cloudflare.com](https://dash.cloudflare.com) | 10 GB, 10M requests/month |
| API + Extractor | Railway | [railway.app](https://railway.app) | $5 free credit/month |
| Frontend | Vercel | [vercel.com](https://vercel.com) | Free for hobby |
| LLM | OpenRouter | [openrouter.ai](https://openrouter.ai) | Pay-per-use |

## Estimated Monthly Cost

| Component | Cost |
|-----------|------|
| Neon (Postgres) | $0 (free tier) |
| Cloudflare R2 | $0 (free tier) |
| Railway (2 services) | $0–5 (free credit) |
| Vercel (optional) | $0 (hobby) |
| OpenRouter (LLM) | ~$0.01–0.10 per document |
| **Total** | **$0–5/month** |

## Troubleshooting

**API returns 401?**
→ Make sure `NODE_ENV=development` is set on Railway so the `dev-token` bypass works.

**CORS errors?**
→ Update `CORS_ORIGIN` on Railway to include your frontend URL.

**Extractor can't reach S3?**
→ Check the `S3_ENDPOINT` format: `https://ACCOUNT_ID.r2.cloudflarestorage.com` (no trailing slash).

**Frontend shows "Loading..." forever?**
→ Check `NEXT_PUBLIC_API_URL` points to the Railway API URL (with `https://`).

**Database push fails?**
→ Make sure your Neon connection string ends with `?sslmode=require`.
