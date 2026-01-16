FROM node:18-bullseye-slim

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install

# Generate Prisma client (this works in Linux!)
RUN npx prisma generate

# Copy source code
COPY . .

# Build the TypeScript app
RUN npm run build

# Expose port
EXPOSE 5001

# Start the server (create schema if it doesn't exist, then backfill company codes)
CMD ["sh", "-c", "if [ -n \"$DATABASE_URL\" ]; then npx prisma db push --accept-data-loss --skip-generate && (npx tsx scripts/backfill-company-codes.ts || echo 'Backfill skipped'); fi && npm run start"]
