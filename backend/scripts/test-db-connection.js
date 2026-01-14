// Quick script to test PostgreSQL connection
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testConnection() {
  try {
    await prisma.$connect()
    console.log('✅ Database connection successful!')
    
    // Try a simple query
    const result = await prisma.$queryRaw`SELECT version()`
    console.log('✅ Database query successful!')
    console.log('PostgreSQL version:', result[0]?.version || 'Unknown')
    
    await prisma.$disconnect()
    process.exit(0)
  } catch (error) {
    console.error('❌ Database connection failed:')
    console.error('Error code:', error.code)
    console.error('Error message:', error.message)
    console.error('\n💡 Common issues:')
    console.error('1. Wrong username/password in DATABASE_URL')
    console.error('2. PostgreSQL service not running')
    console.error('3. Wrong port (default is 5432)')
    console.error('4. Database "timesheet" does not exist')
    console.error('\n📝 Update backend/.env with:')
    console.error('DATABASE_URL=postgresql://USERNAME:PASSWORD@localhost:5432/timesheet')
    process.exit(1)
  }
}

testConnection()
