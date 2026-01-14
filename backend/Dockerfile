FROM node:18-alpine

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

# Expose port
EXPOSE 5001

# Start the server
CMD ["npm", "run", "dev"]
