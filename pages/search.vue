<template>
  <div class="w-full h-full overflow-hidden" style="-webkit-overflow-scrolling: touch">
    <!-- Search input -->
    <div class="bg-secondary rounded-xl mx-4 mt-4 px-4 py-2 flex items-center gap-3">
      <span class="material-symbols text-fg-muted text-xl">search</span>
      <input
        ref="searchInput"
        v-model="search"
        @input="updateSearch(search)"
        :placeholder="$strings.ButtonSearch"
        class="flex-1 bg-transparent text-fg text-base outline-none placeholder-fg-muted/50"
      />
      <span v-if="search" class="material-symbols text-fg-muted text-xl cursor-pointer" @click="search = ''; updateSearch('')">close</span>
    </div>

    <!-- Results area -->
    <div class="w-full overflow-x-hidden overflow-y-auto px-0 pt-2 pb-4" style="height: calc(100% - 72px); max-height: calc(100% - 72px); -webkit-overflow-scrolling: touch" @click.stop>

      <!-- Book request panel -->
      <div v-if="isBookLibrary && requestCapabilities.enabled" class="request-panel mb-4 overflow-hidden rounded-xl border border-white/10 mx-4">
        <div class="request-panel-head flex items-center justify-between px-3 py-2.5">
          <div class="flex items-center gap-2">
            <span class="material-symbols text-base text-sky-200">library_add</span>
            <p class="font-semibold text-sm tracking-wide">{{ $strings.HeaderBookRequests }}</p>
          </div>
          <div class="flex items-center gap-2">
            <p v-if="requestLoading" class="text-xs text-fg-muted">{{ $strings.MessageFetching }}</p>
            <span v-if="requestResults.length" class="rounded-full border border-white/20 px-2 py-0.5 text-xxs text-fg-muted">
              {{ requestResults.length }}
            </span>
          </div>
        </div>
        <div class="px-3 pb-3">
          <p class="text-xs text-fg-muted">{{ $strings.MessageBookRequestSearchHelp }}</p>
          <div v-if="requestResults.length" class="mt-2 space-y-2">
            <div v-for="result in requestResults" :key="result.foreignBookId" class="request-card rounded-lg border border-white/10 p-2.5">
              <div class="flex items-start gap-2.5">
                <img v-if="result.remoteCover" :src="result.remoteCover" class="h-14 w-10 rounded object-cover object-center border border-white/10" />
                <div v-else class="h-14 w-10 rounded border border-white/10 bg-white/5 flex items-center justify-center text-xxs text-fg-muted">N/A</div>
                <div class="min-w-0 flex-1">
                  <p class="truncate text-sm font-semibold">{{ result.title }}</p>
                  <p class="truncate text-xs text-fg-muted">{{ result.author }}</p>
                  <div class="mt-1 flex flex-wrap items-center gap-1.5">
                    <span class="rounded-full border border-white/20 px-1.5 py-0.5 text-xxs text-fg-muted">Readarr</span>
                    <span
                      v-if="result.status === 'in_library'"
                      class="rounded-full border border-warning/40 bg-warning/10 px-1.5 py-0.5 text-xxs text-warning"
                    >
                      {{ $strings.LabelAlreadyInLibrary }}
                    </span>
                  </div>
                </div>
                <ui-btn
                  small
                  color="success"
                  :disabled="requestSubmitting[result.foreignBookId] || result.status === 'in_library'"
                  :loading="requestSubmitting[result.foreignBookId]"
                  @click="submitRequest(result)"
                >
                  {{ $strings.ButtonRequestBook }}
                </ui-btn>
              </div>
              <p v-if="result.localMatches?.length" class="mt-2 rounded border border-white/10 bg-white/5 px-2 py-1 text-xxs text-fg-muted">
                {{ $getString('MessageBookRequestMatchedItem', [result.localMatches[0].localItem.title]) }}
              </p>
            </div>
          </div>
          <p v-else-if="lastSearch && !requestLoading" class="mt-2 text-xs text-fg-muted">{{ $strings.MessageNoItemsFound }}</p>
        </div>
      </div>

      <!-- Loading state -->
      <div v-show="isFetching" class="w-full py-12 flex flex-col items-center justify-center">
        <span class="material-symbols text-3xl text-fg-muted mb-2 animate-spin">progress_activity</span>
        <p class="text-sm text-fg-muted">{{ $strings.MessageFetching }}</p>
      </div>

      <!-- Empty search state -->
      <div v-if="!isFetching && !lastSearch" class="w-full py-16 flex flex-col items-center justify-center">
        <span class="material-symbols text-5xl text-fg-muted/40 mb-3">search</span>
        <p class="text-sm text-fg-muted">Search your library</p>
      </div>

      <!-- No results state -->
      <div v-if="!isFetching && lastSearch && !totalResults" class="w-full py-16 flex flex-col items-center justify-center">
        <span class="material-symbols text-5xl text-fg-muted/40 mb-3">search_off</span>
        <p class="text-sm text-fg-muted">{{ $strings.MessageNoItemsFound }}</p>
      </div>

      <!-- Books -->
      <template v-if="bookResults.length">
        <p class="text-sm font-semibold text-fg-muted uppercase tracking-wider px-4 pt-4 pb-2">{{ $strings.LabelBooks }}</p>
        <template v-for="item in bookResults">
          <div :key="item.libraryItem.id" class="w-full h-16 py-1 px-4">
            <nuxt-link :to="`/item/${item.libraryItem.id}`">
              <cards-item-search-card :library-item="item.libraryItem" :search="lastSearch" />
            </nuxt-link>
          </div>
        </template>
      </template>

      <!-- Podcasts -->
      <template v-if="podcastResults.length">
        <p class="text-sm font-semibold text-fg-muted uppercase tracking-wider px-4 pt-4 pb-2">{{ $strings.LabelPodcasts }}</p>
        <template v-for="item in podcastResults">
          <div :key="item.libraryItem.id" class="text-fg select-none relative py-1 px-4">
            <nuxt-link :to="`/item/${item.libraryItem.id}`">
              <cards-item-search-card :library-item="item.libraryItem" :search="lastSearch" />
            </nuxt-link>
          </div>
        </template>
      </template>

      <!-- Series -->
      <template v-if="seriesResults.length">
        <p class="text-sm font-semibold text-fg-muted uppercase tracking-wider px-4 pt-4 pb-2">{{ $strings.LabelSeries }}</p>
        <template v-for="seriesResult in seriesResults">
          <div :key="seriesResult.series.id" class="w-full h-16 py-1 px-4">
            <nuxt-link :to="`/bookshelf/series/${seriesResult.series.id}`">
              <cards-series-search-card :series="seriesResult.series" :book-items="seriesResult.books" />
            </nuxt-link>
          </div>
        </template>
      </template>

      <!-- Authors -->
      <template v-if="authorResults.length">
        <p class="text-sm font-semibold text-fg-muted uppercase tracking-wider px-4 pt-4 pb-2">{{ $strings.LabelAuthors }}</p>
        <template v-for="authorResult in authorResults">
          <div :key="authorResult.id" class="w-full h-14 py-1 px-4">
            <nuxt-link :to="`/bookshelf/library?filter=authors.${$encode(authorResult.id)}`">
              <cards-author-search-card :author="authorResult" />
            </nuxt-link>
          </div>
        </template>
      </template>

      <!-- Narrators -->
      <template v-if="narratorResults.length">
        <p class="text-sm font-semibold text-fg-muted uppercase tracking-wider px-4 pt-4 pb-2">{{ $strings.LabelNarrators }}</p>
        <template v-for="narrator in narratorResults">
          <div :key="narrator.name" class="w-full h-14 py-1 px-4">
            <nuxt-link :to="`/bookshelf/library?filter=narrators.${$encode(narrator.name)}`">
              <cards-narrator-search-card :narrator="narrator.name" />
            </nuxt-link>
          </div>
        </template>
      </template>

      <!-- Tags -->
      <template v-if="tagResults.length">
        <p class="text-sm font-semibold text-fg-muted uppercase tracking-wider px-4 pt-4 pb-2">{{ $strings.LabelTags }}</p>
        <template v-for="tag in tagResults">
          <div :key="tag.name" class="w-full h-14 py-1 px-4">
            <nuxt-link :to="`/bookshelf/library?filter=tags.${$encode(tag.name)}`">
              <cards-tag-search-card :tag="tag.name" />
            </nuxt-link>
          </div>
        </template>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      search: null,
      searchTimeout: null,
      lastSearch: null,
      isFetching: false,
      bookResults: [],
      podcastResults: [],
      seriesResults: [],
      authorResults: [],
      narratorResults: [],
      tagResults: []
      ,
      requestCapabilities: { enabled: false },
      requestResults: [],
      requestLoading: false,
      requestSubmitting: {}
    }
  },
  computed: {
    currentLibraryId() {
      return this.$store.state.libraries.currentLibraryId
    },
    bookCoverAspectRatio() {
      return this.$store.getters['libraries/getBookCoverAspectRatio']
    },
    totalResults() {
      return this.bookResults.length + this.seriesResults.length + this.authorResults.length + this.podcastResults.length + this.narratorResults.length + this.tagResults.length
    },
    isBookLibrary() {
      return this.$store.getters['libraries/getCurrentLibraryMediaType'] === 'book'
    }
  },
  methods: {
    async fetchRequestCapabilities() {
      if (!this.isBookLibrary) {
        this.requestCapabilities = { enabled: false }
        return
      }
      this.requestCapabilities = await this.$nativeHttp.get(`/api/libraries/${this.currentLibraryId}/book-requests/capabilities`).catch(() => ({ enabled: false }))
    },
    async runSearch(value) {
      if (this.isFetching && this.lastSearch === value) return

      this.lastSearch = value
      this.$store.commit('globals/setLastSearch', value)

      if (!this.lastSearch) {
        this.bookResults = []
        this.podcastResults = []
        this.seriesResults = []
        this.authorResults = []
        this.narratorResults = []
        this.tagResults = []
        return
      }
      this.isFetching = true
      const results = await this.$nativeHttp.get(`/api/libraries/${this.currentLibraryId}/search?q=${value}&limit=5`).catch((error) => {
        console.error('Search error', error)
        return null
      })
      if (value !== this.lastSearch) {
        return
      }

      this.isFetching = false

      this.bookResults = results?.book || []
      this.podcastResults = results?.podcast || []
      this.seriesResults = results?.series || []
      this.authorResults = results?.authors || []
      this.narratorResults = results?.narrators || []
      this.tagResults = results?.tags || []

      if (this.requestCapabilities.enabled) {
        this.requestLoading = true
        const requestResponse = await this.$nativeHttp.get(`/api/libraries/${this.currentLibraryId}/book-requests/search?q=${encodeURIComponent(value)}&limit=8`).catch((error) => {
          console.error('Book request search error', error)
          return null
        })
        this.requestResults = requestResponse?.remote || []
        this.requestLoading = false
      }
    },
    async submitRequest(result) {
      this.$set(this.requestSubmitting, result.foreignBookId, true)
      const response = await this.$nativeHttp
        .post(`/api/libraries/${this.currentLibraryId}/book-requests`, {
          foreignBookId: result.foreignBookId,
          searchForNewBook: true,
          remoteBook: result.remoteBook
        })
        .catch((error) => {
          if (error?.status === 409) {
            const code = error.data?.code
            if (code === 'ALREADY_IN_LIBRARY') {
              this.$toast.info(this.$strings.LabelAlreadyInLibrary)
            } else if (code === 'ALREADY_TRACKED_IN_READARR') {
              this.$toast.info(this.$strings.MessageBookAlreadyTracked)
            } else {
              this.$toast.error(this.$strings.ToastFailedToUpdate)
            }
          } else {
            this.$toast.error(this.$strings.ToastFailedToUpdate)
          }
          return null
        })
      this.$set(this.requestSubmitting, result.foreignBookId, false)
      if (response?.ok) {
        this.$toast.success(this.$strings.ToastBookRequestSubmitted)
      }
    },
    updateSearch(val) {
      clearTimeout(this.searchTimeout)
      this.searchTimeout = setTimeout(() => {
        this.runSearch(val)
      }, 500)
    },
    setFocus() {
      setTimeout(() => {
        if (this.$refs.searchInput) {
          this.$refs.searchInput.focus()
        }
      }, 100)
    }
  },
  mounted() {
    this.fetchRequestCapabilities()
    if (this.$store.state.globals.lastSearch) {
      this.search = this.$store.state.globals.lastSearch
      this.runSearch(this.search)
    } else {
      this.$nextTick(() => this.$refs.searchInput?.focus())
    }
  }
}
</script>

<style>
.request-panel {
  background: linear-gradient(160deg, rgba(20, 26, 39, 0.95), rgba(15, 24, 32, 0.92) 52%, rgba(27, 33, 47, 0.95));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.request-panel-head {
  background: linear-gradient(90deg, rgba(56, 189, 248, 0.22), rgba(14, 165, 233, 0.08));
}

.request-card {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.045), rgba(255, 255, 255, 0.02));
}
</style>
