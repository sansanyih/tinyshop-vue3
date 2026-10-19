<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import RfNavbar from '@/components/RfNavbar.vue'
import RfNumberBox from '@/components/RfNumberBox.vue'
import RfSkeleton from '@/components/RfSkeleton.vue'
import { getProductDetail } from '@/api/product'
import { useCartStore } from '@/stores/cart'
import { formatPrice, formatSales } from '@/utils/format'
import type { Product, Sku } from '@/types/model'

const cartStore = useCartStore()

const product = ref<Product | null>(null)
const loading = ref(true)
const popupVisible = ref(false)
const popupMode = ref<'cart' | 'buy'>('cart')
const currentSku = ref<Sku | null>(null)
const qty = ref(1)

const currentPrice = computed(() => currentSku.value?.price ?? product.value?.price ?? 0)
const cartCount = computed(() => cartStore.count)

async function loadDetail(id: number) {
  loading.value = true
  try {
    product.value = await getProductDetail(id)
    currentSku.value = product.value.skus[0] ?? null
  } finally {
    loading.value = false
  }
}

onLoad((query) => {
  const id = Number(query?.id ?? 1)
  loadDetail(id)
})

function openPopup(mode: 'cart' | 'buy') {
  if (!product.value) return
  popupMode.value = mode
  qty.value = 1
  popupVisible.value = true
}

function selectSku(sku: Sku) {
  currentSku.value = sku
  qty.value = Math.min(qty.value, sku.stock)
}

function confirmPopup() {
  if (!product.value || !currentSku.value) return
  cartStore.add({
    productId: product.value.id,
    skuId: currentSku.value.id,
    title: product.value.title,
    cover: product.value.cover,
    price: currentSku.value.price,
    skuName: currentSku.value.name,
    stock: currentSku.value.stock,
    qty: qty.value
  })
  popupVisible.value = false
  uni.setTabBarBadge({ index: 2, text: String(cartStore.count) })

  if (popupMode.value === 'buy') {
    uni.navigateTo({ url: `/pages/order/create?mode=buy&skuId=${currentSku.value.id}` })
  } else {
    uni.showToast({ title: '已加入购物车', icon: 'success' })
  }
}

function goCart() {
  uni.switchTab({ url: '/pages/cart/cart' })
}

function preview(index: number) {
  if (!product.value) return
  uni.previewImage({ current: index, urls: product.value.images })
}
</script>

<template>
  <view class="detail">
    <RfNavbar title="商品详情" background="#ffffff" />

    <RfSkeleton v-if="loading" :count="2" layout="row" />

    <template v-else-if="product">
      <swiper class="detail__swiper" circular indicator-dots :current="0">
        <swiper-item v-for="(image, index) in product.images" :key="image">
          <image class="detail__image" :src="image" mode="aspectFill" @tap="preview(index)" />
        </swiper-item>
      </swiper>

      <view class="detail__info">
        <view class="detail__price-row">
          <view class="rf-flex">
            <view class="rf-price">
              <text class="rf-price__symbol">¥</text>
              <text class="detail__price">{{ formatPrice(currentPrice) }}</text>
            </view>
            <text class="detail__market">¥{{ formatPrice(product.marketPrice) }}</text>
          </view>
          <text class="detail__sales">已售 {{ formatSales(product.sales) }}</text>
        </view>

        <text class="detail__title">{{ product.title }}</text>
        <text class="detail__subtitle">{{ product.subtitle }}</text>

        <view class="detail__tags">
          <text v-for="tag in product.tags" :key="tag" class="detail__tag">{{ tag }}</text>
        </view>

        <view class="detail__service">
          <text class="detail__service-item">48h 发货</text>
          <text class="detail__service-item">7 天无理由</text>
          <text class="detail__service-item">正品保障</text>
        </view>
      </view>

      <view class="detail__sku-bar" @tap="openPopup('cart')">
        <text class="detail__sku-label">选择</text>
        <text class="detail__sku-value rf-ellipsis">{{ currentSku?.name ?? '请选择规格' }}</text>
        <text class="detail__sku-arrow">›</text>
      </view>

      <view class="detail__rich">
        <view class="detail__section-head">商品详情</view>
        <rich-text :nodes="product.detail" />
      </view>

      <view class="detail__placeholder" />

      <view class="detail__bar rf-safe-bottom">
        <view class="detail__bar-icon" @tap="goCart">
          <text class="detail__bar-glyph">🛒</text>
          <text v-if="cartCount" class="detail__bar-badge">{{ cartCount }}</text>
        </view>
        <view class="detail__bar-btns">
          <view class="detail__btn detail__btn--cart" hover-class="rf-hover" @tap="openPopup('cart')">
            加入购物车
          </view>
          <view class="detail__btn detail__btn--buy" hover-class="rf-hover" @tap="openPopup('buy')">
            立即购买
          </view>
        </view>
      </view>
    </template>

    <!-- SKU 选择弹层 -->
    <view v-if="popupVisible" class="detail__mask" @tap="popupVisible = false" />
    <view v-if="popupVisible" class="detail__popup">
      <view class="detail__popup-head">
        <image class="detail__popup-cover" :src="product?.cover" mode="aspectFill" />
        <view class="detail__popup-info">
          <view class="rf-price">
            <text class="rf-price__symbol">¥</text>
            <text class="detail__popup-price">{{ formatPrice(currentPrice) }}</text>
          </view>
          <text class="detail__popup-stock">库存 {{ currentSku?.stock ?? 0 }} 件</text>
        </view>
        <text class="detail__popup-close" @tap="popupVisible = false">✕</text>
      </view>

      <view class="detail__popup-section">
        <text class="detail__popup-label">规格</text>
        <view class="detail__sku-list">
          <view
            v-for="sku in product?.skus ?? []"
            :key="sku.id"
            class="detail__sku-item"
            :class="{ 'detail__sku-item--active': sku.id === currentSku?.id }"
            @tap="selectSku(sku)"
          >
            {{ sku.name }}
          </view>
        </view>
      </view>

      <view class="detail__popup-section detail__popup-section--row">
        <text class="detail__popup-label">数量</text>
        <RfNumberBox
          :model-value="qty"
          :max="currentSku?.stock ?? 99"
          @update:model-value="(value: number) => (qty = value)"
        />
      </view>

      <view class="detail__popup-confirm" hover-class="rf-hover" @tap="confirmPopup">
        {{ popupMode === 'buy' ? '立即购买' : '加入购物车' }}
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.detail {
  min-height: 100vh;
  padding-bottom: 40rpx;

  &__swiper {
    height: 750rpx;
  }

  &__image {
    width: 100%;
    height: 750rpx;
    background: #f2f2f2;
  }

  &__info {
    background: #fff;
    padding: $rf-gap;
    border-radius: 0 0 $rf-radius $rf-radius;
  }

  &__price-row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
  }

  &__price {
    font-size: 48rpx;
  }

  &__market {
    margin-left: $rf-gap-sm;
    font-size: $rf-font-sm;
    color: $rf-text-secondary;
    text-decoration: line-through;
  }

  &__sales {
    font-size: $rf-font-sm;
    color: $rf-text-secondary;
  }

  &__title {
    display: block;
    margin-top: $rf-gap-sm;
    font-size: $rf-font-lg;
    font-weight: 600;
    color: $rf-text;
    line-height: 1.4;
  }

  &__subtitle {
    display: block;
    margin-top: 8rpx;
    font-size: $rf-font-sm;
    color: $rf-text-secondary;
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    margin-top: $rf-gap-sm;
  }

  &__tag {
    font-size: $rf-font-xs;
    color: $rf-primary;
    border: 1rpx solid rgba(250, 67, 106, 0.35);
    border-radius: 6rpx;
    padding: 2rpx 12rpx;
    margin-right: $rf-gap-xs;
  }

  &__service {
    display: flex;
    margin-top: $rf-gap-sm;
    padding-top: $rf-gap-sm;
    border-top: 1rpx solid $rf-border;
  }

  &__service-item {
    font-size: $rf-font-xs;
    color: $rf-text-secondary;
    margin-right: $rf-gap-sm;
  }

  &__sku-bar {
    display: flex;
    align-items: center;
    margin-top: $rf-gap-sm;
    padding: $rf-gap;
    background: #fff;
  }

  &__sku-label {
    font-size: $rf-font-sm;
    color: $rf-text-secondary;
    margin-right: $rf-gap;
  }

  &__sku-value {
    flex: 1;
    font-size: $rf-font;
    color: $rf-text;
  }

  &__sku-arrow {
    color: $rf-text-placeholder;
  }

  &__rich {
    margin-top: $rf-gap-sm;
    padding: $rf-gap;
    background: #fff;
    font-size: $rf-font;
    color: $rf-text-regular;
    line-height: 1.7;
  }

  &__section-head {
    font-size: $rf-font;
    font-weight: 600;
    color: $rf-text;
    margin-bottom: $rf-gap-sm;
  }

  &__placeholder {
    height: 120rpx;
  }

  &__bar {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    height: 108rpx;
    padding: 0 $rf-gap;
    background: #fff;
    box-shadow: 0 -2rpx 16rpx rgba(0, 0, 0, 0.05);
    z-index: 30;
  }

  &__bar-icon {
    position: relative;
    width: 96rpx;
    text-align: center;
  }

  &__bar-glyph {
    font-size: 40rpx;
  }

  &__bar-badge {
    position: absolute;
    top: -6rpx;
    right: 6rpx;
    min-width: 30rpx;
    height: 30rpx;
    line-height: 30rpx;
    text-align: center;
    border-radius: 100rpx;
    background: $rf-primary;
    color: #fff;
    font-size: 20rpx;
    padding: 0 6rpx;
  }

  &__bar-btns {
    flex: 1;
    display: flex;
  }

  &__btn {
    flex: 1;
    height: 76rpx;
    line-height: 76rpx;
    text-align: center;
    font-size: $rf-font;
    color: #fff;

    &--cart {
      background: linear-gradient(90deg, #ffb347, #ff9900);
      border-radius: 100rpx 0 0 100rpx;
    }

    &--buy {
      background: linear-gradient(90deg, #ff7d99, #fa436a);
      border-radius: 0 100rpx 100rpx 0;
    }
  }

  &__mask {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    z-index: 40;
  }

  &__popup {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    background: #fff;
    border-radius: $rf-radius-lg $rf-radius-lg 0 0;
    padding: $rf-gap;
    z-index: 50;
  }

  &__popup-head {
    display: flex;
    align-items: center;
    position: relative;
  }

  &__popup-cover {
    width: 160rpx;
    height: 160rpx;
    border-radius: $rf-radius-sm;
    background: #f2f2f2;
  }

  &__popup-info {
    margin-left: $rf-gap-sm;
  }

  &__popup-price {
    font-size: 40rpx;
  }

  &__popup-stock {
    display: block;
    margin-top: 8rpx;
    font-size: $rf-font-xs;
    color: $rf-text-secondary;
  }

  &__popup-close {
    position: absolute;
    top: 0;
    right: 0;
    font-size: $rf-font-lg;
    color: $rf-text-placeholder;
  }

  &__popup-section {
    margin-top: $rf-gap;

    &--row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
  }

  &__popup-label {
    font-size: $rf-font-sm;
    color: $rf-text-secondary;
    margin-right: $rf-gap;
  }

  &__sku-list {
    display: flex;
    flex-wrap: wrap;
    margin-top: $rf-gap-xs;
  }

  &__sku-item {
    padding: 12rpx 32rpx;
    border-radius: 100rpx;
    background: #f5f6f8;
    font-size: $rf-font-sm;
    color: $rf-text-regular;
    margin: 0 $rf-gap-xs $rf-gap-xs 0;

    &--active {
      background: rgba(250, 67, 106, 0.1);
      color: $rf-primary;
      border: 1rpx solid $rf-primary;
    }
  }

  &__popup-confirm {
    margin-top: $rf-gap-lg;
    height: 88rpx;
    line-height: 88rpx;
    text-align: center;
    border-radius: 100rpx;
    background: linear-gradient(90deg, #ff7d99, #fa436a);
    color: #fff;
    font-size: $rf-font-lg;
  }
}
</style>
