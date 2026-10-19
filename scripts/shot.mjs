/**
 * 移动端截图脚本（CDP 设备模拟）
 *
 * 为什么不用 --screenshot 参数：
 * headless Edge/Chrome 有 500px 最小窗口宽度，直接 --window-size=390 时
 * 页面仍按 500px 布局再被裁掉右侧，会产生"右侧被切"的假象。
 * 这里用 CDP 的 Emulation.setDeviceMetricsOverride 做真实移动端布局。
 *
 * 用法：node scripts/shot.mjs <url> <out.png> [width] [height]
 */
import { spawn } from 'node:child_process'
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const [, , url, out, w = '390', h = '844'] = process.argv
if (!url || !out) {
  console.error('usage: node scripts/shot.mjs <url> <out.png> [width] [height]')
  process.exit(1)
}

const PORT = 9333 + Math.floor(Math.random() * 200)
const profile = mkdtempSync(join(tmpdir(), 'shot-'))
const candidates = [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe'
]

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function waitFor(fn, timeout = 15000) {
  const start = Date.now()
  while (Date.now() - start < timeout) {
    try {
      const result = await fn()
      if (result) return result
    } catch {
      /* retry */
    }
    await sleep(200)
  }
  throw new Error('timeout')
}

const browserPath = process.env.BROWSER_PATH ?? candidates[0]
const child = spawn(
  browserPath,
  [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--no-first-run',
    '--no-default-browser-check',
    `--user-data-dir=${profile}`,
    `--remote-debugging-port=${PORT}`,
    'about:blank'
  ],
  { stdio: 'ignore' }
)

let ws
try {
  await waitFor(async () => (await fetch(`http://127.0.0.1:${PORT}/json/version`)).ok)
  const target = await (
    await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: 'PUT' })
  ).json()

  ws = new WebSocket(target.webSocketDebuggerUrl)
  await new Promise((resolve, reject) => {
    ws.onopen = resolve
    ws.onerror = reject
  })

  let id = 0
  const pending = new Map()
  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data)
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id)
      pending.delete(msg.id)
      msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result)
    }
  }
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const mid = ++id
      pending.set(mid, { resolve, reject })
      ws.send(JSON.stringify({ id: mid, method, params }))
    })

  await send('Page.enable')
  await send('Runtime.enable')
  await send('Emulation.setDeviceMetricsOverride', {
    width: Number(w),
    height: Number(h),
    deviceScaleFactor: 2,
    mobile: true
  })
  await send('Emulation.setUserAgentOverride', {
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
  })

  // 可选：从种子文件预置登录态 / 购物车，用于截取需要登录的页面
  if (process.env.SEED_FILE) {
    const { readFileSync } = await import('node:fs')
    const seed = JSON.parse(readFileSync(process.env.SEED_FILE, 'utf8'))
    const origin = new URL(url).origin
    await send('Page.navigate', { url: origin })
    await sleep(2500)

    // 优先走 uni.setStorageSync：H5 端 uni 存储有自己的序列化/前缀规则，
    // 直接写 localStorage 未必能被 uni.getStorageSync 读到。
    const script = `
      (() => {
        const set = (k, v) => {
          if (window.uni && window.uni.setStorageSync) window.uni.setStorageSync(k, v)
          else localStorage.setItem(k, JSON.stringify(v))
        }
        ${seed.user ? `set('rf_token', 'mock-token-seed'); set('rf_user', ${JSON.stringify(seed.user)});` : ''}
        ${seed.cart ? `set('rf_cart', ${JSON.stringify(seed.cart)});` : ''}
        const uniRead = window.uni ? window.uni.getStorageSync('rf_token') : null
        return JSON.stringify({
          hasUni: Boolean(window.uni),
          token: uniRead,
          cartCount: window.uni ? (window.uni.getStorageSync('rf_cart') || []).length : 0
        })
      })()
    `
    const res = await send('Runtime.evaluate', { expression: script, returnByValue: true })
    console.log('seed result:', res.result?.value ?? JSON.stringify(res.exceptionDetails ?? {}))
  }

  // 种子写完后必须整页重载，否则改 hash 属于同文档跳转，App 不会重新 onLaunch
  if (process.env.SEED_FILE) {
    const u = new URL(url)
    u.searchParams.set('t', String(Date.now()))
    await send('Page.navigate', { url: u.toString() })
  } else {
    await send('Page.navigate', { url })
  }
  await sleep(3500)

  // 收集运行时错误，便于回归时发现白屏/报错
  const errors = []
  ws.addEventListener('message', (event) => {
    const msg = JSON.parse(event.data)
    if (msg.method === 'Runtime.exceptionThrown') {
      errors.push(msg.params.exceptionDetails.exception?.description ?? 'unknown error')
    }
  })
  await sleep(1200)

  const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false })
  writeFileSync(out, Buffer.from(shot.data, 'base64'))

  if (process.env.DIAG) {
    const diag = await send('Runtime.evaluate', {
      returnByValue: true,
      expression: `JSON.stringify({
        href: location.href,
        token: window.uni ? window.uni.getStorageSync('rf_token') : 'no-uni',
        cart: window.uni ? (window.uni.getStorageSync('rf_cart') || []).length : 'no-uni',
        text: document.body.innerText.replace(/\\s+/g, ' ').slice(0, 160)
      })`
    })
    console.log('diag:', diag.result?.value)
  }

  console.log(
    `saved ${out} (${w}x${h}@2x)` + (errors.length ? `\nruntime errors:\n${errors.join('\n')}` : '')
  )
} finally {
  try {
    ws?.close()
  } catch {}
  child.kill()
  await sleep(300)
  try {
    rmSync(profile, { recursive: true, force: true })
  } catch {}
}
