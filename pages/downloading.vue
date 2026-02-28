<template>
  <div class="w-full h-full overflow-y-auto pb-4" style="-webkit-overflow-scrolling: touch">
    <!-- Header -->
    <p class="text-xs font-semibold text-fg-muted uppercase tracking-wider px-4 pt-6 pb-2">{{ $strings.HeaderDownloads }} ({{ downloadItemParts.length }})</p>

    <!-- Empty state -->
    <div v-if="!downloadItemParts.length" class="flex flex-col items-center justify-center py-20 px-8 text-center">
      <span class="material-symbols text-5xl text-fg-muted/40 mb-3">cloud_download</span>
      <p class="text-sm text-fg-muted">No active downloads</p>
    </div>

    <!-- Active downloads -->
    <div v-else class="space-y-3 pt-1">
      <template v-for="(itemPart, num) in downloadItemParts">
        <div :key="itemPart.id" class="bg-secondary rounded-xl p-3 mx-4">
          <div class="flex items-center gap-3">
            <!-- Status icon -->
            <div class="flex-shrink-0 w-10 flex items-center justify-center">
              <span v-if="itemPart.completed" class="material-symbols text-success text-xl">check_circle</span>
              <span v-else class="text-sm font-semibold text-accent">{{ Math.round(itemPart.progress) }}%</span>
            </div>
            <!-- Filename -->
            <div class="flex-grow min-w-0">
              <p class="text-sm text-fg break-all line-clamp-2">{{ itemPart.filename }}</p>
            </div>
          </div>
          <!-- Progress bar -->
          <div v-if="!itemPart.completed" class="mt-2 h-1 bg-bg rounded-full overflow-hidden">
            <div class="bg-accent rounded-full h-full transition-all duration-300" :style="{ width: Math.round(itemPart.progress) + '%' }"></div>
          </div>
          <p v-if="!itemPart.completed" class="text-xs text-fg-muted mt-1">Downloading...</p>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {}
  },
  computed: {
    downloadItems() {
      return this.$store.state.globals.itemDownloads
    },
    downloadItemParts() {
      let parts = []
      this.downloadItems.forEach((di) => parts.push(...di.downloadItemParts))
      return parts
    }
  },
  mounted() {},
  beforeDestroy() {}
}
</script>
