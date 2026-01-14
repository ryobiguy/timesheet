import type { Request, Response, NextFunction } from 'express'
import type { Logger } from 'pino'
import { ZodError } from 'zod'

export interface AppError extends Error {
  statusCode?: number
  code?: string
}

export function createErrorHandler(logger: Logger) {
  return (err: AppError | ZodError, req: Request, res: Response, next: NextFunction): void => {
    // Handle Zod validation errors
    if (err instanceof ZodError) {
      logger.warn({ 
        path: req.path, 
        method: req.method,
        errors: err.errors,
        requestId: res.getHeader('X-Request-ID')
      }, 'Validation error')
      res.status(400).json({
        error: 'Validation failed',
        message: 'Please check your input and try again',
        details: err.errors.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
          code: e.code
        }))
      })
      return
    }

    // Handle Prisma errors
    if (err.code === 'P2002') {
      logger.warn({ 
        path: req.path,
        method: req.method,
        code: err.code,
        requestId: res.getHeader('X-Request-ID')
      }, 'Unique constraint violation')
      res.status(409).json({
        error: 'Conflict',
        message: 'A record with this value already exists. Please use a different value.'
      })
      return
    }

    if (err.code === 'P2025') {
      logger.warn({ 
        path: req.path,
        method: req.method,
        code: err.code,
        requestId: res.getHeader('X-Request-ID')
      }, 'Record not found')
      res.status(404).json({
        error: 'Not found',
        message: 'The requested resource was not found'
      })
      return
    }

    // Handle custom application errors
    const statusCode = err.statusCode ?? 500
    const message = err.message || 'Internal server error'
    const requestId = res.getHeader('X-Request-ID')

    if (statusCode >= 500) {
      logger.error({ 
        err: {
          name: err.name,
          message: err.message,
          stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        }, 
        path: req.path,
        method: req.method,
        requestId,
        code: err.code
      }, 'Server error')
    } else {
      logger.warn({ 
        err: {
          name: err.name,
          message: err.message
        }, 
        path: req.path,
        method: req.method,
        requestId,
        code: err.code
      }, 'Client error')
    }

    res.status(statusCode).json({
      error: statusCode >= 500 ? 'Internal server error' : 'Request failed',
      message: process.env.NODE_ENV === 'production' && statusCode >= 500
        ? 'An unexpected error occurred. Please try again later.'
        : message,
      ...(requestId && { requestId }),
      ...(process.env.NODE_ENV === 'development' && statusCode >= 500 && { stack: err.stack })
    })
  }
}
