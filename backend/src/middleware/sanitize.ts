import type { Request, Response, NextFunction } from 'express'

/**
 * Basic input sanitization middleware
 * Removes potentially dangerous characters from string inputs
 */
export function sanitizeInput(req: Request, res: Response, next: NextFunction): void {
  // Avoid mutating raw request bodies (e.g., Stripe webhooks use Buffer body for signature verification)
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
    req.body = sanitizeObject(req.body)
  }
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query) as any
  }
  next()
}

function sanitizeObject(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item))
  }
  
  if (obj !== null && typeof obj === 'object') {
    const sanitized: any = {}
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = obj[key]
        if (typeof value === 'string') {
          // Remove potentially dangerous characters but keep valid data
          sanitized[key] = value
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
            .trim()
        } else {
          sanitized[key] = sanitizeObject(value)
        }
      }
    }
    return sanitized
  }
  
  return obj
}
