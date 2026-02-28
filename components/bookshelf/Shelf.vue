<template>
  <div class="w-full relative">
    <div v-if="useModernView" class="flex items-center justify-between px-4 py-3">
      <p class="text-fg text-base font-semibold">{{ label }}</p>
      <nuxt-link v-if="hasMoreItems" :to="seeAllRoute" class="text-accent text-sm">See All &gt;</nuxt-link>
    </div>

    <div v-if="useModernView" class="flex gap-3 overflow-x-auto px-4 pb-4 scrollbar-hide" :style="{ height: shelfHeight + 'px', paddingBottom: entityPaddingBottom + 'px', scrollSnapType: 'x mandatory', '-webkit-overflow-scrolling': 'touch' }">
      <template v-for="(entity, index) in entities">
        <cards-lazy-book-card v-if="type === 'book' || type === 'podcast'" :key="entity.id" :index="index" :book-mount="entity" :width="bookWidth" :height="entityHeight" :book-cover-aspect-ratio="bookCoverAspectRatio" :is-alt-view-enabled="true" class="relative flex-shrink-0" style="scroll-snap-align: start" />
        <cards-lazy-book-card v-if="type === 'episode'" :key="entity.recentEpisode.id" :index="index" :book-mount="entity" :width="bookWidth" :height="entityHeight" :book-cover-aspect-ratio="bookCoverAspectRatio" :is-alt-view-enabled="true" class="relative flex-shrink-0" style="scroll-snap-align: start" />
        <cards-lazy-series-card v-else-if="type === 'series'" :key="entity.id" :index="index" :series-mount="entity" :width="bookWidth * 2" :height="entityHeight" :book-cover-aspect-ratio="bookCoverAspectRatio" :is-alt-view-enabled="true" is-categorized class="relative flex-shrink-0" style="scroll-snap-align: start" />
        <cards-author-card v-else-if="type === 'authors'" :key="entity.id" :width="bookWidth / 1.25" :height="bookWidth" :author="entity" :size-multiplier="1" class="flex-shrink-0" style="scroll-snap-align: start" />
      </template>
    </div>

    <div v-if="!useModernView" class="flex items-end px-3 max-w-full overflow-x-auto bookshelfRow" :style="{ height: shelfHeight + 'px', paddingBottom: entityPaddingBottom + 'px' }">
      <template v-for="(entity, index) in entities">
        <cards-lazy-book-card v-if="type === 'book' || type === 'podcast'" :key="entity.id" :index="index" :book-mount="entity" :width="bookWidth" :height="entityHeight" :book-cover-aspect-ratio="bookCoverAspectRatio" :is-alt-view-enabled="false" class="mx-2 relative" />
        <cards-lazy-book-card v-if="type === 'episode'" :key="entity.recentEpisode.id" :index="index" :book-mount="entity" :width="bookWidth" :height="entityHeight" :book-cover-aspect-ratio="bookCoverAspectRatio" :is-alt-view-enabled="false" class="mx-2 relative" />
        <cards-lazy-series-card v-else-if="type === 'series'" :key="entity.id" :index="index" :series-mount="entity" :width="bookWidth * 2" :height="entityHeight" :book-cover-aspect-ratio="bookCoverAspectRatio" :is-alt-view-enabled="false" is-categorized class="mx-2 relative" />
        <cards-author-card v-else-if="type === 'authors'" :key="entity.id" :width="bookWidth / 1.25" :height="bookWidth" :author="entity" :size-multiplier="1" class="mx-2" />
      </template>
    </div>

    <div v-if="useModernView" class="border-b border-warm"></div>

    <div v-if="!useModernView" class="absolute text-center categoryPlacardtransform z-30 bottom-0.5 left-4 md:left-8 w-36 rounded-md" style="height: 18px">
      <div class="w-full h-full flex items-center justify-center rounded-sm border shinyBlack">
        <p class="transform text-xs">{{ label }}</p>
      </div>
    </div>
    <div v-if="!useModernView" class="w-full h-5 z-40 bookshelfDivider"></div>
  </div>
</template>

<script>
export default {
  props: {
    label: String,
    type: String,
    entities: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      visibleCount: 3,
      classicShelfMode: false
    }
  },
  computed: {
    useModernView() {
      // Modern (alt) view is shown when altView is enabled AND classic mode is OFF
      if (this.classicShelfMode) return false
      return this.altViewEnabled
    },
    entityPaddingBottom() {
      if (this.useModernView) return 0
      if (!this.useModernView && !this.altViewEnabled) return 0
      if (this.type === 'authors') return 10
      else if (this.type === 'series') return 40
      return 60 * this.sizeMultiplier
    },
    shelfHeight() {
      if (this.useModernView) {
        var extraTitleSpace = this.type === 'authors' ? 10 : this.type === 'series' ? 50 : 60
        return this.entityHeight + extraTitleSpace * this.sizeMultiplier
      }
      return this.entityHeight + 40
    },
    bookWidth() {
      var coverSize = 100
      if (this.isCoverSquareAspectRatio) return coverSize * 1.6
      return coverSize
    },
    bookHeight() {
      if (this.isCoverSquareAspectRatio) return this.bookWidth
      return this.bookWidth * 1.6
    },
    entityHeight() {
      return this.bookHeight
    },
    sizeMultiplier() {
      var baseSize = this.isCoverSquareAspectRatio ? 192 : 120
      return this.bookWidth / baseSize
    },
    isCoverSquareAspectRatio() {
      return this.bookCoverAspectRatio === 1
    },
    bookCoverAspectRatio() {
      return this.$store.getters['libraries/getBookCoverAspectRatio']
    },
    altViewEnabled() {
      return this.$store.getters['getAltViewEnabled']
    },
    hasMoreItems() {
      return this.entities.length > this.visibleCount
    },
    seeAllRoute() {
      if (this.type === 'series') return '/bookshelf/series'
      if (this.type === 'authors') return '/bookshelf/library?filter=authors'
      return '/bookshelf'
    }
  },
  methods: {
    async loadClassicShelfMode() {
      this.classicShelfMode = (await this.$localStore.getClassicShelfMode()) || false
    }
  },
  mounted() {
    this.loadClassicShelfMode()
  }
}
</script>
