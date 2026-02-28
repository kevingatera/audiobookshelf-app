<template>
  <div class="w-full h-full relative overflow-hidden bg-bg">
    <template v-if="!showSelectedFeed">
      <!-- Search bar -->
      <div class="px-4 pt-4 pb-2">
        <form @submit.prevent="submit">
          <div class="bg-secondary rounded-xl flex items-center px-4 py-3">
            <span class="material-symbols text-lg text-fg-muted mr-3">search</span>
            <input v-model="searchInput" :disabled="processing || !socketConnected" :placeholder="$strings.MessagePodcastSearchField" class="flex-grow bg-transparent text-sm text-fg placeholder-fg-muted outline-none" />
          </div>
        </form>
      </div>

      <!-- No connection -->
      <div v-if="!socketConnected" class="w-full text-center py-6">
        <span class="material-symbols text-3xl text-error mb-2">wifi_off</span>
        <p class="text-sm text-error">{{ $strings.MessageNoNetworkConnection }}</p>
      </div>

      <!-- Results -->
      <div v-else class="w-full pb-2 overflow-y-auto overflow-x-hidden h-[calc(100%-76px)]" style="-webkit-overflow-scrolling: touch">
        <p v-if="termSearched && !results.length && !processing" class="text-center text-base text-fg-muted py-8">{{ $strings.MessageNoPodcastsFound }}</p>

        <div v-if="results.length" class="bg-secondary rounded-xl mx-4 mb-4 overflow-hidden">
          <template v-for="podcast in results">
            <div :key="podcast.id" class="px-4 py-3 flex items-center border-b border-warm last:border-0" @click="selectPodcast(podcast)">
              <div class="w-12 h-12 min-w-12 rounded-lg overflow-hidden bg-primary mr-3">
                <img v-if="podcast.cover" :src="podcast.cover" class="h-full w-full object-cover" />
              </div>
              <div class="flex-grow min-w-0">
                <p class="text-sm text-fg font-medium truncate">{{ podcast.title }}</p>
                <p class="text-xs text-fg-muted truncate">{{ podcast.artistName }}</p>
                <p class="text-xs text-fg-muted mt-0.5">{{ podcast.trackCount }} {{ $strings.HeaderEpisodes }} <span v-if="podcast.genres.length" class="text-fg-muted">&middot; {{ podcast.genres.join(', ') }}</span></p>
              </div>
              <span class="material-symbols text-lg text-fg-muted ml-2">chevron_right</span>
            </div>
          </template>
        </div>
      </div>
    </template>

    <!-- Selected podcast feed -->
    <template v-else>
      <div class="flex items-center px-4 h-14">
        <div class="flex items-center" @click="clearSelected">
          <span class="material-symbols text-2xl text-fg-muted">arrow_back</span>
          <p class="pl-2 uppercase text-sm font-semibold text-fg-muted leading-4 pb-px">{{ $strings.ButtonBack }}</p>
        </div>
      </div>

      <div class="w-full py-2 overflow-y-auto overflow-x-hidden h-[calc(100%-56px)]" style="-webkit-overflow-scrolling: touch">
        <forms-new-podcast-form :podcast-data="selectedPodcast" :podcast-feed-data="selectedPodcastFeed" :processing.sync="processing" />
      </div>
    </template>

    <!-- Processing overlay -->
    <div v-show="processing" class="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-25 z-40">
      <ui-loading-indicator />
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      searchInput: '',
      termSearched: false,
      processing: false,
      results: [],
      selectedPodcastFeed: null,
      selectedPodcast: null,
      showSelectedFeed: false
    }
  },
  computed: {
    socketConnected() {
      return this.$store.state.socketConnected
    }
  },
  methods: {
    clearSelected() {
      this.selectedPodcastFeed = null
      this.selectedPodcast = null
      this.showSelectedFeed = false
    },
    submit() {
      if (!this.searchInput) return

      if (this.searchInput.startsWith('http:') || this.searchInput.startsWith('https:')) {
        this.termSearched = ''
        this.results = []
        this.checkRSSFeed(this.searchInput)
      } else {
        this.submitSearch(this.searchInput)
      }
    },
    async checkRSSFeed(rssFeed) {
      this.processing = true
      var payload = await this.$nativeHttp.post(`/api/podcasts/feed`, { rssFeed }).catch((error) => {
        console.error('Failed to get feed', error)
        this.$toast.error('Failed to get podcast feed')
        return null
      })
      this.processing = false
      if (!payload) return

      this.selectedPodcastFeed = payload.podcast
      this.selectedPodcast = null
      this.showSelectedFeed = true
    },
    async submitSearch(term) {
      this.processing = true
      this.termSearched = ''
      const results = await this.$nativeHttp.get(`/api/search/podcast?term=${encodeURIComponent(term)}`).catch((error) => {
        console.error('Search request failed', error)
        return []
      })
      console.log('Got results', results)
      this.results = results
      this.termSearched = term
      this.processing = false
    },
    async selectPodcast(podcast) {
      console.log('Selected podcast', podcast)
      if (!podcast.feedUrl) {
        this.$toast.error('Invalid podcast - no feed')
        return
      }
      this.processing = true
      const payload = await this.$nativeHttp.post(`/api/podcasts/feed`, { rssFeed: podcast.feedUrl }).catch((error) => {
        console.error('Failed to get feed', error)
        this.$toast.error('Failed to get podcast feed')
        return null
      })
      this.processing = false
      if (!payload) return

      this.selectedPodcastFeed = payload.podcast
      this.selectedPodcast = podcast
      this.showSelectedFeed = true
      console.log('Got podcast feed', payload.podcast)
    },
    libraryChanged() {
      const libraryMediaType = this.$store.getters['libraries/getCurrentLibraryMediaType']
      if (libraryMediaType !== 'podcast') {
        this.$router.replace('/bookshelf')
      }
    }
  },
  mounted() {
    this.$eventBus.$on('library-changed', this.libraryChanged)
  },
  beforeDestroy() {
    this.$eventBus.$off('library-changed', this.libraryChanged)
  }
}
</script>
