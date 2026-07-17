import { cpSync, mkdirSync, readdirSync, rmSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const appDir = join(scriptDir, '..')
const repoRoot = join(appDir, '..')
const distDir = join(appDir, 'dist')

const ROOT_ARTIFACTS = ['index.html', 'assets', 'data', '.nojekyll']

function removeRootArtifacts() {
  for (const name of ROOT_ARTIFACTS) {
    rmSync(join(repoRoot, name), { recursive: true, force: true })
  }
}

function copyDir(src, dest) {
  mkdirSync(dest, { recursive: true })
  for (const entry of readdirSync(src)) {
    const srcPath = join(src, entry)
    const destPath = join(dest, entry)
    if (statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath)
    } else {
      cpSync(srcPath, destPath)
    }
  }
}

removeRootArtifacts()
copyDir(distDir, repoRoot)

console.log('Deployed build to repo root')
