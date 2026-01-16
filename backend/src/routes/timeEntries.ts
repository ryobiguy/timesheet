import { Router, type Response } from 'express'
import { prisma } from '../lib/prisma'
import {
  createTimeEntrySchema,
  updateTimeEntrySchema,
  timeEntryParamsSchema,
  timeEntryQuerySchema
} from '../validators/timeEntries'
import { validateBody, validateParams } from '../middleware/validate'
import { requireAuth, requireRole, type AuthRequest } from '../middleware/auth'

const router = Router()

// Helper function to calculate duration in minutes (works with ISO strings)
function calculateDuration(startAt: string, endAt: string | null | undefined): number | null {
  if (!endAt) return null
  const start = new Date(startAt)
  const end = new Date(endAt)
  return Math.floor((end.getTime() - start.getTime()) / (1000 * 60))
}

// GET /api/time-entries - List time entries with optional filters
router.get(
  '/',
  async (req: Request, res: Response) => {
    const query = timeEntryQuerySchema.parse(req.query)
    const {
      workerId,
      jobsiteId,
      status,
      startDate,
      endDate,
      minDuration,
      maxDuration,
      limit,
      offset,
      sortBy,
      sortOrder
    } = query

    const where: any = {}
    if (workerId) where.workerId = workerId
    if (jobsiteId) where.jobsiteId = jobsiteId
    if (status) where.status = status
    if (startDate || endDate) {
      where.startAt = {}
      if (startDate) where.startAt.gte = startDate
      if (endDate) where.startAt.lte = endDate
    }
    if (minDuration !== undefined || maxDuration !== undefined) {
      where.durationMinutes = {}
      if (minDuration !== undefined) where.durationMinutes.gte = minDuration
      if (maxDuration !== undefined) where.durationMinutes.lte = maxDuration
    }

    const [entries, total] = await Promise.all([
      prisma.timeEntry.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { [sortBy]: sortOrder },
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
              address: true,
              latitude: true,
              longitude: true,
              radiusMeters: true
            }
          },
          _count: {
            select: {
              disputes: true
            }
          }
        }
      }),
      prisma.timeEntry.count({ where })
    ])

    // Enrich entries with geofence verification data
    // First, collect all event IDs
    const allEventIds: string[] = []
    const entryEventMap = new Map<string, string[]>()
    
    entries.forEach((entry) => {
      let eventIds: string[] = []
      try {
        const eventsStr = entry.createdFromEvents
        if (eventsStr && typeof eventsStr === 'string') {
          eventIds = JSON.parse(eventsStr)
        } else if (Array.isArray(eventsStr)) {
          eventIds = eventsStr
        }
      } catch {
        // Invalid JSON, treat as empty
      }
      entryEventMap.set(entry.id, eventIds)
      allEventIds.push(...eventIds)
    })

    // Fetch all geofence events in one query
    const geofenceEvents = allEventIds.length > 0
      ? await prisma.geofenceEvent.findMany({
          where: { id: { in: allEventIds } },
          select: { id: true, type: true }
        })
      : []
    
    const eventMap = new Map(geofenceEvents.map(e => [e.id, e.type]))

    // Enrich entries
    const enrichedEntries = entries.map((entry) => {
      const eventIds = entryEventMap.get(entry.id) || []
      const entryEvents = eventIds.map(id => eventMap.get(id)).filter(Boolean) as string[]
      
      const hasGeofenceEvents = entryEvents.length > 0
      const geofenceVerified = entryEvents.length >= 2 && 
        entryEvents.includes('ENTER') && 
        entryEvents.includes('EXIT')
      const isManualEdit = !!entry.modifiedBy

      return {
        ...entry,
        _meta: {
          geofenceVerified,
          hasGeofenceEvents,
          isManualEdit,
          eventCount: eventIds.length
        }
      }
    })

    res.json({
      data: enrichedEntries,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    })
  }
)

// GET /api/time-entries/:id - Get single time entry
router.get(
  '/:id',
  validateParams(timeEntryParamsSchema),
  async (req: Request, res: Response) => {
    const { id } = req.params

    const entry = await prisma.timeEntry.findUnique({
      where: { id },
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
        disputes: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!entry) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Time entry not found'
      })
    }

    res.json({ data: entry })
  }
)

// POST /api/time-entries - Create new time entry
router.post(
  '/',
  validateBody(createTimeEntrySchema),
  async (req: Request, res: Response) => {
    const data = req.body
    const { startAt, endAt, createdFromEvents } = data

    // Convert dates to ISO strings if they're Date objects
    const startAtStr = startAt instanceof Date ? startAt.toISOString() : startAt
    const endAtStr = endAt instanceof Date ? endAt.toISOString() : (endAt || null)
    
    // Convert createdFromEvents array to JSON string
    const eventsStr = Array.isArray(createdFromEvents) 
      ? JSON.stringify(createdFromEvents) 
      : (createdFromEvents || '[]')

    // Calculate duration if endAt is provided
    const durationMinutes = endAtStr
      ? calculateDuration(startAtStr, endAtStr)
      : data.durationMinutes ?? null

    const entry = await prisma.timeEntry.create({
      data: {
        ...data,
        startAt: startAtStr,
        endAt: endAtStr,
        createdFromEvents: eventsStr,
        durationMinutes
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
        }
      }
    })

    res.status(201).json({ data: entry })
  }
)

// PUT /api/time-entries/:id - Update time entry
router.put(
  '/:id',
  requireAuth,
  validateParams(timeEntryParamsSchema),
  validateBody(updateTimeEntrySchema),
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params
    const updateData: any = { ...req.body }

    // Get existing entry to calculate duration if needed
    const existing = await prisma.timeEntry.findUnique({
      where: { id }
    })

    if (!existing) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Time entry not found'
      })
    }

    // Convert dates to ISO strings if provided
    if (updateData.startAt instanceof Date) {
      updateData.startAt = updateData.startAt.toISOString()
    }
    if (updateData.endAt instanceof Date) {
      updateData.endAt = updateData.endAt.toISOString()
    } else if (updateData.endAt === null) {
      updateData.endAt = null
    }

    // Calculate duration if startAt or endAt changed
    const startAt = updateData.startAt ?? existing.startAt
    const endAt = updateData.endAt !== undefined ? updateData.endAt : existing.endAt

    if (updateData.startAt || updateData.endAt !== undefined) {
      updateData.durationMinutes = calculateDuration(startAt as string, endAt as string | null)
    }

    const entry = await prisma.timeEntry.update({
      where: { id },
      data: updateData,
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
        }
      }
    })

    res.json({ data: entry })
  }
)

// DELETE /api/time-entries/:id - Delete time entry
router.delete(
  '/:id',
  validateParams(timeEntryParamsSchema),
  async (req: Request, res: Response) => {
    const { id } = req.params

    await prisma.timeEntry.delete({
      where: { id }
    })

    res.status(204).send()
  }
)

export default router
