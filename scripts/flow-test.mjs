/**
 * 端到端流程验证：登录 → 加入购物车 → 提交订单 → 订单列表
 * 用法：node scripts/flow-test.mjs [baseUrl]
 */
import { spawn } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const base = process.argv[2] ?? 'http://127.0.0.1:5178/'
const PORT = 9777
const profile = mkdtempSync(join(tmpdir(), 'flow-'))
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const child = spawn(
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  [
    '--headless=new',
    '--disable-gpu',
    `--user-data-dir=${profile}`,
    `--remote-debugging-port=${PORT}`,
    'about:blank'
  ],
  { stdio: 'ignore' }
)

let ws
const logs = []
try {
  // 等待调试端口
  let ready = false
  for (let i = 0; i < 60 && !ready; i++) {
    try {
      ready = (await fetch(`http://127.0.0.1:${PORT}/json/version`)).ok
    } catch {
      await sleep(200)
    }
  }
  if (!ready) throw new Error('浏览器未启动')

  const target = await (await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: 'PUT' })).json()
  ws = new WebSocket(target.webSocketDebuggerUrl)
  await new Promise((res, rej) => {
    ws.onopen = res
    ws.onerror = rej
  })

  let id = 0
  const pending = new Map()
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data)
    if (m.id && pending.has(m.id)) {
      const p = pending.get(m.id)
      pending.delete(m.id)
      m.error ? p.reject(new Error(m.error.message)) : p.resolve(m.result)
    }
    if (m.method === 'Runtime.exceptionThrown') {
      logs.push('EXCEPTION: ' + (m.params.exceptionDetails.exception?.description ?? '').slice(0, 160))
    }
    if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error') {
      logs.push('CONSOLE: ' + m.params.entry.text.slice(0, 160))
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
  await send('Log.enable')
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true })

  const evalJs = async (expr) =>
    (await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true })).result.value

  const text = () => evalJs('document.body.innerText.replace(/\\s+/g," ").slice(0,300)')

  const clickByText = async (label) =>
    evalJs(`(() => {
      const els = [...document.querySelectorAll('view,div,text,button,uni-view,uni-text')]
      const el = els.reverse().find(e => e.textContent.trim() === ${JSON.stringify(label)})
      if (!el) return 'NOT_FOUND'
      el.click()
      return 'CLICKED'
    })()`)

  // 0. 打开首页并注入登录态 + 购物车（模拟"用户已登录且有商品"）
  await send('Page.navigate', { url: base })
  await sleep(3000)
  const seed = JSON.parse(readFileSync(new URL('./fixtures/seed.json', import.meta.url), 'utf8'))
  await evalJs(`
    (() => {
      const set = (k, v) => window.uni ? window.uni.setStorageSync(k, v) : localStorage.setItem(k, JSON.stringify(v))
      set('rf_token', 'mock-token-e2e')
      set('rf_user', ${JSON.stringify(seed.user)})
      set('rf_cart', ${JSON.stringify(seed.cart)})
      return 'SEEDED'
    })()
  `)
  await send('Page.navigate', { url: base + '?e2e=1#/pages/order/create' })
  await sleep(3500)
  console.log('[1] 确认订单页:', (await text()).slice(0, 120))

  // 1. 点提交订单
  console.log('[1.5] 点击提交订单 ->', await clickByText('提交订单'))
  await sleep(4000)
  const afterSubmit = await text()
  console.log('[2] 提交后页面:', afterSubmit.slice(0, 200))

  // 2. 打开订单列表确认有新订单
  await send('Page.navigate', { url: base + '?e2e=2#/pages/order/list' })
  await sleep(3000)
  const orderText = await text()
  console.log('[3] 订单列表:', orderText.slice(0, 260))

  const passed =
    afterSubmit.includes('支付成功') ||
    afterSubmit.includes('待发货') ||
    afterSubmit.includes('我的订单') ||
    orderText.includes('TS')
  console.log('\n结果:', passed ? 'PASS 下单链路可用' : 'FAIL 下单链路中断')
  if (logs.length) console.log('页面错误日志:\n' + logs.slice(0, 8).join('\n'))
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
