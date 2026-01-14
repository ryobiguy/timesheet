import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { createJobsiteSchema, updateJobsiteSchema, jobsiteParamsSchema, jobsiteQuerySchema } from '../validators/jobsites';
import { validateBody, validateParams, validateQuery } from '../middleware/validate';
const router = Router();
// GET /api/jobsites - List jobsites with optional filters
router.get('/', validateQuery(jobsiteQuerySchema), async (req, res) => {
    const { orgId, search, limit, offset, sortBy, sortOrder } = req.query;
    const where = {};
    if (orgId)
        where.orgId = orgId;
    if (search) {
        where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { address: { contains: search, mode: 'insensitive' } }
        ];
    }
    const [jobsites, total] = await Promise.all([
        prisma.jobsite.findMany({
            where,
            take: limit,
            skip: offset,
            orderBy: { [sortBy]: sortOrder },
            include: {
                org: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        }),
        prisma.jobsite.count({ where })
    ]);
    res.json({
        data: jobsites,
        pagination: {
            total,
            limit,
            offset,
            hasMore: offset + limit < total
        }
    });
});
// GET /api/jobsites/:id - Get single jobsite
router.get('/:id', validateParams(jobsiteParamsSchema), async (req, res) => {
    const { id } = req.params;
    const jobsite = await prisma.jobsite.findUnique({
        where: { id },
        include: {
            org: {
                select: {
                    id: true,
                    name: true
                }
            },
            _count: {
                select: {
                    assignments: true,
                    entries: true,
                    events: true
                }
            }
        }
    });
    if (!jobsite) {
        return res.status(404).json({
            error: 'Not found',
            message: 'Jobsite not found'
        });
    }
    res.json({ data: jobsite });
});
// POST /api/jobsites - Create new jobsite
router.post('/', validateBody(createJobsiteSchema), async (req, res) => {
    const jobsite = await prisma.jobsite.create({
        data: req.body,
        include: {
            org: {
                select: {
                    id: true,
                    name: true
                }
            }
        }
    });
    res.status(201).json({ data: jobsite });
});
// PUT /api/jobsites/:id - Update jobsite
router.put('/:id', validateParams(jobsiteParamsSchema), validateBody(updateJobsiteSchema), async (req, res) => {
    const { id } = req.params;
    const jobsite = await prisma.jobsite.update({
        where: { id },
        data: req.body,
        include: {
            org: {
                select: {
                    id: true,
                    name: true
                }
            }
        }
    });
    res.json({ data: jobsite });
});
// DELETE /api/jobsites/:id - Delete jobsite
router.delete('/:id', validateParams(jobsiteParamsSchema), async (req, res) => {
    const { id } = req.params;
    await prisma.jobsite.delete({
        where: { id }
    });
    res.status(204).send();
});
export default router;
