FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9.0.6 --activate

# ---- builder stage ----
FROM base AS builder
WORKDIR /app

# Copy workspace manifests first for better layer caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/v4/package.json ./apps/v4/
COPY packages/shadcn/package.json ./packages/shadcn/

RUN pnpm install --frozen-lockfile

# Copy the rest of the source
COPY . .

# Build shadcn CLI package, then the Next.js app
RUN pnpm --filter=shadcn build
RUN pnpm --filter=v4 build

# ---- runner stage ----
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy everything needed to run (deps + built output)
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder /app/apps/v4/.next ./apps/v4/.next
COPY --from=builder /app/apps/v4/public ./apps/v4/public
COPY --from=builder /app/apps/v4/package.json ./apps/v4/package.json
COPY --from=builder /app/apps/v4/node_modules ./apps/v4/node_modules

EXPOSE 4000

WORKDIR /app/apps/v4
CMD ["node_modules/.bin/next", "start", "--port", "4000"]
