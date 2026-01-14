import type { Request, Response, NextFunction } from 'express'
import type { Logger } from 'pino'

export function createRequestLogger(logger: Logger) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const start = Date.now()
    const requestId = Math.random().toString(36).substring(7)

    // Add request ID to response headers for tracing
    res.setHeader('X-Request-ID', requestId)

    // Log request start
    logger.debug({
      requestId,
      method: req.method,
      path: req.path,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      query: Object.keys(req.query).length > 0 ? req.query : undefined,
    }, 'Incoming request')

    res.on('finish', () => {
      const duration = Date.now() - start
      const logData = {
        requestId,
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        durationMs: duration,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        contentLength: res.get('content-length'),
      }

      if (res.statusCode >= 500) {
        logger.error(logData, 'Request error')
      } else if (res.statusCode >= 400) {
        logger.warn(logData, 'Client error')
      } else {
        logger.info(logData, 'Request completed')
      }
    })

    next()
  }
}
