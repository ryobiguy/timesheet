import { z } from 'zod'

export const createTimeEntrySchema = z.object({
  workerId: z.string().cuid(),
  jobsiteId: z.string().cuid(),
  startAt: z.union([z.coerce.date(), z.string()]).transform((val) => val instanceof Date ? val.toISOString() : val),
  endAt: z.union([z.coerce.date(), z.string()]).optional().transform((val) => val instanceof Date ? val.toISOString() : val),
  durationMinutes: z.number().int().nonnegative().optional(),
  status: z.enum(['PENDING', 'APPROVED', 'DISPUTED']).default('PENDING'),
  createdFromEvents: z.union([z.array(z.string()), z.string()]).default([]).transform((val) => Array.isArray(val) ? JSON.stringify(val) : val)
})

export const updateTimeEntrySchema = z.object({
  startAt: z.union([z.coerce.date(), z.string()]).optional().transform((val) => val instanceof Date ? val.toISOString() : val),
  endAt: z.union([z.coerce.date(), z.string()]).optional().nullable().transform((val) => val instanceof Date ? val.toISOString() : val),
  durationMinutes: z.number().int().nonnegative().optional().nullable(),
  status: z.enum(['PENDING', 'APPROVED', 'DISPUTED']).optional(),
  modifiedBy: z.string().cuid().optional()
})

export const timeEntryParamsSchema = z.object({
  id: z.string().cuid()
})

export const timeEntryQuerySchema = z.object({
  workerId: z.string().cuid().optional(),
  jobsiteId: z.string().cuid().optional(),
  status: z.enum(['PENDING', 'APPROVED', 'DISPUTED']).optional(),
  startDate: z.union([z.coerce.date(), z.string()]).optional().transform((val) => val instanceof Date ? val.toISOString() : val),
  endDate: z.union([z.coerce.date(), z.string()]).optional().transform((val) => val instanceof Date ? val.toISOString() : val),
  minDuration: z.coerce.number().int().nonnegative().optional(), // Minimum duration in minutes
  maxDuration: z.coerce.number().int().nonnegative().optional(), // Maximum duration in minutes
  limit: z.coerce.number().int().positive().max(100).default(50),
  offset: z.coerce.number().int().nonnegative().default(0),
  sortBy: z.enum(['startAt', 'durationMinutes', 'createdAt']).default('startAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
})

export type CreateTimeEntryInput = z.infer<typeof createTimeEntrySchema>
export type UpdateTimeEntryInput = z.infer<typeof updateTimeEntrySchema>
