<script setup lang="ts">
import { ref } from 'vue'
import RfNavbar from '@/components/RfNavbar.vue'
import RfProductCard from '@/components/RfProductCard.vue'
import RfEmpty from '@/components/RfEmpty.vue'
import RfLoadMore from '@/components/RfLoadMore.vue'
import RfSkeleton from '@/components/RfSkeleton.vue'
import { getProducts } from '@/api/product'
import type { Product } from '@/types/model'

const HISTORY_KEY = 'rf_search_history'

const keyword = ref('')
const history = ref<string[]>([])
const products = ref<Product[]>([])
const searched = ref(false)
const loading = ref(false)
const page = ref(1)
const total = ref(0)
const loadStatus = ref<'idle' | 'loading' | 'noMore'>('idle')

function restoreHistory() {
  const cached = uni.getStorageSync(HISTORY_KEY)
  if (Array.isArray(cached)) history.value = cached as string[]
}

function saveHistory(word: string) {
  const next = [word, ...history.value.filter((item) => item !== word)].slice(0, 10)
  history.value = next
  uni.setStorageSync(HISTORY_KEY, next)
}

function clearHistory() {
  history.value = []
  uni.removeStorageSync(HISTORY_KEY)
}

async function search(reset = true) {
  const word = keyword.value.trim()
  if (!word) {
    uni.showToast({ title: '请输入关键词', icon: 'none' })
    return
  }
  if (reset) {
    page.value = 1
    total.value = 0
    loadStatus.value = 'idle'
  }
  if (loadStatus.value === 'loading') return
  loadStatus.value = 'loading'
  loading.value = true
  searched.value = true
  try {
    const result = await getProducts({ keyword: word, page: page.value, page_size: 10 })
    products.value = reset ? result.list : [...products.value, ...result.list]
    total.value = result.total
    page.value += 1
    loadStatus.value = products.value.length >= result.total ? 'noMore' : 'idle'
    saveHistory(word)
  } finally {
    loading.value = false
  }
}

function useHistory(word: string) {
  keyword.value = word
  search(true)
}

function loadMore() {
  if (loadStatus.value === 'noMore') return
  search(false)
}

restoreHistory()
</script>

<template>
  <view class="search">
    <RfNavbar :placeholder="false">
      <view class="search__bar">
        <text class="search__icon">🔍</text>
        <input
          v-model="keyword"
          class="search__input"
          type="text"
          placeholder="搜索商品 / 品牌"
          confirm-type="search"
          @confirm="search(true)"
        />
        <text v-if="keyword" class="search__clear" @tap="keyword = ''">✕</text>
      </view>
      <text class="search__btn" @tap="search(true)">搜索</text>
    </RfNavbar>

    <view class="search__body">
      <view v-if="!searched && history.length" class="search__history">
        <view class="search__history-head">
          <text class="search__history-title">搜索历史</text>
          <text class="search__history-clear" @tap="clearHistory">清空</text>
        </view>
        <view class="search__history-list">
          <text
            v-for="word in history"
            :key="word"
            class="search__history-item"
            @tap="useHistory(word)"
          >
            {{ word }}
          </text>
        </view>
      </view>

      <RfSkeleton v-if="loading && !products.length" :count="3" layout="row" />

      <template v-else>
        <view v-if="products.length" class="search__list">
          <view v-for="item in products" :key="item.id" class="search__row">
            <RfProductCard :product="item" />
          </view>
          <view v-if="loadStatus !== 'noMore'" class="search__more" @tap="loadMore">加载更多</view>
          <RfLoadMore :status="loadStatus" />
        </view>
        <RfEmpty v-else-if="searched" text="没有找到相关商品" />
      </template>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.search {
  min-height: 100vh;

  &__bar {
    flex: 1;
    display: flex;
    align-items: center;
    height: 64rpx;
    padding: 0 $rf-gap-sm;
    background: #f5f6f8;
    border-radius: 100rpx;
  }

  &__icon {
    font-size: $rf-font-sm;
    margin-right: 8rpx;
  }

  &__input {
    flex: 1;
    font-size: $rf-font-sm;
    color: $rf-text;
  }

  &__clear {
    color: $rf-text-secondary;
    font-size: $rf-font-sm;
    padding: 0 8rpx;
  }

  &__btn {
    font-size: $rf-font;
    color: $rf-primary;
    margin-left: $rf-gap-sm;
  }

  &__body {
    padding: $rf-gap;
  }

  &__history-head {
    display: flex;
    justify-content: space-between;
    margin-bottom: $rf-gap-sm;
  }

  &__history-title {
    font-size: $rf-font-sm;
    color: $rf-text-regular;
    font-weight: 600;
  }

  &__history-clear {
    font-size: $rf-font-sm;
    color: $rf-text-secondary;
  }

  &__history-list {
    display: flex;
    flex-wrap: wrap;
  }

  &__history-item {
    font-size: $rf-font-sm;
    color: $rf-text-regular;
    background: #fff;
    border-radius: 100rpx;
    padding: 10rpx 26rpx;
    margin: 0 $rf-gap-sm $rf-gap-sm 0;
  }

  &__list {
    :deep(.rf-product-card) {
      margin-bottom: $rf-gap-sm;
    }
  }

  &__more {
    text-align: center;
    font-size: $rf-font-sm;
    color: $rf-text-secondary;
    padding: $rf-gap-sm 0;
  }
}
</style>
