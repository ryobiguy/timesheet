import { Router, type Request, type Response } from 'express'
import { prisma } from '../lib/prisma'
import { hashPassword, generateToken } from '../lib/auth'
import { validateBody } from '../middleware/validate'
import { z } from 'zod'
import { authLimiter } from '../middleware/rateLimiter'

const router = Router()

const createOrganizationSchema = z.object({
  organizationName: z.string().min(1).max(255),
  adminName: z.string().min(1).max(255),
  adminEmail: z.string().email(),
  adminPassword: z.string().min(8).max(100),
  subscriptionTier: z.enum(['free', 'starter', 'professional', 'enterprise']).default('free')
})

// POST /api/organizations/signup - Create organization and admin user
router.post(
  '/signup',
  authLimiter,
  validateBody(createOrganizationSchema),
  async (req: Request, res: Response) => {
    const { organizationName, adminName, adminEmail, adminPassword, subscriptionTier } = req.body

    // Check if admin email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: adminEmail }
    })

    if (existingUser) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'An account with this email already exists'
      })
    }

    // Create organization and admin user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create organization
      const org = await tx.organization.create({
        data: {
          name: organizationName,
          subscriptionTier
        }
      })

      // Hash password and create admin user
      const passwordHash = await hashPassword(adminPassword)
      const user = await tx.user.create({
        data: {
          email: adminEmail,
          name: adminName,
          passwordHash,
          orgId: org.id,
          role: 'ADMIN'
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          orgId: true,
          createdAt: true
        }
      })

      return { org, user }
    })

    const token = generateToken(result.user.id, result.user.email, result.user.role)

    res.status(201).json({
      data: {
        organization: {
          id: result.org.id,
          name: result.org.name,
          subscriptionTier: result.org.subscriptionTier
        },
        user: result.user,
        token
      }
    })
  }
)

export default router
