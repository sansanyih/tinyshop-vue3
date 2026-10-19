<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import RfEmpty from '@/components/RfEmpty.vue'
import RfSkeleton from '@/components/RfSkeleton.vue'
import { getOrders } from '@/api/user'
import { formatDate, formatPrice } from '@/utils/format'
import type { Order, OrderStatus } from '@/types/model'

const STATUS_TEXT: Record<OrderStatus, string> = {
  unpaid: '待付款',
  shipping: '待发货',
  receiving: '待收货',
  finished: '已完成',
  closed: '已关闭'
}

const tabs = [
  { key: '', label: '全部' },
  { key: 'unpaid', label: '待付款' },
  { key: 'shipping', label: '待发货' },
  { key: 'finished', label: '已完成' }
]

const activeTab = ref('')
const orders = ref<Order[]>([])
const loading = ref(true)

const currentList = computed(() =>
  activeTab.value ? orders.value.filter((order) => order.status === activeTab.value) : orders.value
)

async function loadOrders() {
  loading.value = true
  try {
    const result = await getOrders({ page: 1, page_size: 50 })
    orders.value = result.list
  } catch {
    orders.value = []
  } finally {
    loading.value = false
  }
}

onLoad((query) => {
  activeTab.value = query?.status ?? ''
  loadOrders()
})

function switchTab(key: string) {
  activeTab.value = key
}

function goIndex() {
  uni.switchTab({ url: '/pages/index/index' })
}
</script>

<template>
  <view class="orders">
    <view class="orders__tabs">
      <view
        v-for="tab in tabs"
        :key="tab.label"
        class="orders__tab"
        :class="{ 'orders__tab--active': activeTab === tab.key }"
        @tap="switchTab(tab.key)"
      >
        <text>{{ tab.label }}</text>
      </view>
    </view>

    <RfSkeleton v-if="loading" :count="3" layout="row" />

    <template v-else>
      <view v-if="currentList.length" class="orders__list">
        <view v-for="order in currentList" :key="order.id" class="orders__card">
          <view class="orders__head">
            <text class="orders__no">订单号 {{ order.orderNo }}</text>
            <text class="orders__status">{{ STATUS_TEXT[order.status] }}</text>
          </view>

          <view v-for="item in order.items" :key="item.skuId" class="orders__item">
            <image class="orders__cover" :src="item.cover" mode="aspectFill" />
            <view class="orders__item-info">
              <text class="orders__title rf-ellipsis-2">{{ item.title }}</text>
              <text class="orders__sku">{{ item.skuName }} · x{{ item.qty }}</text>
            </view>
          </view>

          <view class="orders__foot">
            <text class="orders__time">{{ formatDate(order.createdAt) }}</text>
            <view class="orders__amount">
              <text class="orders__amount-label">实付</text>
              <view class="rf-price">
                <text class="rf-price__symbol">¥</text>
                <text>{{ formatPrice(order.payAmount) }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
      <RfEmpty v-else text="暂无订单" :show-button="true" button-text="去逛逛" @action="goIndex" />
    </template>
  </view>
</template>

<style lang="scss" scoped>
.orders {
  min-height: 100vh;
  padding-bottom: $rf-gap-lg;

  &__tabs {
    display: flex;
    background: #fff;
    position: sticky;
    top: 0;
    z-index: 10;
  }

  &__tab {
    flex: 1;
    height: 88rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: $rf-font-sm;
    color: $rf-text-regular;

    &--active {
      color: $rf-primary;
      font-weight: 600;
      position: relative;

      &::after {
        content: '';
        position: absolute;
        bottom: 8rpx;
        left: 50%;
        transform: translateX(-50%);
        width: 48rpx;
        height: 4rpx;
        background: $rf-primary;
        border-radius: 4rpx;
      }
    }
  }

  &__list {
    padding: $rf-gap-sm $rf-gap 0;
  }

  &__card {
    background: #fff;
    border-radius: $rf-radius;
    padding: $rf-gap-sm $rf-gap;
    margin-bottom: $rf-gap-sm;
  }

  &__head {
    display: flex;
    justify-content: space-between;
    padding-bottom: $rf-gap-sm;
    border-bottom: 1rpx solid $rf-border;
  }

  &__no {
    font-size: $rf-font-xs;
    color: $rf-text-secondary;
  }

  &__status {
    font-size: $rf-font-sm;
    color: $rf-primary;
    font-weight: 600;
  }

  &__item {
    display: flex;
    padding: $rf-gap-sm 0 0;
  }

  &__cover {
    width: 140rpx;
    height: 140rpx;
    border-radius: $rf-radius-sm;
    background: #f2f2f2;
  }

  &__item-info {
    flex: 1;
    margin-left: $rf-gap-sm;
    min-width: 0;
  }

  &__title {
    font-size: $rf-font;
    color: $rf-text;
    line-height: 1.35;
  }

  &__sku {
    display: block;
    margin-top: 8rpx;
    font-size: $rf-font-xs;
    color: $rf-text-secondary;
  }

  &__foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: $rf-gap-sm;
    padding-top: $rf-gap-sm;
    border-top: 1rpx solid $rf-border;
  }

  &__time {
    font-size: $rf-font-xs;
    color: $rf-text-placeholder;
  }

  &__amount {
    display: flex;
    align-items: baseline;
  }

  &__amount-label {
    font-size: $rf-font-xs;
    color: $rf-text-secondary;
    margin-right: 6rpx;
  }
}
</style>
