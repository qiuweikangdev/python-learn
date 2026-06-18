import { build } from 'vitepress'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
process.chdir(__dirname)

console.log('Starting VitePress build...')
console.log('Working directory:', process.cwd())

try {
  await build(resolve(__dirname, 'docs'))
  console.log('Build completed successfully!')
} catch (e) {
  console.error('Build failed:', e)
  process.exit(1)
}
