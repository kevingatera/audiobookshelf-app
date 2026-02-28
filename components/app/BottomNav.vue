<template>
  <transition name="slide-up">
    <nav v-show="show" class="bottom-nav" role="navigation" aria-label="Main navigation">
      <nuxt-link
        v-for="tab in tabs"
        :key="tab.route"
        :to="tab.route"
        class="bottom-nav-item"
        :class="{ active: isActive(tab) }"
        :aria-label="tab.label"
      >
        <span class="material-symbols" :class="{ fill: isActive(tab) }" style="font-size: 1.5rem">
          {{ tab.icon }}
        </span>
        <span v-if="tab.badge" class="absolute top-2 ml-5 w-1.5 h-1.5 rounded-full bg-accent" />
        <span class="nav-label">{{ tab.label }}</span>
      </nuxt-link>
    </nav>
  </transition>
</template>

<script>
export default {
  props: {
    show: {
      type: Boolean,
      default: true
    },
    hasActiveDownloads: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    currentLibrary() {
      return this.$store.getters['libraries/getCurrentLibrary']
    },
    isPodcastLibrary() {
      return this.currentLibrary?.mediaType === 'podcast'
    },
    libraryIcon() {
      return this.isPodcastLibrary ? 'podcasts' : 'local_library'
    },
    tabs() {
      return [
        { label: 'Home', icon: 'home', route: '/bookshelf' },
        { label: 'Library', icon: this.libraryIcon, route: '/bookshelf/library' },
        { label: 'Search', icon: 'search', route: '/search' },
        { label: 'Downloads', icon: 'download', route: '/downloads', badge: this.hasActiveDownloads },
        { label: 'More', icon: 'more_horiz', route: '/settings' }
      ]
    }
  },
  methods: {
    isActive(tab) {
      const path = this.$route.path
      // Exact match for Home to avoid matching all /bookshelf/* routes
      if (tab.route === '/bookshelf') {
        return path === '/bookshelf' || path === '/'
      }
      return path.startsWith(tab.route)
    }
  }
}
</script>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 250ms cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-up-enter,
.slide-up-leave-to {
  transform: translateY(100%);
}
</style>
