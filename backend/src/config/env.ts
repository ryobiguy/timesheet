import dotenv from 'dotenv'
import { z } from 'zod'

dotenv.config()

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.preprocess((value) => {
    const num = typeof value === 'string' ? Number(value) : value
    if (typeof num !== 'number' || Number.isNaN(num) || num <= 0) {
      return undefined
    }
    return num
  }, z.number().int().positive().default(5001)),
  DATABASE_URL: z.string().url().optional(), // Optional during startup, will fail on first DB query if missing
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters for production').default('your-secret-key-change-in-production'),
  FRONTEND_URL: z.string().url().optional(),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PRICE_ID: z.string().optional() // Price ID for £1/employee/month
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('Invalid environment configuration', parsed.error.flatten().fieldErrors)
  throw new Error('Env validation failed')
}

const env = parsed.data

// Production environment warnings
if (env.NODE_ENV === 'production') {
  const warnings: string[] = []
  
  if (env.JWT_SECRET === 'your-secret-key-change-in-production') {
    warnings.push('⚠️  JWT_SECRET is using default value - CHANGE THIS IN PRODUCTION!')
  }
  
  if (!env.DATABASE_URL) {
    warnings.push('⚠️  DATABASE_URL is missing - database operations will fail!')
  }
  
  if (!env.FRONTEND_URL) {
    warnings.push('⚠️  FRONTEND_URL is missing - CORS may not work correctly!')
  }
  
  if (!env.STRIPE_SECRET_KEY || !env.STRIPE_WEBHOOK_SECRET) {
    warnings.push('⚠️  Stripe keys missing - billing features will not work!')
  }
  
  if (warnings.length > 0) {
    console.warn('\n🚨 PRODUCTION ENVIRONMENT WARNINGS:\n')
    warnings.forEach(warning => console.warn(warning))
    console.warn('\n')
  }
}

export { env }
