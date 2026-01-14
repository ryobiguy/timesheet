import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
const JWT_EXPIRES_IN = '7d';
export async function hashPassword(password) {
    return bcrypt.hash(password, 10);
}
export async function verifyPassword(password, hash) {
    return bcrypt.compare(password, hash);
}
export function generateToken(userId, email, role) {
    return jwt.sign({ userId, email, role }, env.JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}
export function verifyToken(token) {
    try {
        const decoded = jwt.verify(token, env.JWT_SECRET);
        return decoded;
    }
    catch {
        return null;
    }
}
