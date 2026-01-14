export function createRequestLogger(logger) {
    return (req, res, next) => {
        const start = Date.now();
        res.on('finish', () => {
            const duration = Date.now() - start;
            const logData = {
                method: req.method,
                path: req.path,
                statusCode: res.statusCode,
                duration: `${duration}ms`,
                ip: req.ip
            };
            if (res.statusCode >= 400) {
                logger.warn(logData, 'HTTP request');
            }
            else {
                logger.info(logData, 'HTTP request');
            }
        });
        next();
    };
}
