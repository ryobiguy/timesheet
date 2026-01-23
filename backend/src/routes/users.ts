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

const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(255),
  password: z.string().min(6).max(100),
  role: z.enum(['ADMIN', 'SUPERVISOR', 'WORKER']).default('WORKER')
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

    // SECURITY: Always filter by organization - admins can optionally filter by a different orgId,
    // but if not provided, they only see their own organization's users
    // IMPORTANT: Never allow cross-organization access unless explicitly requested by admin
    const filterOrgId = user.role === 'ADMIN' && orgId ? orgId : user.orgId

    // Log for debugging (remove in production if needed)
    console.log(`[Users API] User ${user.email} (orgId: ${user.orgId}, role: ${user.role}) requesting users. Filter orgId: ${filterOrgId}`)

    const where: any = {
      orgId: filterOrgId // Always filter by organization for security
    }
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

// POST /api/users - Create new user (admin only)
router.post(
  '/',
  requireAuth,
  requireRole('ADMIN'),
  validateBody(createUserSchema),
  async (req: AuthRequest, res: Response) => {
    const { email, name, password, role } = req.body
    const user = req.user!

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'User with this email already exists'
      })
    }

    // Create user in the same organization as the admin
    const passwordHash = await hashPassword(password)
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        orgId: user.orgId,
        role: role || 'WORKER'
      },
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

    res.status(201).json({ data: newUser })
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

    // All users (including admins) can only view users from their own organization
    if (targetUser.orgId !== user.orgId) {
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
    const user = req.user!

    const existingUser = await prisma.user.findUnique({
      where: { id }
    })

    if (!existingUser) {
      return res.status(404).json({
        error: 'Not found',
        message: 'User not found'
      })
    }

    // Ensure admin can only update users from their own organization
    if (existingUser.orgId !== user.orgId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only update users from your organization'
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

    const authUser = (req as AuthRequest).user!

    // Prevent deleting yourself
    if (authUser.id === id) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'You cannot delete your own account'
      })
    }

    // Ensure admin can only delete users from their own organization
    if (user.orgId !== authUser.orgId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only delete users from your organization'
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

    const authUser = (req as AuthRequest).user!

    // Ensure admin can only reset passwords for users from their own organization
    if (user.orgId !== authUser.orgId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only reset passwords for users from your organization'
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
