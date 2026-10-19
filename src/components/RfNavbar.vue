<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  title?: string
  /** 是否固定顶部 */
  fixed?: boolean
  /** 是否显示返回按钮 */
  showBack?: boolean
  /** 背景透明（用于图片上覆盖） */
  transparent?: boolean
  /** 是否插入等高占位，避免内容被遮挡 */
  placeholder?: boolean
  background?: string
  color?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  fixed: true,
  showBack: true,
  transparent: false,
  placeholder: true,
  background: '#ffffff',
  color: '#303133'
})

const emit = defineEmits<{ (e: 'back'): void }>()

const systemInfo = uni.getSystemInfoSync()
const statusBarHeight = systemInfo.statusBarHeight ?? 20
const NAV_HEIGHT = 44
const totalHeight = computed(() => statusBarHeight + NAV_HEIGHT)

function handleBack() {
  emit('back')
  const pages = getCurrentPages()
  if (pages.length > 1) {
    uni.navigateBack({ delta: 1 })
  } else {
    uni.switchTab({ url: '/pages/index/index' })
  }
}
</script>

<template>
  <view v-if="props.fixed && props.placeholder" :style="{ height: totalHeight + 'px' }" />
  <view
    class="rf-navbar"
    :class="{ 'rf-navbar--fixed': props.fixed, 'rf-navbar--transparent': props.transparent }"
    :style="{
      height: totalHeight + 'px',
      paddingTop: statusBarHeight + 'px',
      background: props.transparent ? 'transparent' : props.background,
      color: props.color
    }"
  >
    <view class="rf-navbar__inner">
      <view v-if="props.showBack" class="rf-navbar__back" hover-class="rf-hover" @tap="handleBack">
        <text class="rf-navbar__back-icon">‹</text>
      </view>
      <view class="rf-navbar__body">
        <slot>
          <text class="rf-navbar__title">{{ props.title }}</text>
        </slot>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.rf-navbar {
  width: 100%;
  box-sizing: content-box;

  &--fixed {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 999;
  }

  &--transparent {
    background: transparent !important;
  }

  &__inner {
    display: flex;
    align-items: center;
    height: 44px;
    padding: 0 $rf-gap;
    position: relative;
  }

  &__back {
    width: 56rpx;
    height: 56rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    left: $rf-gap-sm;
  }

  &__back-icon {
    font-size: 52rpx;
    line-height: 1;
    font-weight: 300;
  }

  &__body {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__title {
    font-size: $rf-font-lg;
    font-weight: 600;
    max-width: 400rpx;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
}
</style>
