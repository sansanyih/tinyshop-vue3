<script setup lang="ts">
import { computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import RfNavbar from '@/components/RfNavbar.vue'
import RfEmpty from '@/components/RfEmpty.vue'
import RfNumberBox from '@/components/RfNumberBox.vue'
import { useCartStore } from '@/stores/cart'
import { useUserStore } from '@/stores/user'
import { formatPrice } from '@/utils/format'

const cartStore = useCartStore()
const userStore = useUserStore()

const items = computed(() => cartStore.items)
const empty = computed(() => cartStore.items.length === 0)

onShow(() => {
  syncBadge()
})

function syncBadge() {
  const count = cartStore.count
  if (count > 0) uni.setTabBarBadge({ index: 2, text: String(count) })
  else uni.removeTabBarBadge({ index: 2 })
}

function updateQty(skuId: number, value: number) {
  cartStore.updateQty(skuId, value)
  syncBadge()
}

function removeItem(skuId: number, title: string) {
  uni.showModal({
    title: '提示',
    content: `确定移除「${title}」吗？`,
    success: (res) => {
      if (res.confirm) {
        cartStore.remove(skuId)
        syncBadge()
      }
    }
  })
}

function goDetail(productId: number) {
  uni.navigateTo({ url: `/pages/product/detail?id=${productId}` })
}

function goIndex() {
  uni.switchTab({ url: '/pages/index/index' })
}

function checkout() {
  if (!userStore.isLogin) {
    uni.navigateTo({ url: '/pages/account/login?redirect=/pages/cart/cart' })
    return
  }
  if (!cartStore.checkedItems.length) {
    uni.showToast({ title: '请先勾选商品', icon: 'none' })
    return
  }
  uni.navigateTo({ url: '/pages/order/create' })
}
</script>

<template>
  <view class="cart">
    <RfNavbar title="购物车" :show-back="false" background="#f7f7f7" />

    <view class="cart__body">
      <RfEmpty
        v-if="empty"
        icon="🛒"
        text="购物车还是空的"
        :show-button="true"
        button-text="去逛逛"
        @action="goIndex"
      />

      <template v-else>
        <view v-for="item in items" :key="item.skuId" class="cart__item">
          <view
            class="cart__check"
            :class="{ 'cart__check--on': item.checked }"
            @tap="cartStore.toggle(item.skuId)"
          />
          <image
            class="cart__cover"
            :src="item.cover"
            mode="aspectFill"
            lazy-load
            @tap="goDetail(item.productId)"
          />
          <view class="cart__info">
            <text class="cart__title rf-ellipsis-2">{{ item.title }}</text>
            <text class="cart__sku">{{ item.skuName }}</text>
            <view class="cart__footer">
              <view class="rf-price">
                <text class="rf-price__symbol">¥</text>
                <text class="cart__price">{{ formatPrice(item.price) }}</text>
              </view>
              <RfNumberBox
                :model-value="item.qty"
                :max="item.stock || 99"
                @update:model-value="(value: number) => updateQty(item.skuId, value)"
              />
            </view>
          </view>
          <text class="cart__del" @tap="removeItem(item.skuId, item.title)">删除</text>
        </view>
      </template>
    </view>

    <view v-if="!empty" class="cart__bar rf-safe-bottom">
      <view class="cart__all" @tap="cartStore.toggleAll()">
        <view class="cart__check" :class="{ 'cart__check--on': cartStore.allChecked }" />
        <text class="cart__all-text">全选</text>
      </view>
      <view class="cart__total">
        <text class="cart__total-label">合计：</text>
        <view class="rf-price">
          <text class="rf-price__symbol">¥</text>
          <text class="cart__total-price">{{ formatPrice(cartStore.totalAmount) }}</text>
        </view>
      </view>
      <view class="cart__submit" hover-class="rf-hover" @tap="checkout">
        结算({{ cartStore.checkedCount }})
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.cart {
  min-height: 100vh;
  padding-bottom: calc(140rpx + var(--window-bottom, 0px));

  &__body {
    padding: 0 $rf-gap;
  }

  &__item {
    position: relative;
    display: flex;
    align-items: center;
    background: $rf-card-bg;
    border-radius: $rf-radius;
    padding: $rf-gap-sm;
    margin-bottom: $rf-gap-sm;
  }

  &__check {
    width: 38rpx;
    height: 38rpx;
    border-radius: 50%;
    border: 2rpx solid #d4d7de;
    margin-right: $rf-gap-sm;
    flex-shrink: 0;
    position: relative;

    &--on {
      background: $rf-primary;
      border-color: $rf-primary;

      &::after {
        content: '';
        position: absolute;
        left: 11rpx;
        top: 5rpx;
        width: 10rpx;
        height: 18rpx;
        border-right: 3rpx solid #fff;
        border-bottom: 3rpx solid #fff;
        transform: rotate(45deg);
      }
    }
  }

  &__cover {
    width: 168rpx;
    height: 168rpx;
    border-radius: $rf-radius-sm;
    flex-shrink: 0;
    background: #f2f2f2;
  }

  &__info {
    flex: 1;
    margin-left: $rf-gap-sm;
    min-width: 0;
  }

  &__title {
    font-size: $rf-font;
    color: $rf-text;
    line-height: 1.35;
    padding-right: 70rpx;
  }

  &__sku {
    display: inline-block;
    margin-top: 8rpx;
    font-size: $rf-font-xs;
    color: $rf-text-secondary;
    background: #f5f6f8;
    border-radius: 6rpx;
    padding: 2rpx 10rpx;
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: $rf-gap-xs;
  }

  &__price {
    font-size: 34rpx;
  }

  &__del {
    position: absolute;
    top: $rf-gap-sm;
    right: $rf-gap-sm;
    font-size: $rf-font-xs;
    color: $rf-text-secondary;
  }

  &__bar {
    position: fixed;
    left: 0;
    right: 0;
    /* tabBar 页面底部有原生 tabbar，用 uni 注入的 --window-bottom 让开它 */
    bottom: var(--window-bottom, 0);
    display: flex;
    align-items: center;
    height: 108rpx;
    padding: 0 $rf-gap;
    background: #fff;
    box-shadow: 0 -2rpx 16rpx rgba(0, 0, 0, 0.05);
    z-index: 20;
  }

  &__all {
    display: flex;
    align-items: center;
  }

  &__all-text {
    font-size: $rf-font-sm;
    color: $rf-text-regular;
  }

  &__total {
    flex: 1;
    display: flex;
    align-items: baseline;
    justify-content: flex-end;
    margin-right: $rf-gap-sm;
  }

  &__total-label {
    font-size: $rf-font-sm;
    color: $rf-text-secondary;
  }

  &__total-price {
    font-size: 36rpx;
  }

  &__submit {
    width: 200rpx;
    height: 76rpx;
    line-height: 76rpx;
    text-align: center;
    border-radius: 100rpx;
    background: linear-gradient(90deg, #ff7d99, #fa436a);
    color: #fff;
    font-size: $rf-font;
  }
}
</style>
