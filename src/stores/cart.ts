import { defineStore } from 'pinia'
import type { CartItem } from '@/types/model'
import { storage } from '@/utils/storage'

interface CartState {
  items: CartItem[]
}

export const useCartStore = defineStore('cart', {
  state: (): CartState => ({
    items: []
  }),

  getters: {
    /** 购物车商品总件数（角标用） */
    count: (state) => state.items.reduce((sum, item) => sum + item.qty, 0),
    /** 已勾选商品 */
    checkedItems: (state) => state.items.filter((item) => item.checked),
    /** 已勾选件数 */
    checkedCount(): number {
      return this.checkedItems.reduce((sum, item) => sum + item.qty, 0)
    },
    /** 已勾选合计金额 */
    totalAmount(): number {
      const total = this.checkedItems.reduce((sum, item) => sum + item.price * item.qty, 0)
      return Math.round(total * 100) / 100
    },
    allChecked: (state) => state.items.length > 0 && state.items.every((item) => item.checked)
  },

  actions: {
    restore() {
      const cached = storage.getCart<CartItem[]>()
      if (Array.isArray(cached)) this.items = cached
    },

    persist() {
      storage.setCart(this.items)
    },

    /** 同一 SKU 合并数量，避免购物车里出现重复行 */
    add(payload: Omit<CartItem, 'qty' | 'checked'> & { qty?: number }) {
      const qty = payload.qty ?? 1
      const existing = this.items.find((item) => item.skuId === payload.skuId)
      if (existing) {
        existing.qty = Math.min(existing.qty + qty, existing.stock || 99)
        existing.checked = true
      } else {
        this.items.unshift({ ...payload, qty, checked: true })
      }
      this.persist()
    },

    remove(skuId: number) {
      this.items = this.items.filter((item) => item.skuId !== skuId)
      this.persist()
    },

    updateQty(skuId: number, qty: number) {
      const target = this.items.find((item) => item.skuId === skuId)
      if (!target) return
      target.qty = Math.max(1, Math.min(qty, target.stock || 99))
      this.persist()
    },

    toggle(skuId: number) {
      const target = this.items.find((item) => item.skuId === skuId)
      if (!target) return
      target.checked = !target.checked
      this.persist()
    },

    toggleAll(checked?: boolean) {
      const next = checked ?? !this.allChecked
      this.items.forEach((item) => {
        item.checked = next
      })
      this.persist()
    },

    /** 下单成功后移除已结算商品 */
    removeChecked() {
      this.items = this.items.filter((item) => !item.checked)
      this.persist()
    },

    clear() {
      this.items = []
      this.persist()
    }
  }
})
