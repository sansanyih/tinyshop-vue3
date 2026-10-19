<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import RfNavbar from '@/components/RfNavbar.vue'
import RfProductCard from '@/components/RfProductCard.vue'
import RfSkeleton from '@/components/RfSkeleton.vue'
import RfEmpty from '@/components/RfEmpty.vue'
import { getProducts } from '@/api/product'
import { useAppStore } from '@/stores/app'
import type { Category, Product } from '@/types/model'

const appStore = useAppStore()

const activeId = ref<number>(0)
const products = ref<Product[]>([])
const loading = ref(true)

/** 当前一级分类 */
const activeCategory = computed<Category | undefined>(() =>
  appStore.categories.find((item) => item.id === activeId.value)
)

const subCategories = computed(() => activeCategory.value?.children ?? [])

async function loadProducts() {
  loading.value = true
  try {
    const result = await getProducts({ category_id: activeId.value, page: 1, page_size: 20 })
    products.value = result.list
  } finally {
    loading.value = false
  }
}

async function switchCategory(id: number) {
  if (activeId.value === id) return
  activeId.value = id
  await loadProducts()
}

onLoad(async (query) => {
  await appStore.ensureBaseData()
  const fromQuery = Number(query?.categoryId ?? 0)
  activeId.value = fromQuery || appStore.categories[0]?.id || 0
  await loadProducts()
})
</script>

<template>
  <view class="cate">
    <RfNavbar title="商品分类" :show-back="false" />

    <view class="cate__body">
      <!-- 左侧一级分类 -->
      <scroll-view class="cate__aside" scroll-y>
        <view
          v-for="item in appStore.categories"
          :key="item.id"
          class="cate__aside-item"
          :class="{ 'cate__aside-item--active': item.id === activeId }"
          @tap="switchCategory(item.id)"
        >
          <text>{{ item.name }}</text>
        </view>
      </scroll-view>

      <!-- 右侧内容 -->
      <scroll-view class="cate__main" scroll-y>
        <view class="cate__subs">
          <view v-for="sub in subCategories" :key="sub.id" class="cate__sub" hover-class="rf-hover">
            <text class="cate__sub-name">{{ sub.name }}</text>
          </view>
        </view>

        <RfSkeleton v-if="loading" :count="3" layout="row" />

        <template v-else>
          <view v-if="products.length" class="cate__list">
            <RfProductCard
              v-for="item in products"
              :key="item.id"
              :product="item"
              layout="row"
              :show-sales="false"
            />
          </view>
          <RfEmpty v-else text="该分类下暂无商品" />
        </template>
      </scroll-view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.cate {
  display: flex;
  flex-direction: column;
  height: 100vh;

  &__body {
    flex: 1;
    display: flex;
    overflow: hidden;
  }

  &__aside {
    width: 210rpx;
    flex-shrink: 0;
    background: #f5f6f8;
    height: 100%;
  }

  &__aside-item {
    position: relative;
    height: 100rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 26rpx;
    color: $rf-text-regular;
    white-space: nowrap;
    padding: 0 8rpx;

    &--active {
      background: #fff;
      color: $rf-primary;
      font-weight: 600;

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 30rpx;
        bottom: 30rpx;
        width: 6rpx;
        background: $rf-primary;
        border-radius: 0 6rpx 6rpx 0;
      }
    }
  }

  &__main {
    flex: 1 1 0;
    /* flex 子项必须允许收缩，否则 scroll-view 会被内容撑开导致右侧溢出 */
    min-width: 0;
    height: 100%;
    background: #fff;
    overflow: hidden;
  }

  &__subs {
    display: flex;
    flex-wrap: wrap;
    padding: $rf-gap-sm;
  }

  &__sub {
    width: 33.33%;
    padding: $rf-gap-xs 0;
    display: flex;
    justify-content: center;
  }

  &__sub-name {
    font-size: $rf-font-sm;
    color: $rf-text-regular;
    background: #f5f6f8;
    border-radius: 100rpx;
    padding: 8rpx 22rpx;
  }

  &__list {
    padding: 0 $rf-gap-sm $rf-gap;

    :deep(.rf-product-card) {
      margin-bottom: $rf-gap-sm;
    }
  }
}
</style>
