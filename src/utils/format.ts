/** 价格：分 → 元（保留两位小数），Mock 里直接用元，这里做统一展示 */
export function formatPrice(value: number | string): string {
  const num = typeof value === 'string' ? Number(value) : value
  if (!Number.isFinite(num)) return '0.00'
  return num.toFixed(2)
}

/** 千分位 */
export function formatNumber(value: number): string {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/** 销量：超过 1 万显示 w */
export function formatSales(value: number): string {
  if (value >= 10000) return `${(value / 10000).toFixed(1)}w`
  return String(value)
}

/** 日期格式化 */
export function formatDate(input: string | number | Date, pattern = 'YYYY-MM-DD HH:mm'): string {
  const date = input instanceof Date ? input : new Date(input)
  if (Number.isNaN(date.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  const map: Record<string, string> = {
    YYYY: String(date.getFullYear()),
    MM: pad(date.getMonth() + 1),
    DD: pad(date.getDate()),
    HH: pad(date.getHours()),
    mm: pad(date.getMinutes()),
    ss: pad(date.getSeconds())
  }
  return pattern.replace(/YYYY|MM|DD|HH|mm|ss/g, (key) => map[key])
}

/** 手机号脱敏 */
export function maskMobile(mobile: string): string {
  return mobile.replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2')
}

/** 节流：用于滚动 / 点击防抖 */
export function throttle<T extends (...args: any[]) => void>(fn: T, wait = 300): T {
  let last = 0
  return function (this: unknown, ...args: any[]) {
    const now = Date.now()
    if (now - last >= wait) {
      last = now
      fn.apply(this, args)
    }
  } as T
}
