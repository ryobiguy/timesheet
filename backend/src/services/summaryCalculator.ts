import { prisma } from '../lib/prisma'

const REGULAR_HOURS_PER_WEEK = 40
const OVERTIME_THRESHOLD = REGULAR_HOURS_PER_WEEK * 60 // in minutes

/**
 * Calculates weekly timesheet summary for a worker
 */
export async function calculateWeeklySummary(
  workerId: string,
  weekStart: Date | string
): Promise<any> {
  // Normalize weekStart to Monday 00:00:00
  const weekStartDate = weekStart instanceof Date ? weekStart : new Date(weekStart)
  const start = new Date(weekStartDate)
  start.setDate(start.getDate() - start.getDay() + 1)
  start.setHours(0, 0, 0, 0)

  // Calculate week end (Sunday 23:59:59)
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  end.setHours(23, 59, 59, 999)

  const startStr = start.toISOString()
  const endStr = end.toISOString()

  // Get all approved time entries for this week
  const entries = await prisma.timeEntry.findMany({
    where: {
      workerId,
      status: 'APPROVED',
      startAt: {
        gte: startStr,
        lte: endStr
      },
      durationMinutes: {
        not: null
      }
    }
  })

  // Calculate total minutes
  const totalMinutes = entries.reduce((sum: number, entry: any) => {
    return sum + (entry.durationMinutes || 0)
  }, 0)

  // Calculate regular and overtime
  const totalRegular = Math.min(totalMinutes, OVERTIME_THRESHOLD)
  const totalOvertime = Math.max(0, totalMinutes - OVERTIME_THRESHOLD)

  // Check if summary already exists (weekStart is stored as ISO string)
  const existing = await prisma.timesheetSummary.findUnique({
    where: {
      workerId_weekStart: {
        workerId,
        weekStart: startStr
      }
    }
  })

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
    })
  }

  // Get worker's orgId
  const worker = await prisma.user.findUnique({
    where: { id: workerId },
    select: { orgId: true }
  })

  if (!worker) {
    throw new Error('Worker not found')
  }

  // Create new summary
  return prisma.timesheetSummary.create({
    data: {
      workerId,
      weekStart: startStr,
      totalRegular,
      totalOvertime,
      approvalState: 'PENDING',
      orgId: worker.orgId
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
  })
}
