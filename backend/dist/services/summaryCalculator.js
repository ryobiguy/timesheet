import { prisma } from '../lib/prisma';
const REGULAR_HOURS_PER_WEEK = 40;
const OVERTIME_THRESHOLD = REGULAR_HOURS_PER_WEEK * 60; // in minutes
/**
 * Calculates weekly timesheet summary for a worker
 */
export async function calculateWeeklySummary(workerId, weekStart) {
    // Normalize weekStart to Monday 00:00:00
    const start = new Date(weekStart);
    start.setDate(start.getDate() - start.getDay() + 1);
    start.setHours(0, 0, 0, 0);
    // Calculate week end (Sunday 23:59:59)
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    // Get all approved time entries for this week
    const entries = await prisma.timeEntry.findMany({
        where: {
            workerId,
            status: 'APPROVED',
            startAt: {
                gte: start,
                lte: end
            },
            durationMinutes: {
                not: null
            }
        }
    });
    // Calculate total minutes
    const totalMinutes = entries.reduce((sum, entry) => {
        return sum + (entry.durationMinutes || 0);
    }, 0);
    // Calculate regular and overtime
    const totalRegular = Math.min(totalMinutes, OVERTIME_THRESHOLD);
    const totalOvertime = Math.max(0, totalMinutes - OVERTIME_THRESHOLD);
    // Check if summary already exists
    const existing = await prisma.timesheetSummary.findUnique({
        where: {
            workerId_weekStart: {
                workerId,
                weekStart: start
            }
        }
    });
    if (existing) {
        // Update existing summary
        return prisma.timesheetSummary.update({
            where: { id: existing.id },
            data: {
                totalRegular,
                totalOvertime,
                approvalState: 'PENDING' // Reset to pending if recalculated
            },
            include: {
                worker: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });
    }
    // Get worker's orgId
    const worker = await prisma.user.findUnique({
        where: { id: workerId },
        select: { orgId: true }
    });
    if (!worker) {
        throw new Error('Worker not found');
    }
    // Create new summary
    return prisma.timesheetSummary.create({
        data: {
            workerId,
            weekStart: start,
            totalRegular,
            totalOvertime,
            approvalState: 'PENDING'
        },
        include: {
            worker: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            }
        }
    });
}
