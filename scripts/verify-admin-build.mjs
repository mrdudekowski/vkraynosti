import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { access } from 'node:fs/promises'

const root = process.cwd()
const distDir = path.join(root, 'dist-admin')
const htmlPath = path.join(distDir, 'index.html')

await access(htmlPath)
const html = await readFile(htmlPath, 'utf8')
const references = [...html.matchAll(/(?:src|href)="(\/assets\/[^"?#]+)/g)].map((match) => match[1])

if (references.length === 0) {
  throw new Error('Admin build has no local asset references')
}

for (const reference of references) {
  await access(path.join(distDir, reference.slice(1)))
}

if (!html.includes('Админка Вкрайности')) {
  throw new Error('Admin title is missing from dist-admin/index.html')
}

console.log(`Admin build verified: index.html + ${references.length} local assets`)
