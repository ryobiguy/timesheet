// Manual Prisma client generation workaround
import { execSync } from 'child_process'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const backendDir = join(__dirname, '..')

process.chdir(backendDir)

try {
  console.log('Attempting to generate Prisma client...')
  
  // Try using the local prisma installation
  const prismaPath = join(backendDir, 'node_modules', 'prisma', 'build', 'index.js')
  
  execSync(`node "${prismaPath}" generate`, {
    stdio: 'inherit',
    env: {
      ...process.env,
      PRISMA_GENERATE_SKIP_AUTOINSTALL: 'false'
    }
  })
  
  console.log('✅ Prisma client generated successfully!')
} catch (error) {
  console.error('❌ Generation failed:', error.message)
  console.log('\n💡 Try running: npm install @prisma/client@5.10.2 --force')
  process.exit(1)
}
