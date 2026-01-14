import dotenv from 'dotenv';
import { z } from 'zod';
dotenv.config();
const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().default(5001),
    DATABASE_URL: z.string().url(),
    JWT_SECRET: z.string().default('your-secret-key-change-in-production')
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    console.error('Invalid environment configuration', parsed.error.flatten().fieldErrors);
    throw new Error('Env validation failed');
}
export const env = parsed.data;
