<script setup lang="ts">
import type { Product } from '@/types/model'
import { formatPrice, formatSales } from '@/utils/format'

interface Props {
  product: Product
  /** grid = 双列瀑布流卡片；row = 列表紧凑行 */
  layout?: 'grid' | 'row'
  showSales?: boolean
  badge?: string
}

const props = withDefaults(defineProps<Props>(), {
  layout: 'grid',
  showSales: true,
  badge: ''
})

const emit = defineEmits<{ (e: 'click', product: Product): void }>()

function handleClick() {
  emit('click', props.product)
  uni.navigateTo({ url: `/pages/product/detail?id=${props.product.id}` })
}
</script>

<template>
  <view
    class="rf-product-card"
    :class="`rf-product-card--${props.layout}`"
    hover-class="rf-hover"
    @tap="handleClick"
  >
    <view class="rf-product-card__cover-wrap">
      <image
        class="rf-product-card__cover"
        :src="props.product.cover"
        :alt="props.product.title"
        mode="aspectFill"
        lazy-load
      />
      <text v-if="props.badge" class="rf-product-card__badge">{{ props.badge }}</text>
    </view>

    <view class="rf-product-card__body">
      <text class="rf-product-card__title rf-ellipsis-2">{{ props.product.title }}</text>
      <text v-if="props.layout === 'row'" class="rf-product-card__subtitle rf-ellipsis">
        {{ props.product.subtitle }}
      </text>

      <view class="rf-product-card__tags">
        <text v-for="tag in props.product.tags.slice(0, 2)" :key="tag" class="rf-product-card__tag">
          {{ tag }}
        </text>
      </view>

      <view class="rf-product-card__footer">
        <view class="rf-product-card__price">
          <text class="rf-product-card__symbol">¥</text>
          <text class="rf-product-card__amount">{{ formatPrice(props.product.price) }}</text>
        </view>
        <text v-if="props.showSales" class="rf-product-card__sales">
          {{ formatSales(props.product.sales) }}人已买
        </text>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.rf-product-card {
  background: $rf-card-bg;
  border-radius: $rf-radius;
  overflow: hidden;
  box-shadow: 0 4rpx 20rpx rgba(17, 24, 39, 0.05);

  &__cover-wrap {
    position: relative;
    background: #fff;
  }

  &__cover {
    display: block;
    width: 100%;
    height: 100%;
  }

  &__badge {
    position: absolute;
    top: $rf-gap-sm;
    left: $rf-gap-sm;
    padding: 2rpx 14rpx;
    font-size: 20rpx;
    color: #fff;
    background: linear-gradient(135deg, #ff9db5, #fa436a);
    border-radius: 100rpx;
  }

  &__title {
    color: $rf-text;
    font-weight: 500;
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;
  }

  &__tag {
    font-size: 20rpx;
    color: $rf-primary;
    background: #fff2f5;
    border-radius: 6rpx;
    padding: 2rpx 10rpx;
    margin-right: 8rpx;
    line-height: 1.5;
  }

  &__footer {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
  }

  &__price {
    display: flex;
    align-items: baseline;
    color: $rf-primary;
    font-weight: 700;
  }

  &__symbol {
    font-size: 22rpx;
    margin-right: 2rpx;
  }

  &__amount {
    font-size: 34rpx;
    letter-spacing: -0.5rpx;
  }

  &__sales {
    font-size: 20rpx;
    color: $rf-text-placeholder;
  }

  /* ---------- 双列卡片 ---------- */
  &--grid {
    .rf-product-card__cover-wrap {
      width: 100%;
      height: 0;
      padding-bottom: 100%;
    }

    .rf-product-card__cover {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
    }

    .rf-product-card__body {
      padding: 16rpx 16rpx 18rpx;
    }

    .rf-product-card__title {
      font-size: 27rpx;
      line-height: 1.36;
      min-height: 74rpx;
    }

    .rf-product-card__tags {
      margin-top: 10rpx;
      min-height: 32rpx;
    }

    .rf-product-card__footer {
      margin-top: 12rpx;
    }
  }

  /* ---------- 列表紧凑行 ---------- */
  &--row {
    display: flex;
    padding: $rf-gap-sm;

    .rf-product-card__cover-wrap {
      width: 200rpx;
      height: 200rpx;
      flex-shrink: 0;
      border-radius: $rf-radius-sm;
      overflow: hidden;
    }

    .rf-product-card__body {
      flex: 1;
      min-width: 0;
      margin-left: $rf-gap-sm;
      display: flex;
      flex-direction: column;
    }

    .rf-product-card__title {
      font-size: $rf-font;
      line-height: 1.36;
    }

    .rf-product-card__subtitle {
      margin-top: 6rpx;
      font-size: 22rpx;
      color: $rf-text-secondary;
    }

    .rf-product-card__tags {
      margin-top: auto;
      padding-top: 8rpx;
    }

    .rf-product-card__footer {
      margin-top: 8rpx;
    }

    .rf-product-card__amount {
      font-size: 36rpx;
    }
  }
}
</style>
