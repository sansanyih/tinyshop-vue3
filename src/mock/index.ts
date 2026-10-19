import type { ApiResult } from '@/types/api'
import type { Address, Order, OrderItem, Product, UserProfile } from '@/types/model'
import { banners, categories, mockAddresses, mockOrders, notices, products } from './data'

export interface MockContext {
  url: string
  method: string
  data?: Record<string, any>
  token: string
}

interface RouteContext extends MockContext {
  query: Record<string, string>
  body: Record<string, any>
}

type Handler = (ctx: RouteContext) => ApiResult<any> | Promise<ApiResult<any>>

/** 未配置 VITE_API_BASE 时启用本地 Mock，便于无后端演示 */
export function isMockEnabled(): boolean {
  return !import.meta.env.VITE_API_BASE
}

/**
 * Mock 订单持久化到本地存储：
 * 纯内存时整页刷新会丢数据，演示时容易被误判成 bug。
 */
const MOCK_ORDERS_KEY = 'rf_mock_orders'

function loadMockOrders() {
  try {
    const cached = uni.getStorageSync(MOCK_ORDERS_KEY)
    if (Array.isArray(cached) && cached.length) {
      mockOrders.length = 0
      mockOrders.push(...cached)
    }
  } catch {
    /* 存储不可用时退回纯内存 */
  }
}

function saveMockOrders() {
  try {
    uni.setStorageSync(MOCK_ORDERS_KEY, mockOrders)
  } catch {
    /* ignore */
  }
}

loadMockOrders()

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
const randomDelay = () => delay(120 + Math.floor(Math.random() * 180))

const ok = <T>(data: T): ApiResult<T> => ({ code: 200, message: 'ok', data })
const fail = (code: number, message: string): ApiResult<null> => ({ code, message, data: null })

const TOKEN_PREFIX = 'mock-token-'

export const mockProfile: UserProfile = {
  id: 10086,
  nickname: '申思宇',
  avatar: '/static/goods/g01.jpg',
  mobile: '13662659069',
  level: 'VIP2',
  points: 1680,
  balance: 288.5,
  couponCount: 3
}

function parseQuery(search: string): Record<string, string> {
  const result: Record<string, string> = {}
  if (!search) return result
  for (const pair of search.split('&')) {
    const [key, value = ''] = pair.split('=')
    result[decodeURIComponent(key)] = decodeURIComponent(value)
  }
  return result
}

function paginate<T>(list: T[], page: number, pageSize: number) {
  const start = (page - 1) * pageSize
  return { list: list.slice(start, start + pageSize), total: list.length, page, pageSize }
}

function requireLogin(ctx: RouteContext) {
  if (!ctx.token || !ctx.token.startsWith(TOKEN_PREFIX)) {
    return fail(401, '请先登录')
  }
  return null
}

const routes: Record<string, Handler> = {
  // ---------- 公共 ----------
  'GET /tiny-shop/v1/common/adv/index': () => ok({ list: banners }),
  'GET /tiny-shop/v1/common/notify-announce/index': () => ok({ list: notices }),
  'GET /tiny-shop/v1/product/category/index': () => ok({ list: categories }),

  // ---------- 商品 ----------
  'GET /tiny-shop/v1/product/index': (ctx) => {
    const keyword = ctx.query.keyword?.trim()
    const categoryId = Number(ctx.query.category_id || 0)
    const page = Number(ctx.query.page || 1)
    const pageSize = Number(ctx.query.page_size || 10)

    let list = products
    if (categoryId) {
      // 二级分类 id 为 101 这类，一级分类 id 为 1 这类
      list = list.filter((item) =>
        categoryId < 100 ? Math.floor(item.categoryId / 100) === categoryId : item.categoryId === categoryId
      )
    }
    if (keyword) {
      const lower = keyword.toLowerCase()
      list = list.filter((item) => item.title.toLowerCase().includes(lower) || item.subtitle.includes(keyword))
    }
    return ok(paginate(list, page, pageSize))
  },

  'GET /tiny-shop/v1/product/view': (ctx) => {
    const id = Number(ctx.query.id)
    const product = products.find((item) => item.id === id)
    return product ? ok(product as Product) : fail(404, '商品不存在')
  },

  // ---------- 用户 ----------
  'POST /tiny-shop/v1/user/login': (ctx) => {
    const mobile = String(ctx.body.mobile || '')
    const code = String(ctx.body.code || '')
    if (!/^1\d{10}$/.test(mobile)) return fail(400, '手机号格式不正确')
    if (code !== '123456') return fail(400, '验证码错误（演示码 123456）')
    return ok({
      token: `${TOKEN_PREFIX}${Date.now()}`,
      profile: { ...mockProfile, mobile }
    })
  },

  'GET /tiny-shop/v1/user/info': (ctx) => {
    const unauthorized = requireLogin(ctx)
    if (unauthorized) return unauthorized
    return ok(mockProfile)
  },

  'GET /tiny-shop/v1/member/address/index': (ctx) => {
    const unauthorized = requireLogin(ctx)
    if (unauthorized) return unauthorized
    return ok({ list: mockAddresses })
  },

  'POST /tiny-shop/v1/member/address/create': (ctx) => {
    const unauthorized = requireLogin(ctx)
    if (unauthorized) return unauthorized
    const address: Address = {
      id: Date.now(),
      name: String(ctx.body.name || ''),
      mobile: String(ctx.body.mobile || ''),
      region: String(ctx.body.region || ''),
      detail: String(ctx.body.detail || ''),
      isDefault: mockAddresses.length === 0
    }
    mockAddresses.push(address)
    return ok(address)
  },

  // ---------- 订单 ----------
  'GET /tiny-shop/v1/order/index': (ctx) => {
    const unauthorized = requireLogin(ctx)
    if (unauthorized) return unauthorized
    const status = ctx.query.status
    const page = Number(ctx.query.page || 1)
    const pageSize = Number(ctx.query.page_size || 10)
    const list = status ? mockOrders.filter((order) => order.status === status) : mockOrders
    return ok(paginate([...list].reverse(), page, pageSize))
  },

  'POST /tiny-shop/v1/order/create': (ctx) => {
    const unauthorized = requireLogin(ctx)
    if (unauthorized) return unauthorized
    const items = (ctx.body.items || []) as OrderItem[]
    if (!items.length) return fail(400, '订单商品不能为空')
    const totalAmount = items.reduce((sum, item) => sum + item.price * item.qty, 0)
    const order: Order = {
      id: Date.now(),
      orderNo: `TS${Date.now()}${Math.floor(Math.random() * 900 + 100)}`,
      status: 'unpaid',
      items,
      totalAmount,
      payAmount: Math.max(0, totalAmount - 10),
      address: mockAddresses.find((item) => item.isDefault) ?? mockAddresses[0],
      createdAt: new Date().toISOString(),
      remark: String(ctx.body.remark || '')
    }
    mockOrders.push(order)
    saveMockOrders()
    return ok(order)
  },

  'POST /tiny-shop/v1/order/pay': (ctx) => {
    const unauthorized = requireLogin(ctx)
    if (unauthorized) return unauthorized
    const order = mockOrders.find((item) => item.id === Number(ctx.body.id))
    if (!order) return fail(404, '订单不存在')
    order.status = 'shipping'
    saveMockOrders()
    return ok(order)
  }
}

export async function mockRequest<T>(ctx: MockContext): Promise<ApiResult<T>> {
  await randomDelay()
  const [path, search = ''] = ctx.url.split('?')
  const key = `${ctx.method.toUpperCase()} ${path}`
  const handler = routes[key]
  if (!handler) {
    return { code: 404, message: `Mock 未实现：${key}`, data: null as T }
  }
  const routeCtx: RouteContext = {
    ...ctx,
    query: parseQuery(search),
    body: ctx.data ?? {}
  }
  return (await handler(routeCtx)) as ApiResult<T>
}
