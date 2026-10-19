import { describe, expect, it } from 'vitest'
import { formatDate, formatNumber, formatPrice, formatSales, maskMobile } from '@/utils/format'

describe('format 工具函数', () => {
  it('价格保留两位小数，非法值回落 0.00', () => {
    expect(formatPrice(1299)).toBe('1299.00')
    expect(formatPrice('88.5')).toBe('88.50')
    expect(formatPrice(Number.NaN)).toBe('0.00')
  })

  it('销量超过一万展示为 w', () => {
    expect(formatSales(8621)).toBe('8621')
    expect(formatSales(22014)).toBe('2.2w')
  })

  it('千分位', () => {
    expect(formatNumber(1234567)).toBe('1,234,567')
  })

  it('手机号脱敏', () => {
    expect(maskMobile('13662659069')).toBe('136****9069')
    expect(maskMobile('abc')).toBe('abc')
  })

  it('日期格式化按占位符替换', () => {
    const date = new Date(2025, 0, 5, 9, 8, 7)
    expect(formatDate(date, 'YYYY-MM-DD HH:mm')).toBe('2025-01-05 09:08')
    expect(formatDate(date, 'YYYY/MM/DD')).toBe('2025/01/05')
    expect(formatDate('not-a-date')).toBe('')
  })
})
