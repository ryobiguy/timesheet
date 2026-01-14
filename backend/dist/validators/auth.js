import { z } from 'zod';
export const registerSchema = z.object({
    email: z.string().email(),
    name: z.string().min(1).max(255),
    password: z.string().min(8).max(100),
    orgId: z.string().cuid(),
    role: z.enum(['ADMIN', 'SUPERVISOR', 'WORKER']).default('WORKER')
});
export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1)
});
