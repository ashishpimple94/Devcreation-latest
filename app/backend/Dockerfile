# ============================================================
# Dev Creation — Backend API Dockerfile (Standalone)
# Production-ready multi-stage Node 20 build
# ============================================================

# ── Stage 1: Build TypeScript ─────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies (cached layer)
COPY package*.json ./
RUN npm ci || npm install --no-audit

# Copy source code and build dist/
COPY tsconfig.json tsup.config.ts ./
COPY src ./src
RUN npm run build

# ── Stage 2: Production Runtime ───────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# Install only production dependencies
COPY package*.json ./
RUN npm install --omit=dev --no-audit && npm cache clean --force

# Copy compiled bundles from builder stage
COPY --from=builder /app/dist ./dist
COPY server.js ./

# Create uploads directory and set permissions
RUN mkdir -p uploads && chown -R node:node /app

USER node

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:4000/api/health || exit 1

CMD ["node", "dist/server.js"]
