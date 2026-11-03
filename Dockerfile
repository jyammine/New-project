# Production image for the Little Nest shop (Next.js standalone output + Payload CMS).

FROM node:22.23.4-alpine AS base
RUN apk add --no-cache libc6-compat
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm install -g pnpm@10.28.0
WORKDIR /app

# ── Dependencies ────────────────────────────────────────────────────────────
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# ── Build ───────────────────────────────────────────────────────────────────
# The build does not need a database or secrets.
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# ── Tools ───────────────────────────────────────────────────────────────────
# Full source + dependencies for one-off tasks, e.g.:
#   docker compose run --rm tools pnpm seed
FROM builder AS tools
ENV NODE_ENV=production \
    MEDIA_DIR=/app/media
CMD ["pnpm", "seed"]

# ── Runtime ─────────────────────────────────────────────────────────────────
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    MEDIA_DIR=/app/media

RUN apk add --no-cache su-exec \
  && addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 --ingroup nodejs nextjs

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod 755 /usr/local/bin/docker-entrypoint.sh \
  && mkdir -p /app/media /app/.next/cache \
  && chown -R nextjs:nodejs /app/media /app/.next

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=120s --retries=3 \
  CMD wget -qO- "http://127.0.0.1:${PORT:-3000}/api/health" > /dev/null || exit 1

# The entrypoint fixes storage permissions, then runs the app as the unprivileged `nextjs` user.
# Database migrations run automatically on start-up (see `prodMigrations` in payload.config.ts).
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "server.js"]
