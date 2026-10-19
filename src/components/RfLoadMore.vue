<script setup lang="ts">
interface Props {
  /** loading | noMore | idle */
  status?: 'loading' | 'noMore' | 'idle'
  noMoreText?: string
}

const props = withDefaults(defineProps<Props>(), {
  status: 'idle',
  noMoreText: '没有更多了'
})
</script>

<template>
  <view class="rf-load-more">
    <template v-if="props.status === 'loading'">
      <view class="rf-load-more__dot" />
      <text class="rf-load-more__text">加载中…</text>
    </template>
    <text v-else-if="props.status === 'noMore'" class="rf-load-more__text">{{ props.noMoreText }}</text>
  </view>
</template>

<style lang="scss" scoped>
.rf-load-more {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 88rpx;

  &__text {
    font-size: $rf-font-sm;
    color: $rf-text-secondary;
  }

  &__dot {
    width: 28rpx;
    height: 28rpx;
    margin-right: 12rpx;
    border: 3rpx solid rgba(250, 67, 106, 0.25);
    border-top-color: $rf-primary;
    border-radius: 50%;
    animation: rf-rotate 0.8s linear infinite;
  }
}

@keyframes rf-rotate {
  to {
    transform: rotate(360deg);
  }
}
</style>
