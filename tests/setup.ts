/**
 * Vitest 环境准备：
 * uni-app 的 uni.* API 在 Node 里不存在，这里用一个内存版实现兜底，
 * 让 store / 请求层可以在纯 Node 环境里被测到。
 */
const store = new Map<string, unknown>()

const uniStub = {
  getStorageSync: (key: string) => (store.has(key) ? store.get(key) : ''),
  setStorageSync: (key: string, value: unknown) => {
    store.set(key, value)
  },
  removeStorageSync: (key: string) => {
    store.delete(key)
  },
  showToast: () => undefined,
  showLoading: () => undefined,
  hideLoading: () => undefined,
  showModal: () => undefined,
  navigateTo: () => undefined,
  switchTab: () => undefined,
  request: () => undefined
}

// uni-app 编译期注入的全局对象
;(globalThis as unknown as { uni: typeof uniStub }).uni = uniStub
;(globalThis as unknown as { getCurrentPages: () => unknown[] }).getCurrentPages = () => []

export const resetStorage = () => store.clear()
export const rawStorage = store
