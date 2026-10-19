const TOKEN_KEY = 'rf_token'
const USER_KEY = 'rf_user'
const CART_KEY = 'rf_cart'

export const storage = {
  getToken(): string {
    return (uni.getStorageSync(TOKEN_KEY) as string) || ''
  },
  setToken(token: string) {
    if (token) uni.setStorageSync(TOKEN_KEY, token)
    else uni.removeStorageSync(TOKEN_KEY)
  },
  getUser<T>(): T | null {
    const raw = uni.getStorageSync(USER_KEY)
    if (!raw) return null
    try {
      return typeof raw === 'string' ? (JSON.parse(raw) as T) : (raw as T)
    } catch {
      return null
    }
  },
  setUser(value: unknown) {
    if (value) uni.setStorageSync(USER_KEY, JSON.stringify(value))
    else uni.removeStorageSync(USER_KEY)
  },
  getCart<T>(): T | null {
    const raw = uni.getStorageSync(CART_KEY)
    if (!raw) return null
    try {
      return typeof raw === 'string' ? (JSON.parse(raw) as T) : (raw as T)
    } catch {
      return null
    }
  },
  setCart(value: unknown) {
    uni.setStorageSync(CART_KEY, JSON.stringify(value))
  },
  clearAuth() {
    uni.removeStorageSync(TOKEN_KEY)
    uni.removeStorageSync(USER_KEY)
  }
}

export const TOKEN_STORAGE_KEY = TOKEN_KEY
