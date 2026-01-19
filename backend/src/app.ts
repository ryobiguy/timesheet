import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import type { Request, Response } from 'express'
import type { Logger } from 'pino'
import { createRequestLogger } from './middleware/logger'
import { createErrorHandler } from './middleware/errorHandler'
import { apiLimiter, authLimiter, exportLimiter } from './middleware/rateLimiter'
import { sanitizeInput } from './middleware/sanitize'
import authRouter from './routes/auth'
import jobsitesRouter from './routes/jobsites'
import timeEntriesRouter from './routes/timeEntries'
import geofenceEventsRouter from './routes/geofenceEvents'
import summariesRouter from './routes/summaries'
import exportsRouter from './routes/exports'
import statsRouter from './routes/stats'
import disputesRouter from './routes/disputes'
import usersRouter from './routes/users'
import assignmentsRouter from './routes/assignments'
import organizationsRouter from './routes/organizations'
import billingRouter from './routes/billing'

export function createApp(logger: Logger) {
  const app = express()

  // Render/production is behind a proxy; required for rate limiting with X-Forwarded-For
  app.set('trust proxy', 1)

  // Stripe webhook needs raw body - register before JSON parser
  app.use('/api/billing/webhook', express.raw({ type: 'application/json' }), billingRouter)

  // Security and parsing middleware
  app.use(express.json({ limit: '10mb' })) // Limit JSON payload size
  app.use(express.urlencoded({ extended: true, limit: '10mb' }))
  // CORS configuration
  const frontendUrl = process.env.FRONTEND_URL
  const isProduction = process.env.NODE_ENV === 'production'
  const allowedOrigins = frontendUrl 
    ? [frontendUrl, frontendUrl.replace(/\/$/, '')] // Include with and without trailing slash
    : (isProduction 
        ? ['https://timesheet-one-beta.vercel.app'] // Default production frontend
        : ['http://localhost:5175', 'http://localhost:5173'])
  
  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true)
      
      // In production, strictly enforce allowed origins
      if (isProduction) {
        const isAllowed = allowedOrigins.some(allowed => 
          origin === allowed || origin.startsWith(allowed)
        )
        if (isAllowed) {
          callback(null, true)
        } else {
          logger.warn({ origin, allowedOrigins }, 'CORS: Blocked origin in production')
          callback(new Error('Not allowed by CORS'))
        }
      } else {
        // In development, allow all origins for easier testing
        callback(null, true)
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Type']
  }))
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }))

  // Input sanitization
  app.use(sanitizeInput)

  // Rate limiting
  app.use('/api/', apiLimiter)

  // Request logging middleware
  app.use(createRequestLogger(logger))

  // Health check endpoint
  app.get('/api/health', (_: Request, res: Response) => {
    res.json({ status: 'ok', uptime: process.uptime() })
  })

  // Public API routes (with strict rate limiting)
  app.use('/api/auth', authLimiter, authRouter)
  app.use('/api/organizations', organizationsRouter)

  // Protected API routes
  app.use('/api/billing', billingRouter)
  app.use('/api/jobsites', jobsitesRouter)
  app.use('/api/time-entries', timeEntriesRouter)
  app.use('/api/geofence-events', geofenceEventsRouter)
  app.use('/api/summaries', summariesRouter)
  app.use('/api/exports', exportLimiter, exportsRouter)
  app.use('/api/stats', statsRouter)
  app.use('/api/disputes', disputesRouter)
  app.use('/api/users', usersRouter)
  app.use('/api/assignments', assignmentsRouter)

  // Error handling middleware (must be last)
  app.use(createErrorHandler(logger))

  return app
}
