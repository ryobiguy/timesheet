import { Router, type Request, type Response } from 'express'
import { prisma } from '../lib/prisma'
import { requireAuth, requireRole, type AuthRequest } from '../middleware/auth'
import { validateBody, validateParams } from '../middleware/validate'
import { z } from 'zod'

const router = Router()

const createAssignmentSchema = z.object({
  workerId: z.string().cuid(),
  jobsiteId: z.string().cuid(),
  scheduleDays: z.array(z.string()).default([])
})

const updateAssignmentSchema = z.object({
  scheduleDays: z.array(z.string()).optional()
})

const assignmentParamsSchema = z.object({
  id: z.string().cuid()
})

const assignmentQuerySchema = z.object({
  workerId: z.string().cuid().optional(),
  jobsiteId: z.string().cuid().optional(),
  limit: z.coerce.number().int().positive().max(100).default(50),
  offset: z.coerce.number().int().nonnegative().default(0)
})

// GET /api/assignments - List assignments
router.get(
  '/',
  requireAuth,
  async (req: Request, res: Response) => {
    const query = assignmentQuerySchema.safeParse(req.query)
    
    if (!query.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: query.error.errors
      })
    }

    const { workerId, jobsiteId, limit, offset } = query.data

    const where: any = {}
    if (workerId) where.workerId = workerId
    if (jobsiteId) where.jobsiteId = jobsiteId

    const [assignments, total] = await Promise.all([
      prisma.assignment.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
        include: {
          worker: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
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
      prisma.assignment.count({ where })
    ])

    // Parse scheduleDays JSON strings
    const formattedAssignments = assignments.map(assignment => ({
      ...assignment,
      scheduleDays: typeof assignment.scheduleDays === 'string' 
        ? JSON.parse(assignment.scheduleDays || '[]')
        : assignment.scheduleDays
    }))

    res.json({
      data: formattedAssignments,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    })
  }
)

// GET /api/assignments/:id - Get single assignment
router.get(
  '/:id',
  requireAuth,
  validateParams(assignmentParamsSchema),
  async (req: Request, res: Response) => {
    const { id } = req.params

    const assignment = await prisma.assignment.findUnique({
      where: { id },
      include: {
        worker: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
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
    })

    if (!assignment) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Assignment not found'
      })
    }

    // Parse scheduleDays JSON string
    const formattedAssignment = {
      ...assignment,
      scheduleDays: typeof assignment.scheduleDays === 'string' 
        ? JSON.parse(assignment.scheduleDays || '[]')
        : assignment.scheduleDays
    }

    res.json({ data: formattedAssignment })
  }
)

// POST /api/assignments - Create assignment
router.post(
  '/',
  requireAuth,
  requireRole('ADMIN', 'SUPERVISOR'),
  validateBody(createAssignmentSchema),
  async (req: Request, res: Response) => {
    const { workerId, jobsiteId, scheduleDays } = req.body

    // Verify worker exists
    const worker = await prisma.user.findUnique({
      where: { id: workerId }
    })

    if (!worker) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Worker not found'
      })
    }

    if (worker.role !== 'WORKER') {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Only workers can be assigned to jobsites'
      })
    }

    // Verify jobsite exists
    const jobsite = await prisma.jobsite.findUnique({
      where: { id: jobsiteId }
    })

    if (!jobsite) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Jobsite not found'
      })
    }

    // Check if assignment already exists
    const existing = await prisma.assignment.findUnique({
      where: {
        workerId_jobsiteId: {
          workerId,
          jobsiteId
        }
      }
    })

    if (existing) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'Assignment already exists'
      })
    }

    // Create assignment
    const assignment = await prisma.assignment.create({
      data: {
        workerId,
        jobsiteId,
        scheduleDays: JSON.stringify(scheduleDays || [])
      },
      include: {
        worker: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
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
    })

    // Parse scheduleDays for response
    const formattedAssignment = {
      ...assignment,
      scheduleDays: typeof assignment.scheduleDays === 'string' 
        ? JSON.parse(assignment.scheduleDays || '[]')
        : assignment.scheduleDays
    }

    res.status(201).json({ data: formattedAssignment })
  }
)

// PUT /api/assignments/:id - Update assignment
router.put(
  '/:id',
  requireAuth,
  requireRole('ADMIN', 'SUPERVISOR'),
  validateParams(assignmentParamsSchema),
  validateBody(updateAssignmentSchema),
  async (req: Request, res: Response) => {
    const { id } = req.params
    const { scheduleDays } = req.body

    const assignment = await prisma.assignment.findUnique({
      where: { id }
    })

    if (!assignment) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Assignment not found'
      })
    }

    const updateData: any = {}
    if (scheduleDays !== undefined) {
      updateData.scheduleDays = JSON.stringify(scheduleDays)
    }

    const updatedAssignment = await prisma.assignment.update({
      where: { id },
      data: updateData,
      include: {
        worker: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
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
    })

    // Parse scheduleDays for response
    const formattedAssignment = {
      ...updatedAssignment,
      scheduleDays: typeof updatedAssignment.scheduleDays === 'string' 
        ? JSON.parse(updatedAssignment.scheduleDays || '[]')
        : updatedAssignment.scheduleDays
    }

    res.json({ data: formattedAssignment })
  }
)

// DELETE /api/assignments/:id - Delete assignment
router.delete(
  '/:id',
  requireAuth,
  requireRole('ADMIN', 'SUPERVISOR'),
  validateParams(assignmentParamsSchema),
  async (req: Request, res: Response) => {
    const { id } = req.params

    const assignment = await prisma.assignment.findUnique({
      where: { id }
    })

    if (!assignment) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Assignment not found'
      })
    }

    await prisma.assignment.delete({
      where: { id }
    })

    res.status(204).send()
  }
)

export default router
