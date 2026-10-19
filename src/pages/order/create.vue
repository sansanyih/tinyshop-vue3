<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import RfNavbar from '@/components/RfNavbar.vue'
import RfEmpty from '@/components/RfEmpty.vue'
import { createOrder, getAddressList, payOrder } from '@/api/user'
import { useCartStore } from '@/stores/cart'
import { useUserStore } from '@/stores/user'
import { formatPrice } from '@/utils/format'
import type { Address, CartItem, OrderItem } from '@/types/model'

const cartStore = useCartStore()
const userStore = useUserStore()

const mode = ref<'cart' | 'buy'>('cart')
const buySkuId = ref(0)
const address = ref<Address | null>(null)
const addresses = ref<Address[]>([])
const remark = ref('')
const submitting = ref(false)

/** 待结算商品：立即购买只结算当前 SKU，购物车结算勾选项 */
const items = computed<CartItem[]>(() => {
  if (mode.value === 'buy') {
    return cartStore.items.filter((item) => item.skuId === buySkuId.value)
  }
  return cartStore.checkedItems
})

const totalAmount = computed(() =>
  items.value.reduce((sum, item) => sum + item.price * item.qty, 0)
)

const discount = computed(() => (items.value.length ? 10 : 0))

const payAmount = computed(() => Math.max(0, Math.round((totalAmount.value - discount.value) * 100) / 100))

/** 地址页选中的地址缓存在这里，返回时 onShow 读取 */
const SELECTED_ADDRESS_KEY = 'rf_selected_address'

async function loadAddress() {
  addresses.value = await getAddressList()
  const cached = uni.getStorageSync(SELECTED_ADDRESS_KEY)
  if (cached) {
    try {
      address.value = JSON.parse(cached) as Address
      return
    } catch {
      /* 缓存损坏则回落到默认地址 */
    }
  }
  address.value = addresses.value.find((item) => item.isDefault) ?? addresses.value[0] ?? null
}

onLoad((query) => {
  mode.value = query?.mode === 'buy' ? 'buy' : 'cart'
  buySkuId.value = Number(query?.skuId ?? 0)
  if (!userStore.isLogin) {
    uni.redirectTo({
      url: `/pages/account/login?redirect=${encodeURIComponent('/pages/order/create')}`
    })
    return
  }
  loadAddress()
})

onShow(() => {
  if (!userStore.isLogin) return
  const cached = uni.getStorageSync(SELECTED_ADDRESS_KEY)
  if (!cached) return
  try {
    address.value = JSON.parse(cached) as Address
  } catch {
    /* ignore */
  }
})

function chooseAddress() {
  uni.navigateTo({ url: '/pages/account/address' })
}

async function submit() {
  if (submitting.value) return
  if (!address.value) {
    uni.showToast({ title: '请选择收货地址', icon: 'none' })
    return
  }
  if (!items.value.length) {
    uni.showToast({ title: '没有可结算的商品', icon: 'none' })
    return
  }
  submitting.value = true
  uni.showLoading({ title: '提交订单', mask: true })
  try {
    const orderItems: OrderItem[] = items.value.map((item) => ({
      productId: item.productId,
      skuId: item.skuId,
      title: item.title,
      cover: item.cover,
      price: item.price,
      skuName: item.skuName,
      qty: item.qty
    }))

    const order = await createOrder({ items: orderItems, remark: remark.value })

    // 演示环境直接调用支付接口，模拟"支付成功"
    await payOrder(order.id)

    if (mode.value === 'cart') cartStore.removeChecked()

    uni.hideLoading()
    uni.showToast({ title: '支付成功', icon: 'success' })

    setTimeout(() => {
      uni.redirectTo({ url: '/pages/order/list?status=shipping' })
    }, 600)
  } catch (error) {
    uni.hideLoading()
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <view class="confirm">
    <RfNavbar title="确认订单" background="#ffffff" />

    <view class="confirm__address" hover-class="rf-hover" @tap="chooseAddress">
      <template v-if="address">
        <view class="confirm__address-main">
          <view class="confirm__address-top">
            <text class="confirm__address-name">{{ address.name }}</text>
            <text class="confirm__address-mobile">{{ address.mobile }}</text>
            <text v-if="address.isDefault" class="confirm__address-tag">默认</text>
          </view>
          <text class="confirm__address-detail">{{ address.region }}{{ address.detail }}</text>
        </view>
        <text class="confirm__address-arrow">›</text>
      </template>
      <view v-else class="confirm__address-empty">
        <text>请选择收货地址</text>
        <text class="confirm__address-arrow">›</text>
      </view>
    </view>

    <view class="confirm__goods">
      <view v-for="item in items" :key="item.skuId" class="confirm__item">
        <image class="confirm__cover" :src="item.cover" mode="aspectFill" />
        <view class="confirm__item-info">
          <text class="confirm__item-title rf-ellipsis-2">{{ item.title }}</text>
          <text class="confirm__item-sku">{{ item.skuName }}</text>
          <view class="rf-flex-between confirm__item-footer">
            <view class="rf-price">
              <text class="rf-price__symbol">¥</text>
              <text>{{ formatPrice(item.price) }}</text>
            </view>
            <text class="confirm__item-qty">x{{ item.qty }}</text>
          </view>
        </view>
      </view>
      <RfEmpty v-if="!items.length" text="没有可结算的商品" />
    </view>

    <view class="confirm__cells">
      <view class="confirm__cell">
        <text class="confirm__cell-label">优惠券</text>
        <text class="confirm__cell-value">-¥{{ formatPrice(discount) }}</text>
      </view>
      <view class="confirm__cell">
        <text class="confirm__cell-label">运费</text>
        <text class="confirm__cell-value">包邮</text>
      </view>
      <view class="confirm__cell confirm__cell--column">
        <text class="confirm__cell-label">订单备注</text>
        <input v-model="remark" class="confirm__remark" placeholder="选填，请填写备注信息" maxlength="60" />
      </view>
    </view>

    <view class="confirm__bar rf-safe-bottom">
      <view class="confirm__amount">
        <text class="confirm__amount-label">应付：</text>
        <view class="rf-price">
          <text class="rf-price__symbol">¥</text>
          <text class="confirm__amount-value">{{ formatPrice(payAmount) }}</text>
        </view>
      </view>
      <view class="confirm__submit" hover-class="rf-hover" @tap="submit">提交订单</view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.confirm {
  min-height: 100vh;
  padding: $rf-gap-sm $rf-gap 160rpx;

  &__address {
    display: flex;
    align-items: center;
    background: #fff;
    border-radius: $rf-radius;
    padding: $rf-gap;
  }

  &__address-main {
    flex: 1;
  }

  &__address-top {
    display: flex;
    align-items: center;
  }

  &__address-name {
    font-size: $rf-font-lg;
    font-weight: 600;
    color: $rf-text;
  }

  &__address-mobile {
    margin-left: $rf-gap-sm;
    font-size: $rf-font-sm;
    color: $rf-text-secondary;
  }

  &__address-tag {
    margin-left: $rf-gap-xs;
    font-size: $rf-font-xs;
    color: #fff;
    background: $rf-primary;
    border-radius: 4rpx;
    padding: 0 8rpx;
  }

  &__address-detail {
    display: block;
    margin-top: 10rpx;
    font-size: $rf-font-sm;
    color: $rf-text-regular;
  }

  &__address-arrow {
    color: $rf-text-placeholder;
    margin-left: $rf-gap-sm;
  }

  &__address-empty {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: $rf-font;
    color: $rf-text-regular;
  }

  &__goods {
    margin-top: $rf-gap-sm;
    background: #fff;
    border-radius: $rf-radius;
    padding: $rf-gap-sm $rf-gap;
  }

  &__item {
    display: flex;
    padding: $rf-gap-sm 0;

    & + & {
      border-top: 1rpx solid $rf-border;
    }
  }

  &__cover {
    width: 160rpx;
    height: 160rpx;
    border-radius: $rf-radius-sm;
    background: #f2f2f2;
    flex-shrink: 0;
  }

  &__item-info {
    flex: 1;
    margin-left: $rf-gap-sm;
    min-width: 0;
  }

  &__item-title {
    font-size: $rf-font;
    color: $rf-text;
    line-height: 1.35;
  }

  &__item-sku {
    display: inline-block;
    margin-top: 8rpx;
    font-size: $rf-font-xs;
    color: $rf-text-secondary;
  }

  &__item-footer {
    margin-top: $rf-gap-xs;
  }

  &__item-qty {
    font-size: $rf-font-sm;
    color: $rf-text-secondary;
  }

  &__cells {
    margin-top: $rf-gap-sm;
    background: #fff;
    border-radius: $rf-radius;
    padding: 0 $rf-gap;
  }

  &__cell {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 96rpx;
    border-bottom: 1rpx solid $rf-border;

    &:last-child {
      border-bottom: none;
    }

    &--column {
      height: auto;
      flex-direction: column;
      align-items: flex-start;
      padding: $rf-gap-sm 0;
    }
  }

  &__cell-label {
    font-size: $rf-font;
    color: $rf-text;
  }

  &__cell-value {
    font-size: $rf-font-sm;
    color: $rf-primary;
  }

  &__remark {
    width: 100%;
    margin-top: $rf-gap-xs;
    font-size: $rf-font-sm;
    color: $rf-text-regular;
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
    z-index: 20;
  }

  &__amount {
    flex: 1;
    display: flex;
    align-items: baseline;
  }

  &__amount-label {
    font-size: $rf-font-sm;
    color: $rf-text-secondary;
  }

  &__amount-value {
    font-size: 40rpx;
  }

  &__submit {
    width: 240rpx;
    height: 80rpx;
    line-height: 80rpx;
    text-align: center;
    border-radius: 100rpx;
    background: linear-gradient(90deg, #ff7d99, #fa436a);
    color: #fff;
    font-size: $rf-font;
  }
}
</style>
