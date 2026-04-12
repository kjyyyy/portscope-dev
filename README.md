# Portscope

**The family office autopilot.** Not software — outcomes.

Portscope replaces the fund administrator for small family offices. Documents arrive, an LLM extracts structured data, Temporal orchestrates the pipeline, and reconciled quarterly reports are delivered automatically.

## Architecture

```
apps/
  api/          → NestJS 10 API (Docker → cloud)
  web/          → Next.js 15 (Vercel)
  extractor/    → Python FastAPI document extraction (Docker → cloud)
  worker/       → Temporal workflow workers (Docker → cloud)

packages/
  db/           → Prisma schema + client
  shared/       → Shared TypeScript types
  extractor-client/ → TS HTTP client for the extractor
```

## Quick Start

### Prerequisites

- Node.js 20+, pnpm 9+
- Docker & Docker Compose
- Python 3.11+ (for extractor, or run via Docker)
- **One of**: Ollama (local), or API key for OpenRouter / Anthropic / HuggingFace / OpenAI

### 1. Environment Setup

```bash
cp env.example .env
# Edit .env — choose your LLM_PROVIDER and set keys
```

### 2. Start Infrastructure

```bash
docker compose up -d
# Starts: PostgreSQL, Temporal, Redis, MinIO
```

### 3. Install Dependencies & Generate DB Client

```bash
pnpm install
cd packages/db && npx prisma generate && npx prisma db push && cd ../..
```

### 4. Start the API + Web and Seed Data

```bash
# In a new terminal:
pnpm dev
# Wait for the API to start on port 3001, then seed:
curl -X POST http://localhost:3001/api/seed
```

### 5. Start the Extractor (Python)

```bash
cd apps/extractor
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn src.api.main:app --port 8001 --reload
```

### 6. Open in Browser

- **Staff Review UI**: http://localhost:3000/queue
- **Client Portal**: http://localhost:3000/portal?token=demo
- **Extractor Health**: http://localhost:8001/health
- **Temporal UI**: http://localhost:8080

## AI Provider Configuration

The extractor supports **multiple LLM providers** via the `LLM_PROVIDER` env var:

| Provider | `LLM_PROVIDER` | Required Env Vars | Notes |
|----------|----------------|-------------------|-------|
| **Ollama** (default) | `ollama` | `LLM_MODEL` | Free, local. `ollama pull llama3.1:8b` first |
| **Anthropic** | `anthropic` | `ANTHROPIC_API_KEY` | Best accuracy, paid |
| **OpenRouter** | `openrouter` | `LLM_API_KEY`, `LLM_MODEL` | Access to 100+ models |
| **HuggingFace** | `huggingface` | `LLM_API_KEY`, `LLM_MODEL` | Free tier available |
| **OpenAI** | `openai` | `LLM_API_KEY`, `LLM_MODEL` | GPT-4o, etc |
| **vLLM** | `vllm` | `LLM_BASE_URL`, `LLM_MODEL` | Self-hosted GPU |
| **Any OpenAI-compatible** | `custom` | `LLM_BASE_URL`, `LLM_API_KEY`, `LLM_MODEL` | LM Studio, Together, Groq, etc. |

### Ollama Quick Setup (Free, Local)

```bash
# Install Ollama: https://ollama.com
ollama pull llama3.1:8b
# .env already defaults to Ollama — just start the app
```

### OpenRouter Setup (100+ models, pay-per-use)

```bash
# In .env:
LLM_PROVIDER="openrouter"
LLM_API_KEY="sk-or-v1-your-key"
LLM_MODEL="anthropic/claude-3.5-sonnet"   # or any model on openrouter.ai
```

## Services

| Service | Port | Description |
|---------|------|-------------|
| Web (Next.js) | 3000 | Staff review UI + Client portal |
| API (NestJS) | 3001 | Core REST API |
| Extractor (FastAPI) | 8001 | Document classification + extraction |
| PostgreSQL | 5432 | Primary database |
| Temporal | 7233 | Workflow orchestration |
| Temporal UI | 8080 | Workflow dashboard |
| MinIO | 9000/9001 | S3-compatible object storage |
| Redis | 6379 | Cache + sessions |

## Key Screens

- `/queue` — Staff review queue (inbox-style, pending documents)
- `/documents/[id]` — PDF + extracted fields side-by-side review
- `/portal` — James's client portal (net worth, report download)

## Tech Stack

- **TypeScript**: NestJS 10, Next.js 15, Prisma 6, Temporal, Zod
- **Python**: FastAPI, Pydantic v2, multi-provider LLM abstraction
- **Infrastructure**: Docker Compose, PostgreSQL 16 + pgvector, Redis, MinIO
- **UI**: Tailwind CSS v4, shadcn/ui design system
- **LLM**: Provider-agnostic (Ollama, Anthropic, OpenRouter, HuggingFace, OpenAI, vLLM)
