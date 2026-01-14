import { z } from 'zod';
export const createTimeEntrySchema = z.object({
    workerId: z.string().cuid(),
    jobsiteId: z.string().cuid(),
    startAt: z.coerce.date(),
    endAt: z.coerce.date().optional(),
    durationMinutes: z.number().int().nonnegative().optional(),
    status: z.enum(['PENDING', 'APPROVED', 'DISPUTED']).default('PENDING'),
    createdFromEvents: z.array(z.string()).default([])
});
export const updateTimeEntrySchema = z.object({
    startAt: z.coerce.date().optional(),
    endAt: z.coerce.date().optional().nullable(),
    durationMinutes: z.number().int().nonnegative().optional().nullable(),
    status: z.enum(['PENDING', 'APPROVED', 'DISPUTED']).optional(),
    modifiedBy: z.string().cuid().optional()
});
export const timeEntryParamsSchema = z.object({
    id: z.string().cuid()
});
export const timeEntryQuerySchema = z.object({
    workerId: z.string().cuid().optional(),
    jobsiteId: z.string().cuid().optional(),
    status: z.enum(['PENDING', 'APPROVED', 'DISPUTED']).optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    minDuration: z.coerce.number().int().nonnegative().optional(), // Minimum duration in minutes
    maxDuration: z.coerce.number().int().nonnegative().optional(), // Maximum duration in minutes
    limit: z.coerce.number().int().positive().max(100).default(50),
    offset: z.coerce.number().int().nonnegative().default(0),
    sortBy: z.enum(['startAt', 'durationMinutes', 'createdAt']).default('startAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc')
});
