<script setup lang="ts">
import { onLaunch, onShow } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user'
import { useCartStore } from '@/stores/cart'

onLaunch(() => {
  // 冷启动时恢复本地登录态与购物车，保证刷新/直达页面时数据不丢
  useUserStore().restore()
  useCartStore().restore()
  console.log('[app] launched')
})

onShow(() => {
  console.log('[app] show')
})
</script>

<style lang="scss">
/* ---------- 全局基础样式 ---------- */
page {
  background-color: $rf-page-bg;
  color: $rf-text;
  font-size: $rf-font;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'PingFang SC', 'Hiragino Sans GB',
    'Microsoft YaHei', sans-serif;
  line-height: 1.5;
}

view,
text,
image,
scroll-view,
swiper {
  box-sizing: border-box;
}

image {
  display: block;
  will-change: transform;
}

/* ---------- 通用工具类 ---------- */
.rf-flex {
  display: flex;
  align-items: center;
}

.rf-flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.rf-ellipsis {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.rf-ellipsis-2 {
  display: -webkit-box;
  overflow: hidden;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.rf-price {
  color: $rf-primary;
  font-weight: 600;

  &__symbol {
    font-size: $rf-font-sm;
  }
}

.rf-safe-bottom {
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}

/* 点击态 */
.rf-hover {
  opacity: 0.75;
}
</style>
