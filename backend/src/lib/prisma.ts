import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

// Test database connection on startup
if (process.env.DATABASE_URL) {
  prisma.$connect()
    .then(() => {
      console.log('✅ Database connected successfully')
    })
    .catch((error) => {
      console.error('❌ Database connection failed:', error.message)
      console.error('Make sure DATABASE_URL is set correctly in environment variables')
    })
} else {
  console.warn('⚠️  DATABASE_URL not set - database operations will fail')
}

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
