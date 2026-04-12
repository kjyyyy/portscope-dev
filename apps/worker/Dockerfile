FROM node:22-slim AS base
RUN corepack enable && corepack prepare pnpm@10.15.1 --activate
WORKDIR /app

FROM base AS deps
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json .npmrc ./
COPY apps/worker/package.json apps/worker/package.json
COPY packages/db/package.json packages/db/package.json
COPY packages/shared/package.json packages/shared/package.json
COPY packages/extractor-client/package.json packages/extractor-client/package.json
RUN pnpm install --frozen-lockfile

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/worker/node_modules ./apps/worker/node_modules
COPY --from=deps /app/packages ./packages
COPY apps/worker ./apps/worker
COPY packages ./packages
COPY tsconfig.base.json ./
RUN cd packages/db && npx prisma generate
RUN cd apps/worker && npx tsc

FROM node:22-slim AS runner
WORKDIR /app
COPY --from=build /app/apps/worker/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages/db/prisma ./prisma

ENV NODE_ENV=production
CMD ["node", "dist/main.js"]
