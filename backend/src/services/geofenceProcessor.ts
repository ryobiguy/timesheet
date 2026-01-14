import { prisma } from '../lib/prisma'

/**
 * Processes a geofence event and creates/updates time entries automatically
 */
export async function processGeofenceEvent(eventId: string): Promise<void> {
  const event = await prisma.geofenceEvent.findUnique({
    where: { id: eventId },
    include: {
      worker: true,
      jobsite: true
    }
  })

  if (!event) {
    throw new Error(`Geofence event ${eventId} not found`)
  }

  if (event.type === 'ENTER') {
    // Check if there's an open time entry for this worker/jobsite
    const openEntry = await prisma.timeEntry.findFirst({
      where: {
        workerId: event.workerId,
        jobsiteId: event.jobsiteId,
        endAt: null
      }
    })

    // If there's already an open entry, don't create a new one
    if (openEntry) {
      return
    }

    // Create a new time entry starting now
    // Convert timestamp to ISO string if it's a Date
    const timestampStr = event.timestamp instanceof Date 
      ? event.timestamp.toISOString() 
      : event.timestamp
    
    await prisma.timeEntry.create({
      data: {
        workerId: event.workerId,
        jobsiteId: event.jobsiteId,
        startAt: timestampStr,
        endAt: null,
        status: 'PENDING',
        createdFromEvents: JSON.stringify([event.id])
      }
    })
  } else if (event.type === 'EXIT') {
    // Find the most recent open time entry for this worker/jobsite
    const openEntry = await prisma.timeEntry.findFirst({
      where: {
        workerId: event.workerId,
        jobsiteId: event.jobsiteId,
        endAt: null
      },
      orderBy: { startAt: 'desc' }
    })

    if (openEntry) {
      // Convert timestamp to ISO string
      const timestampStr = event.timestamp instanceof Date 
        ? event.timestamp.toISOString() 
        : event.timestamp
      
      // Parse existing events array (stored as JSON string)
      const existingEvents = openEntry.createdFromEvents 
        ? (typeof openEntry.createdFromEvents === 'string' 
            ? JSON.parse(openEntry.createdFromEvents) 
            : openEntry.createdFromEvents)
        : []
      
      // Calculate duration (both are ISO strings now)
      const startDate = new Date(openEntry.startAt)
      const endDate = new Date(timestampStr)
      const durationMinutes = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60))

      // Update the entry with end time and duration
      await prisma.timeEntry.update({
        where: { id: openEntry.id },
        data: {
          endAt: timestampStr,
          durationMinutes,
          createdFromEvents: JSON.stringify([...existingEvents, event.id])
        }
      })
    }
    // If no open entry found, the exit event is ignored (orphaned exit)
  }
}
