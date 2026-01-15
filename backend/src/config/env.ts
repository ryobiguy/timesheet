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
  JWT_SECRET: z.string().default('your-secret-key-change-in-production'),
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

export const env = parsed.data
