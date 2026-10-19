import { defineStore } from 'pinia'
import type { UserProfile } from '@/types/model'
import { login as loginApi } from '@/api/user'
import { storage } from '@/utils/storage'

interface UserState {
  token: string
  profile: UserProfile | null
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    token: '',
    profile: null
  }),

  getters: {
    isLogin: (state) => Boolean(state.token),
    nickname: (state) => state.profile?.nickname ?? '未登录',
    avatar: (state) => state.profile?.avatar ?? ''
  },

  actions: {
    /** App 启动时从本地恢复登录态 */
    restore() {
      this.token = storage.getToken()
      this.profile = storage.getUser<UserProfile>()
    },

    async login(mobile: string, code: string) {
      const result = await loginApi(mobile, code)
      this.token = result.token
      this.profile = result.profile
      storage.setToken(result.token)
      storage.setUser(result.profile)
      return result
    },

    logout() {
      this.token = ''
      this.profile = null
      storage.clearAuth()
    },

    updateProfile(patch: Partial<UserProfile>) {
      if (!this.profile) return
      this.profile = { ...this.profile, ...patch }
      storage.setUser(this.profile)
    }
  }
})
