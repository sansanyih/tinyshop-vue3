<script setup lang="ts">
interface Props {
  modelValue: number
  min?: number
  max?: number
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  min: 1,
  max: 99,
  disabled: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void
  (e: 'change', value: number): void
}>()

function update(next: number) {
  const value = Math.max(props.min, Math.min(next, props.max))
  emit('update:modelValue', value)
  emit('change', value)
}

function handleMinus() {
  if (props.disabled) return
  update(props.modelValue - 1)
}

function handlePlus() {
  if (props.disabled) return
  update(props.modelValue + 1)
}

function handleInput(event: unknown) {
  const raw = (event as { detail?: { value?: string | number } })?.detail?.value
  const parsed = Number(raw)
  update(Number.isFinite(parsed) && parsed > 0 ? parsed : props.min)
}
</script>

<template>
  <view class="rf-number-box">
    <view
      class="rf-number-box__btn"
      :class="{ 'rf-number-box__btn--disabled': props.modelValue <= props.min || props.disabled }"
      @tap="handleMinus"
    >
      −
    </view>
    <input
      class="rf-number-box__input"
      type="number"
      :value="String(props.modelValue)"
      :disabled="props.disabled"
      @blur="handleInput"
    />
    <view
      class="rf-number-box__btn"
      :class="{ 'rf-number-box__btn--disabled': props.modelValue >= props.max || props.disabled }"
      @tap="handlePlus"
    >
      +
    </view>
  </view>
</template>

<style lang="scss" scoped>
.rf-number-box {
  display: flex;
  align-items: center;

  &__btn {
    width: 52rpx;
    height: 52rpx;
    line-height: 50rpx;
    text-align: center;
    background: #f5f6f8;
    border-radius: 8rpx;
    font-size: 32rpx;
    color: $rf-text;

    &--disabled {
      color: $rf-text-placeholder;
    }
  }

  &__input {
    width: 76rpx;
    height: 52rpx;
    text-align: center;
    font-size: $rf-font;
    margin: 0 6rpx;
  }
}
</style>
