/**
 * 批量截图：用于 README 展示 / 改动后的视觉回归
 * 前置：先 npm run dev:h5（默认 5178 端口）
 * 用法：npm run shots
 */
import { execFileSync } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'docs', 'screenshots')
mkdirSync(outDir, { recursive: true })

const base = process.env.BASE_URL ?? 'http://127.0.0.1:5178/'
const seed = join(root, 'scripts', 'fixtures', 'seed.json')

const publicPages = [
  ['home', '#/pages/index/index'],
  ['category', '#/pages/category/category'],
  ['detail', '#/pages/product/detail?id=1'],
  ['login', '#/pages/account/login']
]

const authedPages = [
  ['cart', '#/pages/cart/cart'],
  ['checkout', '#/pages/order/create'],
  ['profile', '#/pages/user/profile'],
  ['order-list', '#/pages/order/list']
]

for (const [name, hash] of publicPages) {
  execFileSync(process.execPath, ['scripts/shot.mjs', base + hash, join(outDir, `${name}.png`), '390', '844'], {
    cwd: root,
    stdio: 'inherit'
  })
}

for (const [name, hash] of authedPages) {
  execFileSync(process.execPath, ['scripts/shot.mjs', base + hash, join(outDir, `${name}.png`), '390', '844'], {
    cwd: root,
    stdio: 'inherit',
    env: { ...process.env, SEED_FILE: seed }
  })
}
