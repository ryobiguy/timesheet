import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth, requireRole } from '../middleware/auth';
import { z } from 'zod';
const router = Router();
const exportQuerySchema = z.object({
    workerId: z.string().cuid().optional(),
    jobsiteId: z.string().cuid().optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    status: z.enum(['PENDING', 'APPROVED', 'DISPUTED']).optional(),
    format: z.enum(['csv', 'pdf']).default('csv')
});
// GET /api/exports/time-entries - Export time entries
router.get('/time-entries', requireAuth, requireRole('ADMIN', 'SUPERVISOR'), async (req, res) => {
    const query = exportQuerySchema.safeParse(req.query);
    if (!query.success) {
        return res.status(400).json({
            error: 'Validation failed',
            details: query.error.errors
        });
    }
    const { workerId, jobsiteId, startDate, endDate, status, format } = query.data;
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
    const entries = await prisma.timeEntry.findMany({
        where,
        include: {
            worker: {
                select: {
                    name: true,
                    email: true
                }
            },
            jobsite: {
                select: {
                    name: true,
                    address: true
                }
            }
        },
        orderBy: { startAt: 'desc' }
    });
    if (format === 'csv') {
        // Generate CSV
        const headers = ['Worker Name', 'Worker Email', 'Jobsite', 'Start Time', 'End Time', 'Duration (minutes)', 'Status'];
        const rows = entries.map(entry => [
            entry.worker?.name || '',
            entry.worker?.email || '',
            entry.jobsite?.name || '',
            entry.startAt.toISOString(),
            entry.endAt?.toISOString() || '',
            entry.durationMinutes?.toString() || '',
            entry.status
        ]);
        const csv = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="time-entries-${Date.now()}.csv"`);
        res.send(csv);
    }
    else {
        // For PDF, return JSON (PDF generation would require a library like pdfkit)
        res.json({
            message: 'PDF export not yet implemented. Use CSV format.',
            data: entries
        });
    }
});
export default router;
