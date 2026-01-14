import { ZodError } from 'zod';
export function createErrorHandler(logger) {
    return (err, req, res, next) => {
        // Handle Zod validation errors
        if (err instanceof ZodError) {
            logger.warn({ path: req.path, errors: err.errors }, 'Validation error');
            res.status(400).json({
                error: 'Validation failed',
                details: err.errors.map((e) => ({
                    path: e.path.join('.'),
                    message: e.message
                }))
            });
            return;
        }
        // Handle Prisma errors
        if (err.code === 'P2002') {
            logger.warn({ path: req.path }, 'Unique constraint violation');
            res.status(409).json({
                error: 'Resource already exists',
                message: 'A record with this value already exists'
            });
            return;
        }
        if (err.code === 'P2025') {
            logger.warn({ path: req.path }, 'Record not found');
            res.status(404).json({
                error: 'Not found',
                message: 'The requested resource was not found'
            });
            return;
        }
        // Handle custom application errors
        const statusCode = err.statusCode ?? 500;
        const message = err.message || 'Internal server error';
        if (statusCode >= 500) {
            logger.error({ err, path: req.path }, 'Server error');
        }
        else {
            logger.warn({ err, path: req.path }, 'Client error');
        }
        res.status(statusCode).json({
            error: statusCode >= 500 ? 'Internal server error' : 'Request failed',
            message: process.env.NODE_ENV === 'production' && statusCode >= 500
                ? 'An unexpected error occurred'
                : message
        });
    };
}
