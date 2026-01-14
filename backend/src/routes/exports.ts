import { Router, type Request, type Response } from 'express'
import { prisma } from '../lib/prisma'
import { requireAuth, requireRole, type AuthRequest } from '../middleware/auth'
import { z } from 'zod'
import PDFDocument from 'pdfkit'

const router = Router()

const exportQuerySchema = z.object({
  workerId: z.string().cuid().optional(),
  jobsiteId: z.string().cuid().optional(),
  startDate: z.union([z.coerce.date(), z.string()]).optional().transform((val) => val instanceof Date ? val.toISOString() : val),
  endDate: z.union([z.coerce.date(), z.string()]).optional().transform((val) => val instanceof Date ? val.toISOString() : val),
  status: z.enum(['PENDING', 'APPROVED', 'DISPUTED']).optional(),
  format: z.enum(['csv', 'pdf']).default('csv')
})

// GET /api/exports/time-entries - Export time entries
router.get(
  '/time-entries',
  requireAuth,
  requireRole('ADMIN', 'SUPERVISOR'),
  async (req: Request, res: Response) => {
    const query = exportQuerySchema.safeParse(req.query)
    
    if (!query.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: query.error.errors
      })
    }

    const { workerId, jobsiteId, startDate, endDate, status, format } = query.data

    const where: any = {}
    if (workerId) where.workerId = workerId
    if (jobsiteId) where.jobsiteId = jobsiteId
    if (status) where.status = status
    if (startDate || endDate) {
      where.startAt = {}
      // Dates are already ISO strings from the transform
      if (startDate) where.startAt.gte = startDate
      if (endDate) where.startAt.lte = endDate
    }

    const entries = await prisma.timeEntry.findMany({
      where,
      include: {
        worker: {
          select: {
            name: true,
            email: true
          }
        },
        jobsite: {
          select: {
            name: true,
            address: true
          }
        }
      },
      orderBy: { startAt: 'desc' }
    })

    if (format === 'csv') {
      // Generate CSV
      const headers = ['Worker Name', 'Worker Email', 'Jobsite', 'Start Time', 'End Time', 'Duration (minutes)', 'Status']
      const rows = entries.map((entry: any) => [
        entry.worker?.name || '',
        entry.worker?.email || '',
        entry.jobsite?.name || '',
        entry.startAt instanceof Date ? entry.startAt.toISOString() : entry.startAt,
        entry.endAt ? (entry.endAt instanceof Date ? entry.endAt.toISOString() : entry.endAt) : '',
        entry.durationMinutes?.toString() || '',
        entry.status
      ])

      const csv = [
        headers.join(','),
        ...rows.map((row: any) => row.map((cell: any) => `"${cell}"`).join(','))
      ].join('\n')

      res.setHeader('Content-Type', 'text/csv')
      res.setHeader('Content-Disposition', `attachment; filename="time-entries-${Date.now()}.csv"`)
      res.send(csv)
    } else {
      // Generate PDF
      const doc = new PDFDocument({ margin: 50 })
      
      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', `attachment; filename="time-entries-${Date.now()}.pdf"`)
      
      doc.pipe(res)

      // Header
      doc.fontSize(20).text('Time Entries Report', { align: 'center' })
      doc.moveDown()
      doc.fontSize(12).text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' })
      doc.moveDown(2)

      // Table header
      const tableTop = doc.y
      const rowHeight = 20
      const pageWidth = doc.page.width - 100
      const colWidths = {
        worker: pageWidth * 0.25,
        jobsite: pageWidth * 0.25,
        start: pageWidth * 0.2,
        end: pageWidth * 0.15,
        duration: pageWidth * 0.1,
        status: pageWidth * 0.15
      }

      // Header row
      doc.fontSize(10).font('Helvetica-Bold')
      doc.text('Worker', 50, tableTop)
      doc.text('Jobsite', 50 + colWidths.worker, tableTop)
      doc.text('Start Time', 50 + colWidths.worker + colWidths.jobsite, tableTop)
      doc.text('End Time', 50 + colWidths.worker + colWidths.jobsite + colWidths.start, tableTop)
      doc.text('Duration', 50 + colWidths.worker + colWidths.jobsite + colWidths.start + colWidths.end, tableTop)
      doc.text('Status', 50 + colWidths.worker + colWidths.jobsite + colWidths.start + colWidths.end + colWidths.duration, tableTop)
      
      doc.moveTo(50, tableTop + rowHeight)
        .lineTo(pageWidth + 50, tableTop + rowHeight)
        .stroke()

      // Data rows
      let y = tableTop + rowHeight + 5
      doc.font('Helvetica').fontSize(9)

      entries.forEach((entry: any, index: number) => {
        // Check if we need a new page
        if (y > doc.page.height - 100) {
          doc.addPage()
          y = 50
        }

        const startTime = entry.startAt instanceof Date 
          ? entry.startAt.toLocaleString() 
          : new Date(entry.startAt).toLocaleString()
        const endTime = entry.endAt 
          ? (entry.endAt instanceof Date ? entry.endAt.toLocaleString() : new Date(entry.endAt).toLocaleString())
          : 'N/A'
        const duration = entry.durationMinutes 
          ? `${Math.floor(entry.durationMinutes / 60)}h ${entry.durationMinutes % 60}m`
          : 'N/A'

        doc.text(entry.worker?.name || 'Unknown', 50, y, { width: colWidths.worker })
        doc.text(entry.jobsite?.name || 'Unknown', 50 + colWidths.worker, y, { width: colWidths.jobsite })
        doc.text(startTime, 50 + colWidths.worker + colWidths.jobsite, y, { width: colWidths.start })
        doc.text(endTime, 50 + colWidths.worker + colWidths.jobsite + colWidths.start, y, { width: colWidths.end })
        doc.text(duration, 50 + colWidths.worker + colWidths.jobsite + colWidths.start + colWidths.end, y, { width: colWidths.duration })
        doc.text(entry.status, 50 + colWidths.worker + colWidths.jobsite + colWidths.start + colWidths.end + colWidths.duration, y, { width: colWidths.status })

        y += rowHeight

        // Add separator line every 5 rows
        if ((index + 1) % 5 === 0) {
          doc.moveTo(50, y)
            .lineTo(pageWidth + 50, y)
            .stroke()
          y += 5
        }
      })

      // Summary
      doc.addPage()
      doc.fontSize(16).text('Summary', { align: 'center' })
      doc.moveDown()
      
      const totalMinutes = entries.reduce((sum: number, entry: any) => {
        return sum + (entry.durationMinutes || 0)
      }, 0)
      const totalHours = (totalMinutes / 60).toFixed(2)
      
      const byStatus = entries.reduce((acc: any, entry: any) => {
        acc[entry.status] = (acc[entry.status] || 0) + 1
        return acc
      }, {})

      doc.fontSize(12)
      doc.text(`Total Entries: ${entries.length}`)
      doc.text(`Total Hours: ${totalHours}`)
      doc.moveDown()
      doc.text('By Status:')
      Object.entries(byStatus).forEach(([status, count]) => {
        doc.text(`  ${status}: ${count}`)
      })

      doc.end()
    }
  }
)

export default router
