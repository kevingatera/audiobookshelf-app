<template>
  <div class="w-full h-full">
    <div id="bookshelf-wrapper" class="w-full h-full overflow-y-auto overflow-x-hidden relative">
      <home-bookshelf-toolbar v-show="!hideToolbar" class="sticky top-0 z-10" />
      <nuxt-child />
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {}
  },
  computed: {
    hideToolbar() {
      return this.isHome || this.isLatest || this.isPodcastSearch
    },
    isHome() {
      return this.$route.name === 'bookshelf'
    },
    isLatest() {
      return this.$route.name === 'bookshelf-latest'
    },
    isPodcastSearch() {
      return this.$route.name === 'bookshelf-add-podcast'
    }
  }
}
</script>