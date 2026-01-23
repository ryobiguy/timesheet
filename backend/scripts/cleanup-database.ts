import { prisma } from '../src/lib/prisma'

/**
 * WARNING: This script will DELETE ALL DATA from the database!
 * 
 * It will delete:
 * - All organizations
 * - All users (cascades from organizations)
 * - All jobsites (cascades from organizations)
 * - All time entries (cascades from users/jobsites)
 * - All assignments (cascades from users/jobsites)
 * - All geofence events (cascades from users/jobsites)
 * - All disputes (cascades from time entries)
 * - All timesheet summaries (cascades from users/organizations)
 * 
 * This is IRREVERSIBLE!
 */

async function cleanupDatabase() {
  console.log('⚠️  WARNING: This will delete ALL data from the database!')
  console.log('⚠️  This action is IRREVERSIBLE!')
  console.log('')

  try {
    // Count existing data
    const [orgCount, userCount, jobsiteCount, entryCount] = await Promise.all([
      prisma.organization.count(),
      prisma.user.count(),
      prisma.jobsite.count(),
      prisma.timeEntry.count(),
    ])

    console.log('Current database contents:')
    console.log(`  - Organizations: ${orgCount}`)
    console.log(`  - Users: ${userCount}`)
    console.log(`  - Jobsites: ${jobsiteCount}`)
    console.log(`  - Time Entries: ${entryCount}`)
    console.log('')

    if (orgCount === 0) {
      console.log('✅ Database is already empty. Nothing to delete.')
      return
    }

    // Delete all organizations (cascades will delete everything else)
    console.log('🗑️  Deleting all organizations and related data...')
    
    const deleteResult = await prisma.organization.deleteMany({})
    
    console.log(`✅ Deleted ${deleteResult.count} organization(s)`)
    console.log('✅ All related data (users, jobsites, entries, etc.) has been deleted via cascade')
    console.log('')
    console.log('✅ Database cleanup complete!')
    console.log('')
    console.log('You can now start fresh by:')
    console.log('  1. Creating a new company account at /signup')
    console.log('  2. Creating new users through the admin panel')

  } catch (error) {
    console.error('❌ Error during cleanup:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the cleanup
cleanupDatabase()
  .then(() => {
    console.log('✅ Script completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Script failed:', error)
    process.exit(1)
  })
