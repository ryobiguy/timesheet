import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createRequestLogger } from './middleware/logger';
import { createErrorHandler } from './middleware/errorHandler';
import authRouter from './routes/auth';
import jobsitesRouter from './routes/jobsites';
import timeEntriesRouter from './routes/timeEntries';
import geofenceEventsRouter from './routes/geofenceEvents';
import summariesRouter from './routes/summaries';
import exportsRouter from './routes/exports';
export function createApp(logger) {
    const app = express();
    // Security and parsing middleware
    app.use(express.json());
    app.use(cors());
    app.use(helmet());
    // Request logging middleware
    app.use(createRequestLogger(logger));
    // Health check endpoint
    app.get('/api/health', (_, res) => {
        res.json({ status: 'ok', uptime: process.uptime() });
    });
    // Public API routes
    app.use('/api/auth', authRouter);
    // Protected API routes
    app.use('/api/jobsites', jobsitesRouter);
    app.use('/api/time-entries', timeEntriesRouter);
    app.use('/api/geofence-events', geofenceEventsRouter);
    app.use('/api/summaries', summariesRouter);
    app.use('/api/exports', exportsRouter);
    // Error handling middleware (must be last)
    app.use(createErrorHandler(logger));
    return app;
}
