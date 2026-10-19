import { beforeEach, describe, expect, it } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCartStore } from '@/stores/cart'
import { resetStorage } from './setup'

const goods = {
  productId: 1,
  skuId: 11,
  title: '无线降噪头戴耳机',
  cover: '/static/goods/g01.jpg',
  price: 1299,
  skuName: '标准版',
  stock: 120
}

const tee = {
  productId: 8,
  skuId: 81,
  title: '速干运动 T 恤',
  cover: '/static/goods/g08.jpg',
  price: 129,
  skuName: '标准版',
  stock: 3
}

describe('cart store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    resetStorage()
  })

  it('同一 SKU 重复加入时合并数量，不产生重复行', () => {
    const cart = useCartStore()
    cart.add(goods)
    cart.add(goods)
    expect(cart.items).toHaveLength(1)
    expect(cart.items[0].qty).toBe(2)
  })

  it('不同 SKU 各自成行，角标数量为件数之和', () => {
    const cart = useCartStore()
    cart.add(goods)
    cart.add({ ...tee, qty: 2 })
    expect(cart.items).toHaveLength(2)
    expect(cart.count).toBe(3)
  })

  it('数量受最小 1 与库存上限约束', () => {
    const cart = useCartStore()
    cart.add(tee)
    cart.updateQty(tee.skuId, 0)
    expect(cart.items[0].qty).toBe(1)
    cart.updateQty(tee.skuId, 999)
    expect(cart.items[0].qty).toBe(3)
  })

  it('合计金额只统计已勾选商品', () => {
    const cart = useCartStore()
    cart.add(goods)
    cart.add(tee)
    expect(cart.totalAmount).toBe(1299 + 129)
    cart.toggle(tee.skuId)
    expect(cart.checkedCount).toBe(1)
    expect(cart.totalAmount).toBe(1299)
  })

  it('全选与反选', () => {
    const cart = useCartStore()
    cart.add(goods)
    cart.add(tee)
    expect(cart.allChecked).toBe(true)
    cart.toggleAll()
    expect(cart.allChecked).toBe(false)
    expect(cart.totalAmount).toBe(0)
    cart.toggleAll()
    expect(cart.allChecked).toBe(true)
  })

  it('下单后只移除已结算商品', () => {
    const cart = useCartStore()
    cart.add(goods)
    cart.add(tee)
    cart.toggle(tee.skuId)
    cart.removeChecked()
    expect(cart.items).toHaveLength(1)
    expect(cart.items[0].skuId).toBe(tee.skuId)
  })

  it('变更会写入本地存储，restore 可恢复', () => {
    const cart = useCartStore()
    cart.add(goods)
    const snapshot = JSON.parse(JSON.stringify(cart.items))
    expect(snapshot).toHaveLength(1)

    // 新 store 实例走 restore()，数据应来自存储而不是内存
    setActivePinia(createPinia())
    const restored = useCartStore()
    restored.restore()
    expect(restored.items).toHaveLength(1)
    expect(restored.items[0].skuId).toBe(11)
  })
})
