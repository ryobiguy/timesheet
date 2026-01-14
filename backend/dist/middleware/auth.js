import { verifyToken } from '../lib/auth';
import { prisma } from '../lib/prisma';
export async function requireAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'Unauthorized', message: 'No token provided' });
            return;
        }
        const token = authHeader.substring(7);
        const decoded = verifyToken(token);
        if (!decoded) {
            res.status(401).json({ error: 'Unauthorized', message: 'Invalid token' });
            return;
        }
        // Verify user still exists
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, email: true, role: true }
        });
        if (!user) {
            res.status(401).json({ error: 'Unauthorized', message: 'User not found' });
            return;
        }
        req.user = {
            id: user.id,
            email: user.email,
            role: user.role
        };
        next();
    }
    catch (error) {
        res.status(401).json({ error: 'Unauthorized', message: 'Token verification failed' });
    }
}
export function requireRole(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized', message: 'Authentication required' });
            return;
        }
        if (!allowedRoles.includes(req.user.role)) {
            res.status(403).json({ error: 'Forbidden', message: 'Insufficient permissions' });
            return;
        }
        next();
    };
}
