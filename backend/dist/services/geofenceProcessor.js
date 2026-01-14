import { prisma } from '../lib/prisma';
/**
 * Processes a geofence event and creates/updates time entries automatically
 */
export async function processGeofenceEvent(eventId) {
    const event = await prisma.geofenceEvent.findUnique({
        where: { id: eventId },
        include: {
            worker: true,
            jobsite: true
        }
    });
    if (!event) {
        throw new Error(`Geofence event ${eventId} not found`);
    }
    if (event.type === 'ENTER') {
        // Check if there's an open time entry for this worker/jobsite
        const openEntry = await prisma.timeEntry.findFirst({
            where: {
                workerId: event.workerId,
                jobsiteId: event.jobsiteId,
                endAt: null
            }
        });
        // If there's already an open entry, don't create a new one
        if (openEntry) {
            return;
        }
        // Create a new time entry starting now
        await prisma.timeEntry.create({
            data: {
                workerId: event.workerId,
                jobsiteId: event.jobsiteId,
                startAt: event.timestamp,
                endAt: null,
                status: 'PENDING',
                createdFromEvents: [event.id]
            }
        });
    }
    else if (event.type === 'EXIT') {
        // Find the most recent open time entry for this worker/jobsite
        const openEntry = await prisma.timeEntry.findFirst({
            where: {
                workerId: event.workerId,
                jobsiteId: event.jobsiteId,
                endAt: null
            },
            orderBy: { startAt: 'desc' }
        });
        if (openEntry) {
            // Calculate duration
            const durationMinutes = Math.floor((event.timestamp.getTime() - openEntry.startAt.getTime()) / (1000 * 60));
            // Update the entry with end time and duration
            await prisma.timeEntry.update({
                where: { id: openEntry.id },
                data: {
                    endAt: event.timestamp,
                    durationMinutes,
                    createdFromEvents: [...openEntry.createdFromEvents, event.id]
                }
            });
        }
        // If no open entry found, the exit event is ignored (orphaned exit)
    }
}
