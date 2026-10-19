<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import RfNavbar from '@/components/RfNavbar.vue'
import RfEmpty from '@/components/RfEmpty.vue'
import { createAddress, getAddressList } from '@/api/user'
import { useUserStore } from '@/stores/user'
import { maskMobile } from '@/utils/format'
import type { Address } from '@/types/model'

const SELECTED_KEY = 'rf_selected_address'

const userStore = useUserStore()

const list = ref<Address[]>([])
const loading = ref(true)
const formVisible = ref(false)
const submitting = ref(false)

const form = ref({ name: '', mobile: '', region: '', detail: '' })

async function loadList() {
  if (!userStore.isLogin) return
  loading.value = true
  try {
    list.value = await getAddressList()
  } finally {
    loading.value = false
  }
}

onLoad(() => {
  if (!userStore.isLogin) {
    uni.redirectTo({ url: `/pages/account/login?redirect=${encodeURIComponent('/pages/account/address')}` })
    return
  }
  loadList()
})

/** 选中地址后写缓存，确认订单页 onShow 时读取 */
function choose(address: Address) {
  uni.setStorageSync(SELECTED_KEY, JSON.stringify(address))
  uni.navigateBack({ delta: 1 })
}

function openForm() {
  form.value = { name: '', mobile: '', region: '', detail: '' }
  formVisible.value = true
}

async function save() {
  if (submitting.value) return
  const { name, mobile, region, detail } = form.value
  if (!name.trim()) return uni.showToast({ title: '请填写收货人', icon: 'none' })
  if (!/^1\d{10}$/.test(mobile)) return uni.showToast({ title: '请填写正确的手机号', icon: 'none' })
  if (!region.trim()) return uni.showToast({ title: '请填写所在地区', icon: 'none' })
  if (!detail.trim()) return uni.showToast({ title: '请填写详细地址', icon: 'none' })

  submitting.value = true
  try {
    const created = await createAddress({ name, mobile, region, detail })
    list.value.push(created)
    formVisible.value = false
    uni.showToast({ title: '已保存', icon: 'success' })
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <view class="addr">
    <RfNavbar title="收货地址" />

    <view class="addr__body">
      <view
        v-for="item in list"
        :key="item.id"
        class="addr__card"
        hover-class="rf-hover"
        @tap="choose(item)"
      >
        <view class="addr__card-top">
          <text class="addr__name">{{ item.name }}</text>
          <text class="addr__mobile">{{ maskMobile(item.mobile) }}</text>
          <text v-if="item.isDefault" class="addr__tag">默认</text>
        </view>
        <text class="addr__detail">{{ item.region }} {{ item.detail }}</text>
      </view>

      <RfEmpty v-if="!loading && !list.length" icon="📍" text="还没有收货地址" />
    </view>

    <view class="addr__foot rf-safe-bottom">
      <view class="addr__add" hover-class="rf-hover" @tap="openForm">+ 新增收货地址</view>
    </view>

    <!-- 新增地址表单 -->
    <view v-if="formVisible" class="addr__mask" @tap="formVisible = false" />
    <view v-if="formVisible" class="addr__sheet">
      <view class="addr__sheet-head">
        <text class="addr__sheet-title">新增收货地址</text>
        <text class="addr__sheet-close" @tap="formVisible = false">✕</text>
      </view>

      <view class="addr__field">
        <text class="addr__field-label">收货人</text>
        <input v-model="form.name" class="addr__field-input" placeholder="请填写姓名" maxlength="20" />
      </view>
      <view class="addr__field">
        <text class="addr__field-label">手机号</text>
        <input
          v-model="form.mobile"
          class="addr__field-input"
          type="number"
          placeholder="请填写手机号"
          maxlength="11"
        />
      </view>
      <view class="addr__field">
        <text class="addr__field-label">所在地区</text>
        <input v-model="form.region" class="addr__field-input" placeholder="省 / 市 / 区" />
      </view>
      <view class="addr__field">
        <text class="addr__field-label">详细地址</text>
        <input v-model="form.detail" class="addr__field-input" placeholder="街道、门牌号" />
      </view>

      <view class="addr__save" hover-class="rf-hover" @tap="save">
        {{ submitting ? '保存中…' : '保存并使用' }}
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.addr {
  min-height: 100vh;
  padding-bottom: 180rpx;

  &__body {
    padding: $rf-gap;
  }

  &__card {
    background: #fff;
    border-radius: $rf-radius;
    padding: $rf-gap;
    margin-bottom: $rf-gap-sm;
    box-shadow: 0 2rpx 12rpx rgba(17, 24, 39, 0.04);
  }

  &__card-top {
    display: flex;
    align-items: center;
  }

  &__name {
    font-size: $rf-font-lg;
    font-weight: 600;
    color: $rf-text;
  }

  &__mobile {
    margin-left: $rf-gap-sm;
    font-size: $rf-font-sm;
    color: $rf-text-secondary;
  }

  &__tag {
    margin-left: $rf-gap-xs;
    font-size: 20rpx;
    color: #fff;
    background: $rf-primary;
    border-radius: 4rpx;
    padding: 0 8rpx;
  }

  &__detail {
    display: block;
    margin-top: 10rpx;
    font-size: $rf-font-sm;
    color: $rf-text-regular;
    line-height: 1.5;
  }

  &__foot {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    padding: $rf-gap $rf-gap-sm;
    background: #fff;
    box-shadow: 0 -2rpx 16rpx rgba(0, 0, 0, 0.05);
  }

  &__add {
    height: 84rpx;
    line-height: 84rpx;
    text-align: center;
    border-radius: 100rpx;
    background: linear-gradient(90deg, #ff7d99, #fa436a);
    color: #fff;
    font-size: $rf-font;
    font-weight: 600;
  }

  &__mask {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    z-index: 40;
  }

  &__sheet {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    background: #fff;
    border-radius: $rf-radius-lg $rf-radius-lg 0 0;
    padding: $rf-gap;
    z-index: 50;
  }

  &__sheet-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: $rf-gap-sm;
  }

  &__sheet-title {
    font-size: $rf-font-lg;
    font-weight: 600;
  }

  &__sheet-close {
    color: $rf-text-placeholder;
  }

  &__field {
    display: flex;
    align-items: center;
    height: 96rpx;
    border-bottom: 1rpx solid $rf-border;
  }

  &__field-label {
    width: 156rpx;
    font-size: $rf-font;
    color: $rf-text-regular;
  }

  &__field-input {
    flex: 1;
    font-size: $rf-font;
    color: $rf-text;
  }

  &__save {
    margin-top: $rf-gap;
    height: 88rpx;
    line-height: 88rpx;
    text-align: center;
    border-radius: 100rpx;
    background: linear-gradient(90deg, #ff7d99, #fa436a);
    color: #fff;
    font-size: $rf-font;
  }
}
</style>
