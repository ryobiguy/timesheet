import { Router, type Request, type Response } from 'express'
import { prisma } from '../lib/prisma'
import { requireAuth, requireRole, type AuthRequest } from '../middleware/auth'
import { validateBody, validateParams } from '../middleware/validate'
import { hashPassword } from '../lib/auth'
import { z } from 'zod'

const router = Router()

const updateUserSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  email: z.string().email().optional(),
  role: z.enum(['ADMIN', 'SUPERVISOR', 'WORKER']).optional()
})

const resetPasswordSchema = z.object({
  newPassword: z.string().min(6).max(100)
})

const userParamsSchema = z.object({
  id: z.string().cuid()
})

const userQuerySchema = z.object({
  orgId: z.string().cuid().optional(),
  role: z.enum(['ADMIN', 'SUPERVISOR', 'WORKER']).optional(),
  search: z.string().optional(),
  limit: z.coerce.number().int().positive().max(100).default(50),
  offset: z.coerce.number().int().nonnegative().default(0)
})

// GET /api/users - List users (filtered by organization)
router.get(
  '/',
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    const query = userQuerySchema.safeParse(req.query)
    
    if (!query.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: query.error.errors
      })
    }

    const { orgId, role, search, limit, offset } = query.data
    const user = req.user!

    // Non-admins can only see users from their own organization
    const filterOrgId = user.role === 'ADMIN' ? orgId : user.orgId

    const where: any = {}
    if (filterOrgId) where.orgId = filterOrgId
    if (role) where.role = role
    if (search) {
      // SQLite doesn't support case-insensitive mode, so we'll do case-sensitive search
      // In production with PostgreSQL, you'd use mode: 'insensitive'
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } }
      ]
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          orgId: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              entries: true,
              assignments: true
            }
          }
        }
      }),
      prisma.user.count({ where })
    ])

    res.json({
      data: users,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    })
  }
)

// GET /api/users/:id - Get single user
router.get(
  '/:id',
  requireAuth,
  validateParams(userParamsSchema),
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params
    const user = req.user!

    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        orgId: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            entries: true,
            assignments: true
          }
        }
      }
    })

    if (!targetUser) {
      return res.status(404).json({
        error: 'Not found',
        message: 'User not found'
      })
    }

    // Non-admins can only view users from their own organization
    if (user.role !== 'ADMIN' && targetUser.orgId !== user.orgId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only view users from your organization'
      })
    }

    res.json({ data: targetUser })
  }
)

// PUT /api/users/:id - Update user
router.put(
  '/:id',
  requireAuth,
  requireRole('ADMIN'),
  validateParams(userParamsSchema),
  validateBody(updateUserSchema),
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params
    const updateData = req.body

    const existingUser = await prisma.user.findUnique({
      where: { id }
    })

    if (!existingUser) {
      return res.status(404).json({
        error: 'Not found',
        message: 'User not found'
      })
    }

    // Check if email is being changed and if it's already taken
    if (updateData.email && updateData.email !== existingUser.email) {
      const emailTaken = await prisma.user.findUnique({
        where: { email: updateData.email }
      })

      if (emailTaken) {
        return res.status(409).json({
          error: 'Conflict',
          message: 'Email already in use'
        })
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        orgId: true,
        createdAt: true,
        updatedAt: true
      }
    })

    res.json({ data: updatedUser })
  }
)

// DELETE /api/users/:id - Delete user
router.delete(
  '/:id',
  requireAuth,
  requireRole('ADMIN'),
  validateParams(userParamsSchema),
  async (req: Request, res: Response) => {
    const { id } = req.params

    const user = await prisma.user.findUnique({
      where: { id }
    })

    if (!user) {
      return res.status(404).json({
        error: 'Not found',
        message: 'User not found'
      })
    }

    // Prevent deleting yourself
    const authUser = (req as AuthRequest).user
    if (authUser && authUser.id === id) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'You cannot delete your own account'
      })
    }

    await prisma.user.delete({
      where: { id }
    })

    res.status(204).send()
  }
)

// POST /api/users/:id/reset-password - Reset user password
router.post(
  '/:id/reset-password',
  requireAuth,
  requireRole('ADMIN'),
  validateParams(userParamsSchema),
  validateBody(resetPasswordSchema),
  async (req: Request, res: Response) => {
    const { id } = req.params
    const { newPassword } = req.body

    const user = await prisma.user.findUnique({
      where: { id }
    })

    if (!user) {
      return res.status(404).json({
        error: 'Not found',
        message: 'User not found'
      })
    }

    const passwordHash = await hashPassword(newPassword)

    await prisma.user.update({
      where: { id },
      data: { passwordHash }
    })

    res.json({
      data: {
        message: 'Password reset successfully'
      }
    })
  }
)

export default router
