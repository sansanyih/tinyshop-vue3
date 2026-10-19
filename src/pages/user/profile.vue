<script setup lang="ts">
import { computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import RfNavbar from '@/components/RfNavbar.vue'
import { useUserStore } from '@/stores/user'
import { useCartStore } from '@/stores/cart'
import { formatPrice, maskMobile } from '@/utils/format'

const userStore = useUserStore()
const cartStore = useCartStore()

const profile = computed(() => userStore.profile)

const orderEntries = [
  { key: 'unpaid', label: '待付款', icon: '💰' },
  { key: 'shipping', label: '待发货', icon: '📦' },
  { key: 'receiving', label: '待收货', icon: '🚚' },
  { key: 'finished', label: '已完成', icon: '✅' }
]

const menus = [
  { label: '收货地址', icon: '📍', url: '' },
  { label: '优惠券', icon: '🎟️', url: '' },
  { label: '我的收藏', icon: '⭐', url: '' },
  { label: '客服中心', icon: '💬', url: '' },
  { label: '设置', icon: '⚙️', url: '' }
]

onShow(() => {
  if (userStore.isLogin) {
    const count = cartStore.count
    if (count > 0) uni.setTabBarBadge({ index: 2, text: String(count) })
    else uni.removeTabBarBadge({ index: 2 })
  }
})

function goLogin() {
  uni.navigateTo({ url: '/pages/account/login?redirect=/pages/user/profile' })
}

function goOrders(status: string) {
  if (!userStore.isLogin) return goLogin()
  uni.navigateTo({ url: `/pages/order/list?status=${status}` })
}

function logout() {
  uni.showModal({
    title: '提示',
    content: '确定退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        userStore.logout()
        uni.showToast({ title: '已退出', icon: 'none' })
      }
    }
  })
}

function notImplemented(label: string) {
  uni.showToast({ title: `${label} 待接入`, icon: 'none' })
}
</script>

<template>
  <view class="mine">
    <view class="mine__header">
      <RfNavbar :show-back="false" transparent />
      <view class="mine__profile" @tap="!userStore.isLogin && goLogin()">
        <image
          v-if="profile?.avatar"
          class="mine__avatar"
          :src="profile.avatar"
          mode="aspectFill"
        />
        <view v-else class="mine__avatar mine__avatar--placeholder">👤</view>
        <view class="mine__info">
          <text class="mine__nickname">{{
            userStore.isLogin ? profile?.nickname : '点击登录'
          }}</text>
          <text v-if="userStore.isLogin" class="mine__mobile">
            {{ profile ? maskMobile(profile.mobile) : '' }} · {{ profile?.level }}
          </text>
          <text v-else class="mine__mobile">登录后可查看订单与优惠券</text>
        </view>
      </view>

      <view class="mine__stats">
        <view class="mine__stat">
          <text class="mine__stat-value">{{ profile?.points ?? 0 }}</text>
          <text class="mine__stat-label">积分</text>
        </view>
        <view class="mine__stat">
          <text class="mine__stat-value">¥{{ formatPrice(profile?.balance ?? 0) }}</text>
          <text class="mine__stat-label">余额</text>
        </view>
        <view class="mine__stat">
          <text class="mine__stat-value">{{ profile?.couponCount ?? 0 }}</text>
          <text class="mine__stat-label">优惠券</text>
        </view>
      </view>
    </view>

    <view class="mine__card">
      <view class="mine__card-head">
        <text class="mine__card-title">我的订单</text>
        <text class="mine__card-more" @tap="goOrders('')">全部 ›</text>
      </view>
      <view class="mine__orders">
        <view
          v-for="entry in orderEntries"
          :key="entry.key"
          class="mine__order"
          @tap="goOrders(entry.key)"
        >
          <text class="mine__order-icon">{{ entry.icon }}</text>
          <text class="mine__order-label">{{ entry.label }}</text>
        </view>
      </view>
    </view>

    <view class="mine__card">
      <view
        v-for="menu in menus"
        :key="menu.label"
        class="mine__menu"
        hover-class="rf-hover"
        @tap="notImplemented(menu.label)"
      >
        <text class="mine__menu-icon">{{ menu.icon }}</text>
        <text class="mine__menu-label">{{ menu.label }}</text>
        <text class="mine__menu-arrow">›</text>
      </view>
    </view>

    <view v-if="userStore.isLogin" class="mine__logout" @tap="logout">退出登录</view>
  </view>
</template>

<style lang="scss" scoped>
.mine {
  min-height: 100vh;
  padding-bottom: $rf-gap-lg;

  &__header {
    background: linear-gradient(160deg, #fa436a 0%, #ff8fa3 100%);
    padding-bottom: $rf-gap-lg;
    border-radius: 0 0 32rpx 32rpx;
  }

  &__profile {
    display: flex;
    align-items: center;
    padding: 0 $rf-gap $rf-gap;
  }

  &__avatar {
    width: 120rpx;
    height: 120rpx;
    border-radius: 50%;
    border: 4rpx solid rgba(255, 255, 255, 0.6);
    background: #fff;

    &--placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 52rpx;
    }
  }

  &__info {
    margin-left: $rf-gap;
  }

  &__nickname {
    display: block;
    font-size: $rf-font-xl;
    font-weight: 600;
    color: #fff;
  }

  &__mobile {
    display: block;
    margin-top: 8rpx;
    font-size: $rf-font-sm;
    color: rgba(255, 255, 255, 0.85);
  }

  &__stats {
    display: flex;
    margin: 0 $rf-gap;
    background: rgba(255, 255, 255, 0.18);
    border-radius: $rf-radius;
    padding: $rf-gap-sm 0;
  }

  &__stat {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  &__stat-value {
    font-size: $rf-font-lg;
    font-weight: 600;
    color: #fff;
  }

  &__stat-label {
    margin-top: 4rpx;
    font-size: $rf-font-xs;
    color: rgba(255, 255, 255, 0.85);
  }

  &__card {
    margin: $rf-gap $rf-gap 0;
    background: #fff;
    border-radius: $rf-radius;
    padding: $rf-gap $rf-gap 0;
  }

  &__card-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: $rf-gap-sm;
  }

  &__card-title {
    font-size: $rf-font;
    font-weight: 600;
    color: $rf-text;
  }

  &__card-more {
    font-size: $rf-font-sm;
    color: $rf-text-secondary;
  }

  &__orders {
    display: flex;
    padding-bottom: $rf-gap-sm;
  }

  &__order {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: $rf-gap-sm 0;
  }

  &__order-icon {
    font-size: 40rpx;
  }

  &__order-label {
    margin-top: 8rpx;
    font-size: $rf-font-xs;
    color: $rf-text-regular;
  }

  &__menu {
    display: flex;
    align-items: center;
    height: 96rpx;
    border-bottom: 1rpx solid $rf-border;

    &:last-child {
      border-bottom: none;
    }
  }

  &__menu-icon {
    font-size: 34rpx;
    margin-right: $rf-gap-sm;
  }

  &__menu-label {
    flex: 1;
    font-size: $rf-font;
    color: $rf-text;
  }

  &__menu-arrow {
    color: $rf-text-placeholder;
  }

  &__logout {
    margin: $rf-gap-lg $rf-gap 0;
    height: 88rpx;
    line-height: 88rpx;
    text-align: center;
    background: #fff;
    border-radius: $rf-radius;
    font-size: $rf-font;
    color: $rf-error;
  }
}
</style>
