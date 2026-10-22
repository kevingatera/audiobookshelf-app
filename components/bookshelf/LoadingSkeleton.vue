<template>
  <div class="w-full pt-4" role="status" aria-busy="true">
    <span class="sr-only">{{ $strings.MessageLoading }}</span>
    <div v-for="shelf in 2" :key="shelf" class="pb-6">
      <div class="h-4 w-32 mx-5 mb-3 rounded bg-fg/10" />
      <div class="flex items-end px-3 overflow-hidden" style="height: 200px">
        <div v-for="book in 6" :key="book" class="mx-2 shrink-0 rounded-card bg-fg/10" :style="{ width: coverWidth + 'px', height: coverHeight + 'px' }" />
      </div>
    </div>
  </div>
</template>

<script>
// Sizes match components/bookshelf/Shelf.vue so the real shelves do not jump when they load.
export default {
  computed: {
    isSquareCover() {
      return this.$store.getters['libraries/getBookCoverAspectRatio'] === 1
    },
    coverWidth() {
      return this.isSquareCover ? 160 : 100
    },
    coverHeight() {
      return 160
    }
  }
}
</script>
