import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { createTimeEntrySchema, updateTimeEntrySchema, timeEntryParamsSchema, timeEntryQuerySchema } from '../validators/timeEntries';
import { validateBody, validateParams, validateQuery } from '../middleware/validate';
const router = Router();
// Helper function to calculate duration in minutes
function calculateDuration(startAt, endAt) {
    if (!endAt)
        return null;
    return Math.floor((endAt.getTime() - startAt.getTime()) / (1000 * 60));
}
// GET /api/time-entries - List time entries with optional filters
router.get('/', validateQuery(timeEntryQuerySchema), async (req, res) => {
    const { workerId, jobsiteId, status, startDate, endDate, minDuration, maxDuration, limit, offset, sortBy, sortOrder } = req.query;
    const where = {};
    if (workerId)
        where.workerId = workerId;
    if (jobsiteId)
        where.jobsiteId = jobsiteId;
    if (status)
        where.status = status;
    if (startDate || endDate) {
        where.startAt = {};
        if (startDate)
            where.startAt.gte = startDate;
        if (endDate)
            where.startAt.lte = endDate;
    }
    if (minDuration !== undefined || maxDuration !== undefined) {
        where.durationMinutes = {};
        if (minDuration !== undefined)
            where.durationMinutes.gte = minDuration;
        if (maxDuration !== undefined)
            where.durationMinutes.lte = maxDuration;
    }
    const [entries, total] = await Promise.all([
        prisma.timeEntry.findMany({
            where,
            take: limit,
            skip: offset,
            orderBy: { [sortBy]: sortOrder },
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
                },
                _count: {
                    select: {
                        disputes: true
                    }
                }
            }
        }),
        prisma.timeEntry.count({ where })
    ]);
    res.json({
        data: entries,
        pagination: {
            total,
            limit,
            offset,
            hasMore: offset + limit < total
        }
    });
});
// GET /api/time-entries/:id - Get single time entry
router.get('/:id', validateParams(timeEntryParamsSchema), async (req, res) => {
    const { id } = req.params;
    const entry = await prisma.timeEntry.findUnique({
        where: { id },
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
            },
            disputes: {
                orderBy: { createdAt: 'desc' }
            }
        }
    });
    if (!entry) {
        return res.status(404).json({
            error: 'Not found',
            message: 'Time entry not found'
        });
    }
    res.json({ data: entry });
});
// POST /api/time-entries - Create new time entry
router.post('/', validateBody(createTimeEntrySchema), async (req, res) => {
    const data = req.body;
    const { startAt, endAt } = data;
    // Calculate duration if endAt is provided
    const durationMinutes = endAt
        ? calculateDuration(startAt, endAt)
        : data.durationMinutes ?? null;
    const entry = await prisma.timeEntry.create({
        data: {
            ...data,
            durationMinutes
        },
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
    });
    res.status(201).json({ data: entry });
});
// PUT /api/time-entries/:id - Update time entry
router.put('/:id', validateParams(timeEntryParamsSchema), validateBody(updateTimeEntrySchema), async (req, res) => {
    const { id } = req.params;
    const updateData = { ...req.body };
    // Get existing entry to calculate duration if needed
    const existing = await prisma.timeEntry.findUnique({
        where: { id }
    });
    if (!existing) {
        return res.status(404).json({
            error: 'Not found',
            message: 'Time entry not found'
        });
    }
    // Calculate duration if startAt or endAt changed
    const startAt = updateData.startAt ?? existing.startAt;
    const endAt = updateData.endAt !== undefined ? updateData.endAt : existing.endAt;
    if (updateData.startAt || updateData.endAt !== undefined) {
        updateData.durationMinutes = calculateDuration(startAt, endAt);
    }
    const entry = await prisma.timeEntry.update({
        where: { id },
        data: updateData,
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
    });
    res.json({ data: entry });
});
// DELETE /api/time-entries/:id - Delete time entry
router.delete('/:id', validateParams(timeEntryParamsSchema), async (req, res) => {
    const { id } = req.params;
    await prisma.timeEntry.delete({
        where: { id }
    });
    res.status(204).send();
});
export default router;
