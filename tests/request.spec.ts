import { describe, expect, it } from 'vitest'
import { buildQuery, request } from '@/utils/request'

describe('请求层', () => {
  it('query 拼接会过滤空值并做编码', () => {
    expect(buildQuery({ page: 1, keyword: '耳机' })).toBe(`?page=1&keyword=${encodeURIComponent('耳机')}`)
    expect(buildQuery({ page: 1, keyword: undefined, empty: '', none: null })).toBe('?page=1')
    expect(buildQuery()).toBe('')
  })

  it('Mock 通道能返回分页商品数据（无需后端）', async () => {
    const result = await request<{ list: unknown[]; total: number }>({
      url: '/tiny-shop/v1/product/index',
      params: { page: 1, page_size: 4 }
    })
    expect(result.total).toBeGreaterThan(0)
    expect(result.list).toHaveLength(4)
  })

  it('未实现的 Mock 路由返回 404 业务码并抛错', async () => {
    await expect(
      request({ url: '/tiny-shop/v1/not-exist', showError: false })
    ).rejects.toThrow()
  })

  it('需要登录但未登录时直接拒绝，不发起请求', async () => {
    await expect(
      request({ url: '/tiny-shop/v1/user/info', auth: true, showError: false })
    ).rejects.toThrow('UNAUTHORIZED')
  })
})
