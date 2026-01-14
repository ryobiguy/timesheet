import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const args = process.argv.slice(2)
  
  if (args.length < 2) {
    console.log('Usage: npm run create-assignment <workerEmail> <jobsiteName>')
    console.log('Example: npm run create-assignment worker1@test.com "Downtown Office Building"')
    process.exit(1)
  }

  const [workerEmail, jobsiteName] = args

  const worker = await prisma.user.findUnique({
    where: { email: workerEmail }
  })

  if (!worker) {
    console.error(`❌ Worker not found: ${workerEmail}`)
    process.exit(1)
  }

  const jobsite = await prisma.jobsite.findFirst({
    where: { name: jobsiteName }
  })

  if (!jobsite) {
    console.error(`❌ Jobsite not found: ${jobsiteName}`)
    process.exit(1)
  }

  const assignment = await prisma.assignment.upsert({
    where: {
      workerId_jobsiteId: {
        workerId: worker.id,
        jobsiteId: jobsite.id
      }
    },
    update: {
      scheduleDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    },
    create: {
      workerId: worker.id,
      jobsiteId: jobsite.id,
      scheduleDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    }
  })

  console.log('✅ Assignment created/updated:', {
    worker: worker.name,
    jobsite: jobsite.name,
    assignmentId: assignment.id
  })
}

main()
  .catch((e) => {
    console.error('❌ Failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
