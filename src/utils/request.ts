import type { ApiResult } from '@/types/api'
import { isMockEnabled, mockRequest } from '@/mock'
import { storage } from './storage'

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

export interface RequestOptions {
  url: string
  method?: HttpMethod
  /** 请求体 */
  data?: Record<string, unknown>
  /** query 参数 */
  params?: Record<string, unknown>
  /** 是否显示全屏 loading */
  loading?: boolean
  /** 是否要求登录（无 token 直接跳登录） */
  auth?: boolean
  /** 失败时是否自动 toast */
  showError?: boolean
}

const BASE_URL = import.meta.env.VITE_API_BASE ?? ''

/** loading 引用计数，避免并发请求互相关闭 */
let loadingCount = 0

function openLoading() {
  if (loadingCount === 0) uni.showLoading({ title: '加载中', mask: true })
  loadingCount += 1
}

function closeLoading() {
  loadingCount = Math.max(0, loadingCount - 1)
  if (loadingCount === 0) uni.hideLoading()
}

function toast(message: string) {
  uni.showToast({ title: message, icon: 'none', duration: 2000 })
}

export function buildQuery(params?: Record<string, unknown>): string {
  if (!params) return ''
  const query = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&')
  return query ? `?${query}` : ''
}

/** 401 统一处理：清登录态 → 跳登录页（带 redirect 回跳） */
let redirecting = false
function handleUnauthorized() {
  if (redirecting) return
  redirecting = true
  storage.clearAuth()
  const pages = getCurrentPages()
  const current = pages[pages.length - 1] as { route?: string } | undefined
  const redirect = current?.route ? encodeURIComponent(`/${current.route}`) : ''
  uni.showToast({ title: '登录已失效，请重新登录', icon: 'none' })
  setTimeout(() => {
    uni.navigateTo({ url: `/pages/account/login${redirect ? `?redirect=${redirect}` : ''}` })
    redirecting = false
  }, 300)
}

/**
 * 统一请求入口：
 * - 未配置 VITE_API_BASE 时走本地 Mock（handler 表按 url 匹配）
 * - 配置后走真实 uni.request，请求/响应拦截逻辑与后端 Result 结构对齐
 */
export async function request<T>(options: RequestOptions): Promise<T> {
  const {
    url,
    method = 'GET',
    data,
    params,
    loading = false,
    auth = false,
    showError = true
  } = options
  const token = storage.getToken()

  if (auth && !token) {
    handleUnauthorized()
    return Promise.reject(new Error('UNAUTHORIZED'))
  }

  if (loading) openLoading()

  try {
    const fullUrl = url + buildQuery(params)

    // ---------- Mock 分支 ----------
    if (isMockEnabled()) {
      const res = await mockRequest<T>({ url: fullUrl, method, data, token })
      if (res.code === 401) {
        handleUnauthorized()
        throw new Error(res.message)
      }
      if (res.code !== 200) {
        if (showError) toast(res.message || '请求失败')
        throw new Error(res.message || 'REQUEST_FAILED')
      }
      return res.data
    }

    // ---------- 真实请求分支 ----------
    const res = await new Promise<{ data: ApiResult<T>; statusCode: number }>((resolve, reject) => {
      uni.request({
        url: BASE_URL + fullUrl,
        method,
        data: data as UniApp.RequestOptions['data'],
        timeout: 15000,
        header: {
          'Content-Type': 'application/json',
          ...(token ? { 'x-api-key': token } : {})
        },
        success: (resp) =>
          resolve({ data: resp.data as ApiResult<T>, statusCode: resp.statusCode }),
        fail: (err) => reject(err)
      })
    })

    const body = res.data
    if (body.code === 401) {
      handleUnauthorized()
      throw new Error('UNAUTHORIZED')
    }
    if (body.code !== 200) {
      if (showError) toast(body.message || '请求失败')
      throw new Error(body.message || 'REQUEST_FAILED')
    }
    return body.data
  } catch (error) {
    const message = (error as Error)?.message ?? ''
    if (showError && message && !['UNAUTHORIZED', 'REQUEST_FAILED'].includes(message)) {
      toast(message)
    }
    throw error
  } finally {
    if (loading) closeLoading()
  }
}

export const http = {
  get<T>(url: string, params?: Record<string, unknown>, options?: Partial<RequestOptions>) {
    return request<T>({ url, params, ...options, method: 'GET' })
  },
  post<T>(url: string, data?: Record<string, unknown>, options?: Partial<RequestOptions>) {
    return request<T>({ url, data, ...options, method: 'POST' })
  },
  put<T>(url: string, data?: Record<string, unknown>, options?: Partial<RequestOptions>) {
    return request<T>({ url, data, ...options, method: 'PUT' })
  },
  delete<T>(url: string, data?: Record<string, unknown>, options?: Partial<RequestOptions>) {
    return request<T>({ url, data, ...options, method: 'DELETE' })
  }
}
