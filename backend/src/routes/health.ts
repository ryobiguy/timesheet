import { Router } from 'express'
import { prisma } from '../lib/prisma'

const router = Router()

router.get('/', async (_req, res) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`
    
    const userCount = await prisma.user.count()
    const jobsiteCount = await prisma.jobsite.count()
    const entryCount = await prisma.timeEntry.count()
    
    const memoryUsage = process.memoryUsage()
    const uptime = process.uptime()
    
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(uptime),
      uptimeFormatted: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`,
      database: 'connected',
      memory: {
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        rss: Math.round(memoryUsage.rss / 1024 / 1024),
      },
      stats: {
        users: userCount,
        jobsites: jobsiteCount,
        timeEntries: entryCount,
      },
    })
  } catch (error) {
    console.error('Health check error:', error)
    res.status(503).json({ 
      status: 'error',
      error: 'Health check failed',
      database: 'disconnected',
      timestamp: new Date().toISOString()
    })
  }
})

export default router
