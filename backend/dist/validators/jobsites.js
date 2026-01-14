import { z } from 'zod';
export const createJobsiteSchema = z.object({
    name: z.string().min(1).max(255),
    address: z.string().min(1).max(500),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    radiusMeters: z.number().int().positive().default(150),
    orgId: z.string().cuid()
});
export const updateJobsiteSchema = z.object({
    name: z.string().min(1).max(255).optional(),
    address: z.string().min(1).max(500).optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    radiusMeters: z.number().int().positive().optional()
});
export const jobsiteParamsSchema = z.object({
    id: z.string().cuid()
});
export const jobsiteQuerySchema = z.object({
    orgId: z.string().cuid().optional(),
    search: z.string().optional(), // Search by name or address
    limit: z.coerce.number().int().positive().max(100).default(50),
    offset: z.coerce.number().int().nonnegative().default(0),
    sortBy: z.enum(['name', 'createdAt', 'updatedAt']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc')
});
