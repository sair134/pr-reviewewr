# Multi-stage build for the monorepo
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/express-integration/package*.json ./apps/express-integration/
COPY apps/next-frontend/package*.json ./apps/next-frontend/
COPY packages/shared/package*.json ./packages/shared/

# Install dependencies
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build all applications
RUN npm run build

# Production image, copy all the files and run the apps
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built applications
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/apps/next-frontend/public ./apps/next-frontend/public
COPY --from=builder /app/apps/next-frontend/next.config.js ./apps/next-frontend/

# Copy package files for runtime dependencies
COPY package*.json ./
COPY apps/express-integration/package*.json ./apps/express-integration/
COPY apps/next-frontend/package*.json ./apps/next-frontend/

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Change ownership of the app directory
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000 3001

# Start both applications
CMD ["npm", "run", "start:production"]
