# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install all dependencies including devDependencies for build
RUN npm install

# Copy source code and Prisma schema
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Production stage
FROM node:22-alpine

WORKDIR /app

# Copy only necessary files from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json

# Set production environment
ENV NODE_ENV=production

EXPOSE 3000

# Start the application (migrate and optionally seed first)
CMD ["sh", "-c", "npx prisma migrate deploy && ([ \"$SEED_DATABASE\" = \"true\" ] && node dist/seed.js || echo 'Skipping seed') && npm run start:prod"]
