<template>
  <div class="w-full h-full">
    <div class="px-4 py-6">
      <ui-text-input ref="input" v-model="search" @input="updateSearch" borderless :placeholder="$strings.ButtonSearch" bg="white bg-opacity-10" rounded="md" prepend-icon="search" text-size="base" clearable class="w-full text-lg" />
    </div>
    <div class="w-full overflow-x-hidden overflow-y-auto search-content px-4" @click.stop>
      <div v-show="isFetching" class="w-full py-8 flex justify-center">
        <p class="text-lg text-fg-muted">{{ $strings.MessageFetching }}</p>
      </div>
      <div v-if="!isFetching && lastSearch && !totalResults" class="w-full py-8 flex justify-center">
        <p class="text-lg text-fg-muted">{{ $strings.MessageNoItemsFound }}</p>
      </div>
      <p v-if="bookResults.length" class="font-semibold text-sm mb-1">{{ $strings.LabelBooks }}</p>
      <template v-for="item in bookResults">
        <div :key="item.libraryItem.id" class="w-full h-16 py-1">
          <nuxt-link :to="`/item/${item.libraryItem.id}`">
            <cards-item-search-card :library-item="item.libraryItem" :search="lastSearch" />
          </nuxt-link>
        </div>
      </template>

      <p v-if="podcastResults.length" class="font-semibold text-sm mb-1 mt-2">{{ $strings.LabelPodcasts }}</p>
      <template v-for="item in podcastResults">
        <div :key="item.libraryItem.id" class="text-fg select-none relative py-1">
          <nuxt-link :to="`/item/${item.libraryItem.id}`">
            <cards-item-search-card :library-item="item.libraryItem" :search="lastSearch" />
          </nuxt-link>
        </div>
      </template>

      <p v-if="episodeResults.length" class="font-semibold text-sm mb-1 mt-2">{{ $strings.HeaderEpisodes }}</p>
      <template v-for="item in episodeResults">
        <div :key="item.libraryItem.recentEpisode.id" class="text-fg select-none relative py-1">
          <nuxt-link :to="`/item/${item.libraryItem.id}/${item.libraryItem.recentEpisode.id}`">
            <cards-episode-search-card :episode="item.libraryItem.recentEpisode" :library-item="item.libraryItem" />
          </nuxt-link>
        </div>
      </template>

      <p v-if="seriesResults.length" class="font-semibold text-sm mb-1 mt-2">{{ $strings.LabelSeries }}</p>
      <template v-for="seriesResult in seriesResults">
        <div :key="seriesResult.series.id" class="w-full h-16 py-1">
          <nuxt-link :to="`/bookshelf/series/${seriesResult.series.id}`">
            <cards-series-search-card :series="seriesResult.series" :book-items="seriesResult.books" />
          </nuxt-link>
        </div>
      </template>

      <p v-if="authorResults.length" class="font-semibold text-sm mb-1 mt-2">{{ $strings.LabelAuthors }}</p>
      <template v-for="authorResult in authorResults">
        <div :key="authorResult.id" class="w-full h-14 py-1">
          <nuxt-link :to="`/bookshelf/library?filter=authors.${$encode(authorResult.id)}`">
            <cards-author-search-card :author="authorResult" />
          </nuxt-link>
        </div>
      </template>

      <p v-if="narratorResults.length" class="font-semibold text-sm mb-1 mt-2">{{ $strings.LabelNarrators }}</p>
      <template v-for="narrator in narratorResults">
        <div :key="narrator.name" class="w-full h-14 py-1">
          <nuxt-link :to="`/bookshelf/library?filter=narrators.${$encode(narrator.name)}`">
            <cards-narrator-search-card :narrator="narrator.name" />
          </nuxt-link>
        </div>
      </template>

      <p v-if="tagResults.length" class="font-semibold text-sm mb-1 mt-2">{{ $strings.LabelTags }}</p>
      <template v-for="tag in tagResults">
        <div :key="tag.name" class="w-full h-14 py-1">
          <nuxt-link :to="`/bookshelf/library?filter=tags.${$encode(tag.name)}`">
            <cards-tag-search-card :tag="tag.name" />
          </nuxt-link>
        </div>
      </template>

      <template v-if="requestsEnabled && (requestResults.length || requestLoading || requestError)">
        <p class="font-semibold text-sm mb-1 mt-2">{{ $strings.HeaderBookRequests }}</p>
        <p v-if="requestLoading" class="text-sm text-fg-muted mb-1">{{ $strings.MessageFetching }}</p>
        <p v-else-if="requestError" class="text-sm text-fg-muted mb-1">{{ $strings.MessageBookRequestSearchFailed }}</p>
        <template v-for="result in requestResults">
          <div :key="result.foreignBookId" class="w-full h-16 py-1">
            <cards-book-request-search-card :result="result" :state="requestStateFor(result)" @request="submitRequest" />
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
      // Bumped on every search, clear, library change and destroy. Responses from an older generation are dropped.
      searchGeneration: 0,
      lastSearch: null,
      isFetching: false,
      bookResults: [],
      podcastResults: [],
      episodeResults: [],
      seriesResults: [],
      authorResults: [],
      narratorResults: [],
      tagResults: [],
      requestCapabilities: { libraryId: null, enabled: false },
      capabilityToken: 0,
      requestResults: [],
      requestToken: 0,
      requestLoading: false,
      requestError: false,
      // Keyed by "libraryId:foreignBookId" so a submit result can't land on another library's row.
      requestState: {}
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
      return this.bookResults.length + this.seriesResults.length + this.authorResults.length + this.podcastResults.length + this.narratorResults.length + this.tagResults.length + this.episodeResults.length
    },
    isBookLibrary() {
      return this.$store.getters['libraries/getCurrentLibraryMediaType'] === 'book'
    },
    requestsEnabled() {
      return this.isBookLibrary && this.requestCapabilities.libraryId === this.currentLibraryId && !!this.requestCapabilities.enabled
    }
  },
  watch: {
    currentLibraryId() {
      this.requestToken++
      this.requestResults = []
      this.requestLoading = false
      this.requestError = false
      this.fetchRequestCapabilities()
      if (this.lastSearch) this.runSearch(this.lastSearch)
    }
  },
  methods: {
    async fetchRequestCapabilities() {
      const libraryId = this.currentLibraryId
      const token = ++this.capabilityToken
      if (!this.isBookLibrary) {
        this.requestCapabilities = { libraryId, enabled: false }
        return
      }
      const response = await this.$nativeHttp.get(`/api/libraries/${libraryId}/book-requests/capabilities`).catch(() => null)
      if (token !== this.capabilityToken || libraryId !== this.currentLibraryId) return
      this.requestCapabilities = { libraryId, enabled: !!response?.enabled }
      // The capability can arrive after the search finished, so the request search is re-run here.
      if (this.requestsEnabled && this.lastSearch) this.runRequestSearch(this.lastSearch)
    },
    async runRequestSearch(value) {
      const token = ++this.requestToken
      if (!value || !this.requestsEnabled) {
        this.requestResults = []
        this.requestLoading = false
        this.requestError = false
        return
      }
      const libraryId = this.currentLibraryId
      this.requestLoading = true
      this.requestError = false
      const response = await this.$nativeHttp.get(`/api/libraries/${libraryId}/book-requests/search?q=${encodeURIComponent(value)}&limit=8`).catch((error) => {
        console.error('Book request search error', error)
        return null
      })
      if (token !== this.requestToken || libraryId !== this.currentLibraryId) return
      this.requestLoading = false
      this.requestError = !response
      this.requestResults = response?.remote || []
    },
    requestStateFor(result) {
      const key = `${this.currentLibraryId}:${result.foreignBookId}`
      if (this.requestState[key]) return this.requestState[key]
      return result.status === 'in_library' ? 'in_library' : null
    },
    async runSearch(value) {
      const generation = ++this.searchGeneration
      this.lastSearch = value
      this.$store.commit('globals/setLastSearch', value)
      this.runRequestSearch(value)

      if (!this.lastSearch) {
        this.isFetching = false
        this.bookResults = []
        this.podcastResults = []
        this.episodeResults = []
        this.seriesResults = []
        this.authorResults = []
        this.narratorResults = []
        this.tagResults = []
        return
      }
      this.isFetching = true
      const results = await this.$nativeHttp.get(`/api/libraries/${this.currentLibraryId}/search?q=${value}`).catch((error) => {
        console.error('Search error', error)
        return null
      })
      if (generation !== this.searchGeneration) return

      this.isFetching = false
      this.bookResults = results?.book || []
      this.podcastResults = results?.podcast || []
      this.episodeResults = results?.episodes || []
      this.seriesResults = results?.series || []
      this.authorResults = results?.authors || []
      this.narratorResults = results?.narrators || []
      this.tagResults = results?.tags || []
    },
    async submitRequest(result) {
      const libraryId = this.currentLibraryId
      const key = `${libraryId}:${result.foreignBookId}`
      // Any state, including 'submitting', blocks a second tap.
      if (this.requestState[key]) return
      this.$set(this.requestState, key, 'submitting')
      try {
        await this.$nativeHttp.post(`/api/libraries/${libraryId}/book-requests`, {
          foreignBookId: result.foreignBookId,
          searchForNewBook: true,
          remoteBook: result.remoteBook
        })
        this.$set(this.requestState, key, 'submitted')
        this.$toast.success(this.$strings.ToastBookRequestSubmitted)
      } catch (error) {
        const code = error?.status === 409 ? error.data?.code : null
        if (code === 'ALREADY_IN_LIBRARY') {
          this.$set(this.requestState, key, 'in_library')
        } else if (code === 'ALREADY_TRACKED_IN_READARR') {
          this.$set(this.requestState, key, 'tracked')
        } else {
          this.$delete(this.requestState, key)
          this.$toast.error(this.$strings.ToastBookRequestFailed)
        }
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
        if (this.$refs.input) {
          this.$refs.input.focus()
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
      this.$nextTick(this.setFocus())
    }
  },
  beforeDestroy() {
    clearTimeout(this.searchTimeout)
    this.searchGeneration++
    this.requestToken++
    this.capabilityToken++
  }
}
</script>

<style>
.search-content {
  height: calc(100% - 108px);
  max-height: calc(100% - 108px);
}
</style>
