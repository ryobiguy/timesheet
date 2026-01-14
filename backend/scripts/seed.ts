import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create test organization
  const org = await prisma.organization.upsert({
    where: { id: 'demo-org' },
    update: {},
    create: {
      id: 'demo-org',
      name: 'Test Construction Co',
      subscriptionTier: 'free'
    }
  })
  console.log('✅ Created organization:', org.id, org.name)

  // Create admin user
  const bcrypt = (await import('bcryptjs')).default
  const adminPassword = await bcrypt.hash('admin123', 10)
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      id: 'admin-user',
      email: 'admin@test.com',
      name: 'Admin User',
      passwordHash: adminPassword,
      role: 'ADMIN',
      orgId: org.id
    }
  })
  console.log('✅ Created admin user:', admin.email, '(password: admin123)')

  // Create supervisor user
  const supervisorPassword = await bcrypt.hash('super123', 10)
  const supervisor = await prisma.user.upsert({
    where: { email: 'supervisor@test.com' },
    update: {},
    create: {
      id: 'supervisor-user',
      email: 'supervisor@test.com',
      name: 'Supervisor User',
      passwordHash: supervisorPassword,
      role: 'SUPERVISOR',
      orgId: org.id
    }
  })
  console.log('✅ Created supervisor user:', supervisor.email, '(password: super123)')

  // Create worker users
  const workerPassword = await bcrypt.hash('worker123', 10)
  const worker1 = await prisma.user.upsert({
    where: { email: 'worker1@test.com' },
    update: {},
    create: {
      id: 'worker1-user',
      email: 'worker1@test.com',
      name: 'John Worker',
      passwordHash: workerPassword,
      role: 'WORKER',
      orgId: org.id
    }
  })
  console.log('✅ Created worker1:', worker1.email, '(password: worker123)')

  const worker2 = await prisma.user.upsert({
    where: { email: 'worker2@test.com' },
    update: {},
    create: {
      id: 'worker2-user',
      email: 'worker2@test.com',
      name: 'Jane Worker',
      passwordHash: workerPassword,
      role: 'WORKER',
      orgId: org.id
    }
  })
  console.log('✅ Created worker2:', worker2.email, '(password: worker123)')

  // Create jobsites
  const jobsite1 = await prisma.jobsite.create({
    data: {
      name: 'Downtown Office Building',
      address: '123 Main St, Downtown, City',
      latitude: 40.7128,
      longitude: -74.0060,
      radiusMeters: 150,
      orgId: org.id
    }
  })
  console.log('✅ Created jobsite:', jobsite1.name)

  const jobsite2 = await prisma.jobsite.create({
    data: {
      name: 'Riverside Construction Site',
      address: '456 River Rd, Riverside, City',
      latitude: 40.7580,
      longitude: -73.9855,
      radiusMeters: 200,
      orgId: org.id
    }
  })
  console.log('✅ Created jobsite:', jobsite2.name)

  // Create assignments
  await prisma.assignment.create({
    data: {
      workerId: worker1.id,
      jobsiteId: jobsite1.id,
      scheduleDays: JSON.stringify(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'])
    }
  })
  console.log('✅ Assigned worker1 to jobsite1')

  await prisma.assignment.create({
    data: {
      workerId: worker1.id,
      jobsiteId: jobsite2.id,
      scheduleDays: JSON.stringify(['Monday', 'Wednesday', 'Friday'])
    }
  })
  console.log('✅ Assigned worker1 to jobsite2')

  await prisma.assignment.create({
    data: {
      workerId: worker2.id,
      jobsiteId: jobsite1.id,
      scheduleDays: JSON.stringify(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'])
    }
  })
  console.log('✅ Assigned worker2 to jobsite1')

  // Create some sample time entries
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  yesterday.setHours(8, 0, 0, 0)

  const yesterdayEnd = new Date(yesterday)
  yesterdayEnd.setHours(17, 0, 0, 0)

  await prisma.timeEntry.create({
    data: {
      workerId: worker1.id,
      jobsiteId: jobsite1.id,
      startAt: yesterday.toISOString(),
      endAt: yesterdayEnd.toISOString(),
      durationMinutes: 540, // 9 hours
      status: 'APPROVED',
      createdFromEvents: JSON.stringify([])
    }
  })
  console.log('✅ Created sample time entry (approved)')

  const today = new Date()
  today.setHours(8, 0, 0, 0)

  await prisma.timeEntry.create({
    data: {
      workerId: worker2.id,
      jobsiteId: jobsite1.id,
      startAt: today.toISOString(),
      endAt: null,
      status: 'PENDING',
      createdFromEvents: JSON.stringify([])
    }
  })
  console.log('✅ Created sample time entry (pending, active)')

  console.log('\n🎉 Seeding completed!')
  console.log('\n📋 Test Credentials:')
  console.log('  Admin: admin@test.com / admin123')
  console.log('  Supervisor: supervisor@test.com / super123')
  console.log('  Worker 1: worker1@test.com / worker123')
  console.log('  Worker 2: worker2@test.com / worker123')
  console.log('\n🏢 Organization ID:', org.id)
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
