import { defineStore } from 'pinia'
import type { Banner, Category, Notice } from '@/types/model'
import { getBanners, getCategories, getNotices } from '@/api/product'

interface AppState {
  banners: Banner[]
  categories: Category[]
  notices: Notice[]
  /** 首屏公共数据是否已加载：并发页面共用，避免重复请求 */
  ready: boolean
  loading: boolean
}

export const useAppStore = defineStore('app', {
  state: (): AppState => ({
    banners: [],
    categories: [],
    notices: [],
    ready: false,
    loading: false
  }),

  actions: {
    /**
     * 首页/分类页共用同一份公共数据。
     * 用 ready 标记做一次性加载，tab 切换不重复请求。
     */
    async ensureBaseData(force = false) {
      if (this.ready && !force) return
      if (this.loading) return
      this.loading = true
      try {
        const [banners, categories, notices] = await Promise.all([
          getBanners(),
          getCategories(),
          getNotices()
        ])
        this.banners = banners
        this.categories = categories
        this.notices = notices
        this.ready = true
      } finally {
        this.loading = false
      }
    }
  }
})
