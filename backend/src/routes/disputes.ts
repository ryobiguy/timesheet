import { Router, type Request, type Response } from 'express'
import { prisma } from '../lib/prisma'
import { requireAuth, requireRole, type AuthRequest } from '../middleware/auth'
import { validateBody, validateParams } from '../middleware/validate'
import { z } from 'zod'

const router = Router()

const createDisputeSchema = z.object({
  timeEntryId: z.string().cuid(),
  reason: z.string().min(1).max(1000)
})

const updateDisputeSchema = z.object({
  resolution: z.string().min(1).max(1000).optional(),
  resolvedBy: z.string().cuid().optional()
})

const disputeParamsSchema = z.object({
  id: z.string().cuid()
})

const disputeQuerySchema = z.object({
  timeEntryId: z.string().cuid().optional(),
  status: z.enum(['open', 'resolved']).optional(),
  limit: z.coerce.number().int().positive().max(100).default(50),
  offset: z.coerce.number().int().nonnegative().default(0)
})

// GET /api/disputes - List disputes
router.get(
  '/',
  requireAuth,
  async (req: Request, res: Response) => {
    const query = disputeQuerySchema.safeParse(req.query)
    
    if (!query.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: query.error.errors
      })
    }

    const { timeEntryId, status, limit, offset } = query.data

    const where: any = {}
    if (timeEntryId) where.timeEntryId = timeEntryId
    if (status === 'open') {
      where.resolution = null
    } else if (status === 'resolved') {
      where.resolution = { not: null }
    }

    const [disputes, total] = await Promise.all([
      prisma.dispute.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
        include: {
          timeEntry: {
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
          },
          raisedByUser: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      }),
      prisma.dispute.count({ where })
    ])

    res.json({
      data: disputes,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    })
  }
)

// GET /api/disputes/:id - Get single dispute
router.get(
  '/:id',
  requireAuth,
  validateParams(disputeParamsSchema),
  async (req: Request, res: Response) => {
    const { id } = req.params

    const dispute = await prisma.dispute.findUnique({
      where: { id },
      include: {
        timeEntry: {
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
        },
        raisedByUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!dispute) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Dispute not found'
      })
    }

    res.json({ data: dispute })
  }
)

// POST /api/disputes - Create dispute
router.post(
  '/',
  requireAuth,
  validateBody(createDisputeSchema),
  async (req: AuthRequest, res: Response) => {
    const { timeEntryId, reason } = req.body
    const userId = req.user!.id

    // Verify time entry exists
    const timeEntry = await prisma.timeEntry.findUnique({
      where: { id: timeEntryId }
    })

    if (!timeEntry) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Time entry not found'
      })
    }

    // Create dispute
    const dispute = await prisma.dispute.create({
      data: {
        timeEntryId,
        raisedBy: userId,
        reason
      },
      include: {
        timeEntry: {
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
        },
        raisedByUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    // Update time entry status to DISPUTED
    await prisma.timeEntry.update({
      where: { id: timeEntryId },
      data: { status: 'DISPUTED' }
    })

    res.status(201).json({ data: dispute })
  }
)

// PUT /api/disputes/:id - Resolve dispute
router.put(
  '/:id',
  requireAuth,
  requireRole('ADMIN', 'SUPERVISOR'),
  validateParams(disputeParamsSchema),
  validateBody(updateDisputeSchema),
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params
    const { resolution } = req.body
    const userId = req.user!.id

    const dispute = await prisma.dispute.findUnique({
      where: { id },
      include: {
        timeEntry: true
      }
    })

    if (!dispute) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Dispute not found'
      })
    }

    if (dispute.resolution) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Dispute is already resolved'
      })
    }

    // Resolve dispute
    const resolvedDispute = await prisma.dispute.update({
      where: { id },
      data: {
        resolution: resolution || 'Resolved',
        resolvedBy: userId,
        resolvedAt: new Date().toISOString()
      },
      include: {
        timeEntry: {
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
        },
        raisedByUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    // Update time entry status back to PENDING or APPROVED based on resolution
    // For now, we'll set it back to PENDING for review
    await prisma.timeEntry.update({
      where: { id: dispute.timeEntryId },
      data: { status: 'PENDING' }
    })

    res.json({ data: resolvedDispute })
  }
)

// DELETE /api/disputes/:id - Delete dispute (admin only)
router.delete(
  '/:id',
  requireAuth,
  requireRole('ADMIN'),
  validateParams(disputeParamsSchema),
  async (req: Request, res: Response) => {
    const { id } = req.params

    const dispute = await prisma.dispute.findUnique({
      where: { id }
    })

    if (!dispute) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Dispute not found'
      })
    }

    await prisma.dispute.delete({
      where: { id }
    })

    res.status(204).send()
  }
)

export default router
