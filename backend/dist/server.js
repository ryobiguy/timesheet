import pino from 'pino';
import { env } from './config/env';
import { createApp } from './app';
const logger = pino({ name: 'timesheet-backend', level: env.NODE_ENV === 'development' ? 'debug' : 'info' });
async function bootstrap() {
    const app = createApp(logger);
    app.listen(env.PORT, () => {
        logger.info(`Timesheet API running on port ${env.PORT}`);
    });
}
bootstrap().catch((error) => {
    logger.error(error, 'Failed to start server');
    process.exit(1);
});
