# ── Stage 1: Build ──
FROM node:20-alpine AS builder

WORKDIR /app

# Copy workspace package manifests
COPY package.json package-lock.json ./
COPY apps/backend/package.json ./apps/backend/
COPY apps/frontend/package.json ./apps/frontend/
COPY apps/admin/package.json ./apps/admin/
COPY packages/config/package.json ./packages/config/
COPY packages/types/package.json ./packages/types/

# Install dependencies cleanly
RUN npm ci

# Copy backend source & config
COPY apps/backend ./apps/backend

# Compile TypeScript to JavaScript
RUN npm run build:api

# Prune development dependencies
RUN npm prune --omit=dev

# ── Stage 2: Production Runner ──
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Run as non-root user for security
RUN addgroup -S bingooo && adduser -S bingooo -G bingooo

# Copy pruned production dependencies and compiled output
COPY --from=builder --chown=bingooo:bingooo /app/node_modules ./node_modules
COPY --from=builder --chown=bingooo:bingooo /app/apps/backend/node_modules ./apps/backend/node_modules
COPY --from=builder --chown=bingooo:bingooo /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder --chown=bingooo:bingooo /app/apps/backend/package.json ./apps/backend/package.json

# Create directories with non-root ownership
RUN mkdir -p /app/apps/backend/data /app/apps/backend/uploads && \
    chown -R bingooo:bingooo /app/apps/backend/data /app/apps/backend/uploads

USER bingooo

WORKDIR /app/apps/backend

EXPOSE 8080

CMD ["node", "dist/main.js"]
