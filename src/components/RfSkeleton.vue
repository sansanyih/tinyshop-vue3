<script setup lang="ts">
interface Props {
  /** 骨架数量 */
  count?: number
  /** 布局：瀑布流卡片 / 列表行 */
  layout?: 'card' | 'row'
}

const props = withDefaults(defineProps<Props>(), {
  count: 4,
  layout: 'card'
})
</script>

<template>
  <view class="rf-skeleton" :class="`rf-skeleton--${props.layout}`">
    <view v-for="index in props.count" :key="index" class="rf-skeleton__item">
      <view class="rf-skeleton__thumb" />
      <view class="rf-skeleton__lines">
        <view class="rf-skeleton__line" />
        <view class="rf-skeleton__line rf-skeleton__line--short" />
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
@keyframes rf-shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.rf-skeleton {
  &--card {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    padding: 0 $rf-gap;

    .rf-skeleton__item {
      width: 48.5%;
      margin-bottom: $rf-gap-sm;
    }

    .rf-skeleton__thumb {
      width: 100%;
      height: 320rpx;
    }
  }

  &--row {
    padding: 0 $rf-gap;

    .rf-skeleton__item {
      display: flex;
      margin-bottom: $rf-gap-sm;
      background: #fff;
      border-radius: $rf-radius;
      padding: $rf-gap-sm;
    }

    .rf-skeleton__thumb {
      width: 180rpx;
      height: 180rpx;
      flex-shrink: 0;
      margin-right: $rf-gap-sm;
    }

    .rf-skeleton__lines {
      flex: 1;
    }
  }

  &__thumb,
  &__line {
    border-radius: $rf-radius-sm;
    background: linear-gradient(90deg, #f2f3f5 25%, #e9ebef 37%, #f2f3f5 63%);
    background-size: 200% 100%;
    animation: rf-shimmer 1.4s ease infinite;
  }

  &__line {
    height: 28rpx;
    margin-bottom: 16rpx;

    &--short {
      width: 55%;
    }
  }
}
</style>
