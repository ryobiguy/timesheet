import { Router, type Request, type Response } from 'express'
import { prisma } from '../lib/prisma'
import { requireAuth, requireRole, type AuthRequest } from '../middleware/auth'
import { z } from 'zod'
import { calculateWeeklySummary } from '../services/summaryCalculator'

const router = Router()

const summaryQuerySchema = z.object({
  workerId: z.string().cuid().optional(),
  weekStart: z.union([z.coerce.date(), z.string()]).optional().transform((val) => val instanceof Date ? val.toISOString() : val),
  limit: z.coerce.number().int().positive().max(100).default(50),
  offset: z.coerce.number().int().nonnegative().default(0)
})

// GET /api/summaries - List timesheet summaries
router.get(
  '/',
  requireAuth,
  async (req: Request, res: Response) => {
    const query = summaryQuerySchema.safeParse(req.query)
    
    if (!query.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: query.error.errors
      })
    }

    const { workerId, weekStart, limit, offset } = query.data

    const where: any = {}
    if (workerId) where.workerId = workerId
    if (weekStart) {
      // weekStart is already an ISO string from the transform
      where.weekStart = weekStart
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
    ])

    res.json({
      data: summaries,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    })
  }
)

// POST /api/summaries/calculate - Calculate weekly summary for a worker
router.post(
  '/calculate',
  requireAuth,
  requireRole('ADMIN', 'SUPERVISOR'),
  async (req: AuthRequest, res: Response) => {
    const { workerId, weekStart } = req.body

    if (!workerId || !weekStart) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'workerId and weekStart are required'
      })
    }

    try {
      // weekStart can be a Date or ISO string
      const weekStartDate = weekStart instanceof Date ? weekStart : new Date(weekStart)
      const summary = await calculateWeeklySummary(workerId, weekStartDate)
      res.json({ data: summary })
    } catch (error: any) {
      res.status(400).json({
        error: 'Calculation failed',
        message: error.message
      })
    }
  }
)

export default router
