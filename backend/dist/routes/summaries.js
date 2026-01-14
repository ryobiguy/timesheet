import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth, requireRole } from '../middleware/auth';
import { z } from 'zod';
import { calculateWeeklySummary } from '../services/summaryCalculator';
const router = Router();
const summaryQuerySchema = z.object({
    workerId: z.string().cuid().optional(),
    weekStart: z.coerce.date().optional(),
    limit: z.coerce.number().int().positive().max(100).default(50),
    offset: z.coerce.number().int().nonnegative().default(0)
});
// GET /api/summaries - List timesheet summaries
router.get('/', requireAuth, async (req, res) => {
    const query = summaryQuerySchema.safeParse(req.query);
    if (!query.success) {
        return res.status(400).json({
            error: 'Validation failed',
            details: query.error.errors
        });
    }
    const { workerId, weekStart, limit, offset } = query.data;
    const where = {};
    if (workerId)
        where.workerId = workerId;
    if (weekStart) {
        // Find the start of the week (Monday)
        const start = new Date(weekStart);
        start.setDate(start.getDate() - start.getDay() + 1);
        start.setHours(0, 0, 0, 0);
        where.weekStart = start;
    }
    const [summaries, total] = await Promise.all([
        prisma.timesheetSummary.findMany({
            where,
            take: limit,
            skip: offset,
            orderBy: { weekStart: 'desc' },
            include: {
                worker: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        }),
        prisma.timesheetSummary.count({ where })
    ]);
    res.json({
        data: summaries,
        pagination: {
            total,
            limit,
            offset,
            hasMore: offset + limit < total
        }
    });
});
// POST /api/summaries/calculate - Calculate weekly summary for a worker
router.post('/calculate', requireAuth, requireRole('ADMIN', 'SUPERVISOR'), async (req, res) => {
    const { workerId, weekStart } = req.body;
    if (!workerId || !weekStart) {
        return res.status(400).json({
            error: 'Validation failed',
            message: 'workerId and weekStart are required'
        });
    }
    try {
        const summary = await calculateWeeklySummary(workerId, new Date(weekStart));
        res.json({ data: summary });
    }
    catch (error) {
        res.status(400).json({
            error: 'Calculation failed',
            message: error.message
        });
    }
});
export default router;
