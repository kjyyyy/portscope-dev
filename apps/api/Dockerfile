FROM node:22-slim
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@10.15.1 --activate
WORKDIR /app

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json .npmrc ./
COPY apps/api/package.json apps/api/package.json
COPY packages/db/package.json packages/db/package.json
COPY packages/shared/package.json packages/shared/package.json
COPY packages/extractor-client/package.json packages/extractor-client/package.json
RUN pnpm install --frozen-lockfile

COPY packages ./packages
COPY apps/api ./apps/api
COPY tsconfig.base.json ./
RUN pnpm --filter @portscope/db exec prisma generate
RUN pnpm --filter @portscope/api exec nest build

ENV NODE_ENV=production
WORKDIR /app/apps/api
EXPOSE 3001
CMD ["node", "dist/apps/api/src/main.js"]
