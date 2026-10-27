const { execFileSync, spawnSync } = require('node:child_process')
const { existsSync } = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '..')
const sourceExtensions = new Set(['.js', '.jsx', '.ts', '.tsx'])

function gitFiles(args) {
  try {
    return execFileSync('git', args, { cwd: root, encoding: 'utf8' })
      .split('\n')
      .map(file => file.trim())
      .filter(Boolean)
  } catch {
    return []
  }
}

const changedFiles = new Set([
  ...gitFiles(['diff', '--name-only', '--diff-filter=ACMR', 'HEAD']),
  ...gitFiles(['ls-files', '--others', '--exclude-standard']),
])

const sourceFiles = [...changedFiles].filter(file => {
  return sourceExtensions.has(path.extname(file)) && existsSync(path.join(root, file))
})

if (sourceFiles.length === 0) {
  console.log('No changed JavaScript or TypeScript files found; targeted checks skipped.')
  process.exit(0)
}

function run(label, packageName, executablePath, args) {
  console.log(`\n> ${label}`)
  const packageEntry = require.resolve(packageName)
  const packageRoot = path.resolve(path.dirname(packageEntry), '..')
  const executable = path.join(packageRoot, executablePath)
  const result = spawnSync(process.execPath, [executable, ...args], {
    cwd: root,
    stdio: 'inherit',
  })

  if (result.error) {
    console.error(result.error.message)
    process.exit(result.status || 1)
  }

  if (result.status !== 0) process.exit(result.status || 1)
}

run('TypeScript check', 'typescript', 'bin/tsc', ['--noEmit'])
run('ESLint changed files', 'eslint', 'bin/eslint.js', sourceFiles)
run('Jest tests related to changed files', 'jest', 'bin/jest.js', [
  '--findRelatedTests',
  '--passWithNoTests',
  '--runInBand',
  ...sourceFiles,
])
