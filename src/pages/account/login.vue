<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import RfNavbar from '@/components/RfNavbar.vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const mobile = ref('')
const code = ref('')
const submitting = ref(false)
const redirect = ref('')
const countdown = ref(0)

let timer: ReturnType<typeof setInterval> | null = null

const canSubmit = computed(
  () => /^1\d{10}$/.test(mobile.value) && code.value.length === 6 && !submitting.value
)

onLoad((query) => {
  redirect.value = query?.redirect ? decodeURIComponent(query.redirect) : ''
})

function sendCode() {
  if (!/^1\d{10}$/.test(mobile.value)) {
    uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
    return
  }
  if (countdown.value > 0) return
  countdown.value = 60
  uni.showToast({ title: '演示验证码：123456', icon: 'none' })
  timer = setInterval(() => {
    countdown.value -= 1
    if (countdown.value <= 0 && timer) {
      clearInterval(timer)
      timer = null
    }
  }, 1000)
}

/** tabBar 页面必须走 switchTab，普通页面走 redirectTo */
const TAB_PAGES = [
  '/pages/index/index',
  '/pages/category/category',
  '/pages/cart/cart',
  '/pages/user/profile'
]

function afterLogin() {
  const target = redirect.value || '/pages/user/profile'
  if (TAB_PAGES.includes(target)) {
    uni.switchTab({ url: target })
  } else {
    uni.redirectTo({ url: target })
  }
}

async function submit() {
  if (!canSubmit.value) {
    uni.showToast({ title: '请填写手机号与验证码', icon: 'none' })
    return
  }
  submitting.value = true
  try {
    await userStore.login(mobile.value, code.value)
    uni.showToast({ title: '登录成功', icon: 'success' })
    setTimeout(afterLogin, 400)
  } catch (error) {
    /* 错误提示已由请求层统一处理 */
  } finally {
    submitting.value = false
  }
}

function skip() {
  uni.navigateBack({ delta: 1 })
}
</script>

<template>
  <view class="login">
    <RfNavbar title="登录" background="#ffffff" />

    <view class="login__head">
      <view class="login__logo">🛍️</view>
      <text class="login__title">欢迎回来</text>
      <text class="login__sub">登录后同步购物车、订单与优惠券</text>
    </view>

    <view class="login__form">
      <view class="login__field">
        <text class="login__label">手机号</text>
        <input
          v-model="mobile"
          class="login__input"
          type="number"
          maxlength="11"
          placeholder="请输入手机号"
          placeholder-class="login__placeholder"
        />
      </view>

      <view class="login__field">
        <text class="login__label">验证码</text>
        <input
          v-model="code"
          class="login__input"
          type="number"
          maxlength="6"
          placeholder="请输入 6 位验证码"
          placeholder-class="login__placeholder"
        />
        <text class="login__code" :class="{ 'login__code--disabled': countdown > 0 }" @tap="sendCode">
          {{ countdown > 0 ? `${countdown}s 后重发` : '获取验证码' }}
        </text>
      </view>
    </view>

    <view
      class="login__submit"
      :class="{ 'login__submit--disabled': !canSubmit }"
      hover-class="rf-hover"
      @tap="submit"
    >
      {{ submitting ? '登录中…' : '登录' }}
    </view>

    <text class="login__tip">演示环境：任意手机号 + 验证码 123456</text>
    <text class="login__skip" @tap="skip">暂不登录，先逛逛</text>
  </view>
</template>

<style lang="scss" scoped>
.login {
  min-height: 100vh;
  background: #fff;

  &__head {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 56rpx 0 32rpx;
  }

  &__logo {
    font-size: 88rpx;
  }

  &__title {
    margin-top: $rf-gap-sm;
    font-size: 44rpx;
    font-weight: 700;
    color: $rf-text;
  }

  &__sub {
    margin-top: 10rpx;
    font-size: $rf-font-sm;
    color: $rf-text-secondary;
  }

  &__form {
    padding: 0 $rf-gap-lg;
  }

  &__field {
    display: flex;
    align-items: center;
    height: 108rpx;
    border-bottom: 1rpx solid $rf-border;
  }

  &__label {
    width: 132rpx;
    font-size: $rf-font;
    color: $rf-text;
  }

  &__input {
    flex: 1;
    font-size: $rf-font;
    color: $rf-text;
  }

  &__placeholder {
    color: $rf-text-placeholder;
  }

  &__code {
    font-size: $rf-font-sm;
    color: $rf-primary;
    padding-left: $rf-gap-sm;

    &--disabled {
      color: $rf-text-placeholder;
    }
  }

  &__submit {
    margin: $rf-gap-lg $rf-gap-lg 0;
    height: 92rpx;
    line-height: 92rpx;
    text-align: center;
    border-radius: 100rpx;
    background: linear-gradient(90deg, #ff7d99, #fa436a);
    color: #fff;
    font-size: $rf-font-lg;
    font-weight: 600;

    &--disabled {
      background: #ffd0da;
    }
  }

  &__tip {
    display: block;
    margin-top: $rf-gap;
    text-align: center;
    font-size: $rf-font-xs;
    color: $rf-text-secondary;
  }

  &__skip {
    display: block;
    margin-top: $rf-gap-lg;
    text-align: center;
    font-size: $rf-font-sm;
    color: $rf-text-secondary;
  }
}
</style>
