<script setup lang="ts">
interface Props {
  text?: string
  /** 图标字符，避免依赖图片资源 */
  icon?: string
  showButton?: boolean
  buttonText?: string
}

const props = withDefaults(defineProps<Props>(), {
  text: '暂无数据',
  icon: '📭',
  showButton: false,
  buttonText: '去逛逛'
})

const emit = defineEmits<{ (e: 'action'): void }>()
</script>

<template>
  <view class="rf-empty">
    <text class="rf-empty__icon">{{ props.icon }}</text>
    <text class="rf-empty__text">{{ props.text }}</text>
    <view
      v-if="props.showButton"
      class="rf-empty__btn"
      hover-class="rf-hover"
      @tap="emit('action')"
    >
      {{ props.buttonText }}
    </view>
  </view>
</template>

<style lang="scss" scoped>
.rf-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;

  &__icon {
    font-size: 96rpx;
    opacity: 0.55;
  }

  &__text {
    margin-top: $rf-gap-sm;
    font-size: $rf-font;
    color: $rf-text-secondary;
  }

  &__btn {
    margin-top: $rf-gap-lg;
    padding: 0 56rpx;
    height: 68rpx;
    line-height: 68rpx;
    border-radius: 100rpx;
    background: $rf-primary;
    color: #fff;
    font-size: $rf-font;
  }
}
</style>
