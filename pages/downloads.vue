<template>
  <div class="w-full h-full overflow-y-auto pb-4" style="-webkit-overflow-scrolling: touch">
    <!-- Header -->
    <p class="text-xs font-semibold text-fg-muted uppercase tracking-wider px-4 pt-6 pb-2">{{ $strings.HeaderDownloads }} ({{ localLibraryItems.length }})</p>

    <!-- Empty state -->
    <div v-if="!localLibraryItems.length" class="flex flex-col items-center justify-center py-20 px-8 text-center">
      <span class="material-symbols text-5xl text-fg-muted/40 mb-4">download</span>
      <p class="text-base font-semibold text-fg mb-1">No downloads yet</p>
      <p class="text-sm text-fg-muted">Downloaded books will appear here for offline listening</p>
    </div>

    <!-- Download items -->
    <div v-else class="w-full space-y-3 pt-1">
      <template v-for="(mediaItem, num) in localLibraryItems">
        <nuxt-link :key="mediaItem.id" :to="`/localMedia/item/${mediaItem.id}`" class="bg-secondary rounded-xl p-3 mx-4 flex items-center gap-3 block">
          <!-- Cover thumbnail -->
          <div class="w-12 h-12 min-w-[48px] rounded-lg overflow-hidden bg-primary flex-shrink-0">
            <img v-if="mediaItem.coverPathSrc" :src="mediaItem.coverPathSrc" class="w-full h-full object-cover" />
            <div v-else class="w-full h-full flex items-center justify-center">
              <span class="material-symbols text-fg-muted">book</span>
            </div>
          </div>
          <!-- Info -->
          <div class="flex-grow min-w-0">
            <p class="text-sm font-semibold text-fg line-clamp-1">{{ mediaItem.media.metadata.title }}</p>
            <p v-if="mediaItem.mediaType == 'book'" class="text-xs text-fg-muted">{{ mediaItem.media.tracks.length }} {{ $strings.LabelTracks }}</p>
            <p v-else-if="mediaItem.mediaType == 'podcast'" class="text-xs text-fg-muted">{{ mediaItem.media.episodes.length }} {{ $strings.HeaderEpisodes }}</p>
            <p v-if="mediaItem.size" class="text-xs text-fg-muted">{{ $bytesPretty(mediaItem.size) }}</p>
          </div>
          <!-- Chevron -->
          <div class="flex-shrink-0">
            <span class="material-symbols text-xl text-fg-muted">chevron_right</span>
          </div>
        </nuxt-link>
      </template>

      <!-- Total size -->
      <div v-if="localLibraryItems.length" class="bg-secondary rounded-xl mx-4 p-3 flex items-center justify-between">
        <p class="text-xs text-fg-muted">{{ $strings.LabelTotalSize }}</p>
        <p class="text-xs font-semibold text-fg">{{ $bytesPretty(localLibraryItems.reduce((acc, item) => acc + item.size, 0)) }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { Capacitor } from '@capacitor/core'

export default {
  data() {
    return {
      localLibraryItems: []
    }
  },
  methods: {
    getSize(item) {
      if (!item || !item.localFiles) return 0
      let size = 0
      for (let i = 0; i < item.localFiles.length; i++) {
        size += item.localFiles[i].size
      }
      return size
    },
    newLocalLibraryItem(item) {
      if (!item) return
      const itemIndex = this.localLibraryItems.findIndex((li) => li.id === item.id)
      const newItemObj = {
        ...item,
        size: this.getSize(item),
        coverPathSrc: item.coverContentUrl ? Capacitor.convertFileSrc(item.coverContentUrl) : null
      }
      if (itemIndex >= 0) {
        this.localLibraryItems.splice(itemIndex, 1, newItemObj)
      } else {
        this.localLibraryItems.push(newItemObj)
      }
    },
    async init() {
      var items = (await this.$db.getLocalLibraryItems()) || []
      this.localLibraryItems = items.map((lmi) => {
        console.log('Local library item', JSON.stringify(lmi))
        return {
          ...lmi,
          size: this.getSize(lmi),
          coverPathSrc: lmi.coverContentUrl ? Capacitor.convertFileSrc(lmi.coverContentUrl) : null
        }
      })
    }
  },
  mounted() {
    this.$eventBus.$on('new-local-library-item', this.newLocalLibraryItem)
    this.init()
  },
  beforeDestroy() {
    this.$eventBus.$off('new-local-library-item', this.newLocalLibraryItem)
  }
}
</script>
