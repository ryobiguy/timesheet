import { Router, type Request, type Response } from 'express'
import { prisma } from '../lib/prisma'
import { requireAuth, type AuthRequest } from '../middleware/auth'

const router = Router()

// GET /api/stats/overview - Get overview statistics
router.get(
  '/overview',
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayStr = today.toISOString()
      
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      const tomorrowStr = tomorrow.toISOString()

      // Get active workers (those with pending entries that haven't ended today)
      const activeEntries = await prisma.timeEntry.findMany({
        where: {
          status: 'PENDING',
          endAt: null,
          startAt: {
            gte: todayStr,
            lt: tomorrowStr
          }
        },
        select: {
          workerId: true,
          jobsiteId: true
        }
      })

      const uniqueWorkers = new Set(activeEntries.map(e => e.workerId))
      const uniqueSites = new Set(activeEntries.map(e => e.jobsiteId))

      // Get all pending entries (for unapproved hours calculation)
      const allPendingEntries = await prisma.timeEntry.findMany({
        where: {
          status: 'PENDING'
        },
        select: {
          durationMinutes: true
        }
      })

      // Calculate total unapproved hours
      const totalUnapprovedMinutes = allPendingEntries.reduce((sum, entry) => {
        return sum + (entry.durationMinutes || 0)
      }, 0)
      const totalUnapprovedHours = (totalUnapprovedMinutes / 60).toFixed(1)

      // Get pending entries with details for the exceptions list
      const pendingEntriesWithDetails = await prisma.timeEntry.findMany({
        where: {
          status: 'PENDING'
        },
        take: 10,
        orderBy: {
          startAt: 'desc'
        },
        include: {
          worker: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          jobsite: {
            select: {
              id: true,
              name: true,
              address: true
            }
          },
          _count: {
            select: {
              disputes: true
            }
          }
        }
      })

      // Format pending entries
      const formattedEntries = pendingEntriesWithDetails.map(entry => {
        const startTime = new Date(entry.startAt)
        const duration = entry.durationMinutes 
          ? `${Math.floor(entry.durationMinutes / 60)}:${String(entry.durationMinutes % 60).padStart(2, '0')}`
          : 'N/A'
        
        let status = 'Awaiting approval'
        if (!entry.endAt) {
          status = 'Missing exit event'
        } else if (entry._count.disputes > 0) {
          status = 'Flagged by worker'
        }

        return {
          id: entry.id,
          worker: entry.worker?.name || 'Unknown',
          jobsite: entry.jobsite?.name || 'Unknown',
          status,
          duration,
          start: startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          startAt: entry.startAt,
          endAt: entry.endAt
        }
      })

      // Get recent activity (last 10 time entries)
      const recentActivity = await prisma.timeEntry.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          worker: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          jobsite: {
            select: {
              id: true,
              name: true
            }
          }
        }
      })

      const formattedActivity = recentActivity.map(entry => ({
        id: entry.id,
        type: entry.status === 'APPROVED' ? 'approved' : entry.status === 'DISPUTED' ? 'disputed' : 'created',
        worker: entry.worker?.name || 'Unknown',
        jobsite: entry.jobsite?.name || 'Unknown',
        timestamp: entry.createdAt,
        duration: entry.durationMinutes ? `${Math.floor(entry.durationMinutes / 60)}h ${entry.durationMinutes % 60}m` : 'N/A'
      }))

      res.json({
        data: {
          workersClockedIn: uniqueWorkers.size,
          sitesActive: uniqueSites.size,
          unapprovedHours: totalUnapprovedHours,
          pendingEntries: formattedEntries,
          recentActivity: formattedActivity
        }
      })
    } catch (error: any) {
      res.status(500).json({
        error: 'Failed to fetch stats',
        message: error.message
      })
    }
  }
)

export default router
