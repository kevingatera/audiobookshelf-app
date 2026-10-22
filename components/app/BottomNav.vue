<template>
  <nav v-show="show" class="bottom-nav fixed inset-x-0 bottom-0 z-10 flex bg-primary" @touchstart.stop>
    <nuxt-link v-for="tab in tabs" :key="tab.to" :to="tab.to" class="flex-1 flex flex-col items-center justify-center" :class="tab.isActive ? 'text-accent' : 'text-fg-muted'" :aria-current="tab.isActive ? 'page' : null">
      <span class="material-symbols text-2xl leading-none" :class="{ fill: tab.isActive }">{{ tab.icon }}</span>
      <span class="text-xs leading-none mt-1">{{ tab.label }}</span>
    </nuxt-link>
  </nav>
</template>

<script>
const LIBRARY_PATHS = ['/bookshelf/library', '/bookshelf/series', '/bookshelf/collections', '/bookshelf/authors', '/bookshelf/playlists']

export default {
  props: {
    show: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    libraryIcon() {
      return this.$store.getters['libraries/getCurrentLibraryMediaType'] === 'podcast' ? 'podcasts' : 'local_library'
    },
    tabs() {
      const path = this.$route.path
      return [
        { to: '/bookshelf', label: this.$strings.ButtonHome, icon: 'home', isActive: ['/', '/bookshelf', '/bookshelf/latest'].includes(path) },
        { to: '/bookshelf/library', label: this.$strings.ButtonLibrary, icon: this.libraryIcon, isActive: LIBRARY_PATHS.some((p) => path.startsWith(p)) },
        { to: '/search', label: this.$strings.ButtonSearch, icon: 'search', isActive: path.startsWith('/search') },
        { to: '/downloads', label: this.$strings.HeaderDownloads, icon: 'download', isActive: path.startsWith('/downloads') || path.startsWith('/downloading') },
        { to: '/settings', label: this.$strings.LabelMore, icon: 'more_horiz', isActive: path.startsWith('/settings') || path.startsWith('/account') }
      ]
    }
  }
}
</script>

<style scoped>
.bottom-nav {
  height: var(--bottom-nav-height);
  padding-bottom: env(safe-area-inset-bottom);
}
.bottom-nav::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background-color: rgb(var(--color-border) / 0.5);
}
</style>
