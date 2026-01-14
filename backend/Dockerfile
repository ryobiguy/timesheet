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

# Start the server
CMD ["npm", "run", "start"]
