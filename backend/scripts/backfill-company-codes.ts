import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function backfillCompanyCodes() {
  try {
    console.log('🔍 Checking for organizations without company codes...')
    
    const allOrgs = await prisma.organization.findMany()
    const orgsWithoutCode = allOrgs.filter(org => !org.companyCode)

    if (orgsWithoutCode.length === 0) {
      console.log('✅ All organizations already have company codes')
      return
    }

    console.log(`📝 Found ${orgsWithoutCode.length} organization(s) without company codes`)

    for (const org of orgsWithoutCode) {
      let code: string
      let exists: boolean
      
      do {
        // Generate random 6-digit code (100000-999999)
        code = Math.floor(100000 + Math.random() * 900000).toString()
        const existing = await prisma.organization.findUnique({
          where: { companyCode: code }
        })
        exists = !!existing
      } while (exists)

      await prisma.organization.update({
        where: { id: org.id },
        data: { companyCode: code }
      })

      console.log(`✅ Generated company code ${code} for organization: ${org.name} (${org.id})`)
    }

    console.log('✅ Company code backfill complete')
  } catch (error: any) {
    console.error('❌ Error backfilling company codes:', error.message)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

backfillCompanyCodes()
  .then(() => {
    console.log('✅ Script completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Script failed:', error)
    process.exit(1)
  })
