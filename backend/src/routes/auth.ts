import { Router, type Request, type Response } from 'express'
import { prisma } from '../lib/prisma'
import { hashPassword, verifyPassword, generateToken } from '../lib/auth'
import { registerSchema, loginSchema } from '../validators/auth'
import { validateBody } from '../middleware/validate'

const router = Router()

// POST /api/auth/register
router.post(
  '/register',
  validateBody(registerSchema),
  async (req: Request, res: Response) => {
    const { email, name, password, companyCode, role } = req.body

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

    // Find organization by company code
    const org = await prisma.organization.findUnique({
      where: { companyCode }
    })

    if (!org) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Invalid company code. Please check with your administrator.'
      })
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password)
    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        orgId: org.id,
        role
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

    const token = generateToken(user.id, user.email, user.role)

    res.status(201).json({
      data: {
        user,
        token
      }
    })
  }
)

// POST /api/auth/login
router.post(
  '/login',
  validateBody(loginSchema),
  async (req: Request, res: Response) => {
    const { email, password, companyCode } = req.body

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        org: {
          select: {
            id: true,
            name: true,
            companyCode: true
          }
        }
      }
    })

    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid email or password'
      })
    }

    // Verify company code matches user's organization
    if (user.org?.companyCode !== companyCode) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid company code'
      })
    }

    const isValid = await verifyPassword(password, user.passwordHash)

    if (!isValid) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid email or password'
      })
    }

    const token = generateToken(user.id, user.email, user.role)

    res.json({
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          orgId: user.orgId,
          org: user.org
        },
        token
      }
    })
  }
)

export default router
