<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad, onPullDownRefresh, onReachBottom, onShow } from '@dcloudio/uni-app'
import RfProductCard from '@/components/RfProductCard.vue'
import RfSkeleton from '@/components/RfSkeleton.vue'
import RfEmpty from '@/components/RfEmpty.vue'
import RfLoadMore from '@/components/RfLoadMore.vue'
import { getProducts } from '@/api/product'
import { useAppStore } from '@/stores/app'
import { useCartStore } from '@/stores/cart'
import type { Banner, Product } from '@/types/model'

const appStore = useAppStore()
const cartStore = useCartStore()

const products = ref<Product[]>([])
const page = ref(1)
const pageSize = 10
const total = ref(0)
const firstLoading = ref(true)
const loadStatus = ref<'idle' | 'loading' | 'noMore'>('idle')

/** 轮播配色：与 Banner 产品图形成对比 */
const gradients = [
  'linear-gradient(135deg, #ff9db5 0%, #fa436a 100%)',
  'linear-gradient(135deg, #7fb2ff 0%, #3d7bff 100%)',
  'linear-gradient(135deg, #7fe3b8 0%, #00b578 100%)'
]

const leftColumn = computed(() => products.value.filter((_, index) => index % 2 === 0))
const rightColumn = computed(() => products.value.filter((_, index) => index % 2 === 1))

async function loadProducts(reset = false) {
  if (loadStatus.value === 'loading') return
  if (!reset && total.value > 0 && products.value.length >= total.value) return

  loadStatus.value = 'loading'
  try {
    if (reset) {
      page.value = 1
      total.value = 0
    }
    const result = await getProducts({ page: page.value, page_size: pageSize })
    products.value = reset ? result.list : [...products.value, ...result.list]
    total.value = result.total
    page.value += 1
    loadStatus.value = products.value.length >= result.total ? 'noMore' : 'idle'
  } catch {
    loadStatus.value = 'idle'
  } finally {
    firstLoading.value = false
  }
}

function syncCartBadge() {
  const count = cartStore.count
  if (count > 0) uni.setTabBarBadge({ index: 2, text: String(count) })
  else uni.removeTabBarBadge({ index: 2 })
}

onLoad(async () => {
  cartStore.restore()
  await appStore.ensureBaseData()
  await loadProducts(true)
  syncCartBadge()
})

onShow(() => {
  syncCartBadge()
})

onPullDownRefresh(async () => {
  await Promise.all([appStore.ensureBaseData(true), loadProducts(true)])
  uni.stopPullDownRefresh()
})

onReachBottom(() => {
  loadProducts()
})

function goSearch() {
  uni.navigateTo({ url: '/pages/search/search' })
}

function goBanner(banner: Banner) {
  uni.navigateTo({ url: banner.link })
}

function goNotice() {
  uni.showModal({
    title: appStore.notices[0]?.title ?? '公告',
    content: appStore.notices[0]?.content ?? '',
    showCancel: false
  })
}

function openCategory(id: number) {
  uni.navigateTo({ url: `/pages/category/category?categoryId=${id}` })
}

function goCategory() {
  uni.switchTab({ url: '/pages/category/category' })
}
</script>

<template>
  <view class="home">
    <!-- 顶部搜索 -->
    <view class="home__header">
      <view class="home__brand">
        <text class="home__brand-name">小蜂商城</text>
        <text class="home__brand-slogan">精选好物 · 次日达</text>
      </view>
      <view class="home__search" hover-class="rf-hover" @tap="goSearch">
        <text class="home__search-icon">🔍</text>
        <text class="home__search-text">搜耳机 / 腕表 / 猫粮</text>
      </view>
    </view>

    <view class="home__body">
      <!-- 轮播 Banner：渐变底 + 产品实拍图 -->
      <swiper
        class="home__banner"
        circular
        autoplay
        :interval="4000"
        :duration="420"
        indicator-dots
        indicator-color="rgba(255,255,255,.45)"
        indicator-active-color="#ffffff"
      >
        <swiper-item v-for="(item, index) in appStore.banners" :key="item.id">
          <view
            class="banner-card"
            :style="{ background: gradients[index % 3] }"
            @tap="goBanner(item)"
          >
            <view class="banner-card__text">
              <text class="banner-card__tag">限时活动</text>
              <text class="banner-card__title">{{ item.title }}</text>
              <text class="banner-card__sub">{{ item.subtitle }}</text>
              <view class="banner-card__cta">立即抢购 ›</view>
            </view>
            <image class="banner-card__img" :src="item.image" :alt="item.title" mode="aspectFit" />
          </view>
        </swiper-item>
      </swiper>

      <!-- 分类入口 -->
      <view class="home__cats">
        <view
          v-for="item in appStore.categories"
          :key="item.id"
          class="home__cat"
          hover-class="rf-hover"
          @tap="openCategory(item.id)"
        >
          <view class="home__cat-icon">{{ item.icon }}</view>
          <text class="home__cat-name rf-ellipsis">{{ item.name }}</text>
        </view>
      </view>

      <!-- 公告 -->
      <view
        v-if="appStore.notices.length"
        class="home__notice"
        hover-class="rf-hover"
        @tap="goNotice"
      >
        <text class="home__notice-tag">公告</text>
        <swiper class="home__notice-swiper" vertical circular autoplay :interval="3200">
          <swiper-item v-for="item in appStore.notices" :key="item.id">
            <text class="home__notice-text rf-ellipsis">{{ item.title }}</text>
          </swiper-item>
        </swiper>
        <text class="home__notice-arrow">›</text>
      </view>

      <!-- 推荐 -->
      <view class="home__section">
        <view class="home__section-left">
          <text class="home__section-bar" />
          <text class="home__section-title">为你推荐</text>
        </view>
        <text class="home__section-more" @tap="goCategory">全部商品 ›</text>
      </view>

      <RfSkeleton v-if="firstLoading" :count="6" layout="card" />

      <template v-else>
        <view v-if="products.length" class="home__waterfall">
          <view class="home__column">
            <RfProductCard v-for="item in leftColumn" :key="item.id" :product="item" />
          </view>
          <view class="home__column">
            <RfProductCard v-for="item in rightColumn" :key="item.id" :product="item" />
          </view>
        </view>
        <RfEmpty v-else text="暂时没有商品" />
        <RfLoadMore :status="loadStatus" />
      </template>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.home {
  min-height: 100vh;

  &__header {
    padding: calc(var(--status-bar-height, 20px) + 8px) $rf-gap $rf-gap-sm;
    background: linear-gradient(180deg, #fff3f6 0%, #fff 100%);
  }

  &__brand {
    display: flex;
    align-items: baseline;
    margin-bottom: $rf-gap-sm;
  }

  &__brand-name {
    font-size: 40rpx;
    font-weight: 700;
    color: $rf-text;
    letter-spacing: 2rpx;
  }

  &__brand-slogan {
    margin-left: $rf-gap-sm;
    font-size: $rf-font-xs;
    color: $rf-primary;
  }

  &__search {
    display: flex;
    align-items: center;
    height: 76rpx;
    padding: 0 $rf-gap;
    background: #fff;
    border-radius: 100rpx;
    box-shadow: 0 4rpx 16rpx rgba(250, 67, 106, 0.08);
  }

  &__search-icon {
    font-size: $rf-font-sm;
    margin-right: 10rpx;
  }

  &__search-text {
    font-size: $rf-font-sm;
    color: $rf-text-placeholder;
  }

  &__banner {
    height: 300rpx;
    margin: $rf-gap-sm $rf-gap 0;
    border-radius: $rf-radius-lg;
    overflow: hidden;
  }

  &__cats {
    display: flex;
    padding: $rf-gap $rf-gap-sm;
    margin: $rf-gap-sm $rf-gap 0;
    background: $rf-card-bg;
    border-radius: $rf-radius-lg;
  }

  &__cat {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  &__cat-icon {
    width: 80rpx;
    height: 80rpx;
    line-height: 80rpx;
    text-align: center;
    font-size: 36rpx;
    border-radius: 24rpx;
    background: #fff4f7;
  }

  &__cat-name {
    width: 100%;
    margin-top: 12rpx;
    font-size: 22rpx;
    color: $rf-text-regular;
    text-align: center;
  }

  &__notice {
    display: flex;
    align-items: center;
    height: 72rpx;
    margin: $rf-gap-sm $rf-gap 0;
    padding: 0 $rf-gap-sm;
    background: #fff;
    border-radius: $rf-radius;
  }

  &__notice-tag {
    font-size: 20rpx;
    color: #fff;
    background: $rf-primary;
    border-radius: 6rpx;
    padding: 2rpx 10rpx;
    margin-right: $rf-gap-sm;
    font-weight: 600;
  }

  &__notice-swiper {
    flex: 1;
    height: 72rpx;
  }

  &__notice-text {
    font-size: $rf-font-sm;
    color: $rf-text-regular;
    line-height: 72rpx;
  }

  &__notice-arrow {
    color: $rf-text-placeholder;
    margin-left: $rf-gap-xs;
  }

  &__section {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $rf-gap $rf-gap $rf-gap-sm;
  }

  &__section-left {
    display: flex;
    align-items: center;
  }

  &__section-bar {
    width: 8rpx;
    height: 32rpx;
    border-radius: 8rpx;
    background: linear-gradient(180deg, #ff9db5, #fa436a);
    margin-right: $rf-gap-sm;
  }

  &__section-title {
    font-size: $rf-font-lg;
    font-weight: 700;
    color: $rf-text;
  }

  &__section-more {
    font-size: $rf-font-sm;
    color: $rf-text-secondary;
  }

  &__waterfall {
    display: flex;
    justify-content: space-between;
    padding: 0 $rf-gap;
  }

  &__column {
    width: 48.5%;
    display: flex;
    flex-direction: column;

    :deep(.rf-product-card) {
      margin-bottom: $rf-gap-sm;
    }
  }
}

/* 轮播卡片 */
.banner-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 $rf-gap;
  border-radius: $rf-radius-lg;
  overflow: hidden;

  &__text {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
    max-width: 60%;
  }

  &__tag {
    align-self: flex-start;
    font-size: 20rpx;
    color: #fa436a;
    background: rgba(255, 255, 255, 0.92);
    border-radius: 100rpx;
    padding: 2rpx 16rpx;
    margin-bottom: 12rpx;
  }

  &__title {
    font-size: 40rpx;
    font-weight: 700;
    color: #fff;
    line-height: 1.25;
  }

  &__sub {
    margin-top: 10rpx;
    font-size: 24rpx;
    color: rgba(255, 255, 255, 0.9);
  }

  &__cta {
    align-self: flex-start;
    margin-top: $rf-gap-sm;
    padding: 6rpx 24rpx;
    font-size: 22rpx;
    color: #fff;
    border: 1rpx solid rgba(255, 255, 255, 0.7);
    border-radius: 100rpx;
  }

  &__img {
    flex-shrink: 0;
    width: 200rpx;
    height: 200rpx;
    margin-left: auto;
  }
}
</style>
