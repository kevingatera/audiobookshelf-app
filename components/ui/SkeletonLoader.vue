<template>
  <div class="animate-pulse">
    <slot>
      <div class="bg-bg rounded-xl" :style="{ width, height }"></div>
    </slot>
  </div>
</template>
<script>
export default {
  props: {
    width: { type: String, default: '100%' },
    height: { type: String, default: '1rem' }
  }
}
</script>
