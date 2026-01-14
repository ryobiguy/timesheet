import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { z } from 'zod';
import { processGeofenceEvent } from '../services/geofenceProcessor';
const router = Router();
const createGeofenceEventSchema = z.object({
    workerId: z.string().cuid(),
    jobsiteId: z.string().cuid(),
    type: z.enum(['ENTER', 'EXIT']),
    timestamp: z.coerce.date(),
    accuracy: z.number().optional(),
    source: z.string().default('device')
});
const geofenceEventQuerySchema = z.object({
    workerId: z.string().cuid().optional(),
    jobsiteId: z.string().cuid().optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    limit: z.coerce.number().int().positive().max(100).default(50),
    offset: z.coerce.number().int().nonnegative().default(0)
});
// POST /api/geofence-events - Create geofence event (triggers time entry processing)
router.post('/', requireAuth, validateBody(createGeofenceEventSchema), async (req, res) => {
    const eventData = req.body;
    // Verify worker and jobsite exist and are related
    const assignment = await prisma.assignment.findFirst({
        where: {
            workerId: eventData.workerId,
            jobsiteId: eventData.jobsiteId
        }
    });
    if (!assignment) {
        return res.status(404).json({
            error: 'Not found',
            message: 'Worker is not assigned to this jobsite'
        });
    }
    // Verify jobsite exists and get its location
    const jobsite = await prisma.jobsite.findUnique({
        where: { id: eventData.jobsiteId }
    });
    if (!jobsite) {
        return res.status(404).json({
            error: 'Not found',
            message: 'Jobsite not found'
        });
    }
    // Create the event
    const event = await prisma.geofenceEvent.create({
        data: eventData,
        include: {
            worker: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            },
            jobsite: {
                select: {
                    id: true,
                    name: true
                }
            }
        }
    });
    // Process the event to create/update time entries
    try {
        await processGeofenceEvent(event.id);
    }
    catch (error) {
        // Log error but don't fail the request - event is still recorded
        console.error('Error processing geofence event:', error);
    }
    res.status(201).json({ data: event });
});
// GET /api/geofence-events - List geofence events
router.get('/', requireAuth, async (req, res) => {
    const query = geofenceEventQuerySchema.safeParse(req.query);
    if (!query.success) {
        return res.status(400).json({
            error: 'Validation failed',
            details: query.error.errors
        });
    }
    const { workerId, jobsiteId, startDate, endDate, limit, offset } = query.data;
    const where = {};
    if (workerId)
        where.workerId = workerId;
    if (jobsiteId)
        where.jobsiteId = jobsiteId;
    if (startDate || endDate) {
        where.timestamp = {};
        if (startDate)
            where.timestamp.gte = startDate;
        if (endDate)
            where.timestamp.lte = endDate;
    }
    const [events, total] = await Promise.all([
        prisma.geofenceEvent.findMany({
            where,
            take: limit,
            skip: offset,
            orderBy: { timestamp: 'desc' },
            include: {
                worker: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                jobsite: {
                    select: {
                        id: true,
                        name: true,
                        address: true
                    }
                }
            }
        }),
        prisma.geofenceEvent.count({ where })
    ]);
    res.json({
        data: events,
        pagination: {
            total,
            limit,
            offset,
            hasMore: offset + limit < total
        }
    });
});
export default router;
