import { z } from 'zod'

export const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(255),
  password: z.string().min(8).max(100),
  companyCode: z.string().regex(/^\d{6}$/, 'Company code must be 6 digits'),
  role: z.enum(['ADMIN', 'SUPERVISOR', 'WORKER']).default('WORKER')
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  companyCode: z.string().regex(/^\d{6}$/, 'Company code must be 6 digits').optional()
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
