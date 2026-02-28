<template>
  <div class="flex-shrink-0" :style="{ width: width + 'px' }">
    <div class="bg-bg rounded-xl animate-pulse" :style="{ width: width + 'px', height: height + 'px' }"></div>
    <div class="px-2 pt-1.5 pb-2 space-y-1.5">
      <div class="bg-bg rounded h-3 w-3/4 animate-pulse"></div>
      <div class="bg-bg rounded h-2.5 w-1/2 animate-pulse"></div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    width: { type: Number, default: 100 },
    height: { type: Number, default: 160 }
  }
}
</script>
