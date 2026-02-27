<template>
  <div class="w-full h-full min-h-full relative">
    <div v-if="attemptingConnection" class="w-full pt-4 flex items-center justify-center">
      <widgets-loading-spinner />
      <p class="pl-4">{{ $strings.MessageAttemptingServerConnection }}</p>
    </div>
    <div v-if="shelves.length && isLoading" class="w-full pt-4 flex items-center justify-center">
      <widgets-loading-spinner />
      <p class="pl-4">{{ $strings.MessageLoadingServerData }}</p>
    </div>

    <div class="w-full" :class="{ 'py-6': altViewEnabled }">
      <template v-for="(shelf, index) in shelves">
        <bookshelf-shelf :key="shelf.id" :label="getShelfLabel(shelf)" :entities="shelf.entities" :type="shelf.type" :style="{ zIndex: shelves.length - index }" />
      </template>
    </div>

    <div v-if="!shelves.length && !isLoading" class="absolute top-0 left-0 w-full h-full flex items-center justify-center">
      <div>
        <p class="mb-4 text-center text-xl">
          {{ $strings.MessageBookshelfEmpty }}
        </p>
        <div class="w-full" v-if="!user">
          <div class="flex justify-center items-center mb-3">
            <span class="material-symbols text-error text-lg">cloud_off</span>
            <p class="pl-2 text-error text-sm">{{ $strings.MessageAudiobookshelfServerNotConnected }}</p>
          </div>
        </div>
        <div class="flex justify-center">
          <ui-btn v-if="!user" small @click="$router.push('/connect')" class="w-32">{{ $strings.ButtonConnect }}</ui-btn>
        </div>
      </div>
    </div>
    <div v-else-if="!shelves.length && isLoading && !attemptingConnection" class="absolute top-0 left-0 z-50 w-full h-full flex items-center justify-center">
      <ui-loading-indicator :text="$strings.MessageLoading" />
    </div>
  </div>
</template>

<script>
export default {
  props: {},
  data() {
    return {
      shelves: [],
      categoriesFetchToken: 0,
      initialShelvesRenderCount: 2,
      initialServerShelfLimit: 4,
      rssHydrationTimer: null,
      rssHydrationInFlight: false,
      lastRssHydrationAt: 0,
      lastRssHydrationLibraryId: null,
      isFirstNetworkConnection: true,
      lastServerFetch: 0,
      lastServerFetchLibraryId: null,
      lastLocalFetch: 0,
      localLibraryItems: [],
      isLoading: false
    }
  },
  watch: {
    networkConnected(newVal) {
      // Update shelves when network connect status changes
      console.log(`[categories] Network changed to ${newVal} - fetch categories. ${this.lastServerFetch}/${this.lastLocalFetch}`)

      if (newVal) {
        // Fetch right away the first time network connects
        if (this.isFirstNetworkConnection) {
          this.isFirstNetworkConnection = false
          console.log(`[categories] networkConnected true first network connection. lastServerFetch=${this.lastServerFetch}`)
          this.fetchCategories()
          return
        }

        setTimeout(() => {
          // Using timeout because making this fetch as soon as network gets connected will often fail on Android
          console.log(`[categories] networkConnected true so fetching categories. lastServerFetch=${this.lastServerFetch}`)
          this.fetchCategories()
        }, 4000)
      } else {
        console.log(`[categories] networkConnected false so fetching categories`)
        this.fetchCategories()
      }
    },
    user(newVal, oldVal) {
      if ((newVal && !oldVal) || (!newVal && oldVal)) {
        console.log(`[categories] user changed so fetching categories`)
        this.fetchCategories()
      }
    }
  },
  computed: {
    user() {
      return this.$store.state.user.user
    },
    networkConnected() {
      return this.$store.state.networkConnected
    },
    isIos() {
      return this.$platform === 'ios'
    },
    currentLibraryName() {
      return this.$store.getters['libraries/getCurrentLibraryName']
    },
    currentLibraryId() {
      return this.$store.state.libraries.currentLibraryId
    },
    currentLibraryMediaType() {
      return this.$store.getters['libraries/getCurrentLibraryMediaType']
    },
    currentLibraryIsPodcast() {
      return this.currentLibraryMediaType === 'podcast'
    },
    altViewEnabled() {
      return this.$store.getters['getAltViewEnabled']
    },
    localMediaProgress() {
      return this.$store.state.globals.localMediaProgress
    },
    attemptingConnection() {
      return this.$store.state.attemptingConnection
    }
  },
  methods: {
    getShelfCacheKey() {
      const serverHost = this.$store.getters['user/getServerAddress'] || 'unknown-server'
      const userId = this.user?.id || 'anon'
      const libraryId = this.currentLibraryId || 'no-library'
      return `abs_mobile_home_shelves_v1:${serverHost}:${userId}:${libraryId}`
    },
    loadShelvesCache() {
      try {
        const payload = localStorage.getItem(this.getShelfCacheKey())
        if (!payload) return false

        const parsed = JSON.parse(payload)
        if (!parsed?.shelves || !Array.isArray(parsed.shelves) || !parsed.shelves.length) return false

        this.shelves = parsed.shelves
        this.scheduleVisibleRssHydration()
        return true
      } catch (error) {
        console.error('[categories] Failed to load shelves cache', error)
        return false
      }
    },
    saveShelvesCache(shelves) {
      try {
        if (!Array.isArray(shelves) || !shelves.length) return
        const payload = {
          savedAt: Date.now(),
          shelves
        }
        localStorage.setItem(this.getShelfCacheKey(), JSON.stringify(payload))
      } catch (error) {
        console.error('[categories] Failed to save shelves cache', error)
      }
    },
    applyShelvesProgressive(shelves) {
      if (!Array.isArray(shelves) || !shelves.length) {
        this.shelves = []
        return
      }

      if (shelves.length <= this.initialShelvesRenderCount) {
        this.shelves = shelves
        this.scheduleVisibleRssHydration()
        return
      }

      this.shelves = shelves.slice(0, this.initialShelvesRenderCount)
      this.scheduleVisibleRssHydration()
      requestAnimationFrame(() => {
        this.shelves = shelves
        this.scheduleVisibleRssHydration()
      })
    },
    scheduleVisibleRssHydration() {
      if (!this.user || !this.networkConnected) return
      if (this.rssHydrationTimer) {
        clearTimeout(this.rssHydrationTimer)
      }
      this.rssHydrationTimer = setTimeout(() => {
        this.hydrateVisibleShelvesRssFeedSimple()
      }, 250)
    },
    async hydrateVisibleShelvesRssFeedSimple() {
      if (!this.user || !this.networkConnected || this.rssHydrationInFlight || !this.currentLibraryId) return

      if (this.lastRssHydrationLibraryId === this.currentLibraryId && Date.now() - this.lastRssHydrationAt < 30000) {
        return
      }

      this.rssHydrationInFlight = true
      const payload = await this.$nativeHttp
        .get(`/api/libraries/${this.currentLibraryId}/personalized?minified=1&include=rssfeed&limit=8`, { connectTimeout: 6000 })
        .catch(() => null)

      if (payload && Array.isArray(payload)) {
        const rssById = new Map()
        payload.slice(0, this.initialShelvesRenderCount).forEach((shelf) => {
          if (!Array.isArray(shelf?.entities)) return
          shelf.entities.forEach((entity) => {
            if (entity?.id && entity.rssFeed !== undefined) {
              rssById.set(String(entity.id), entity.rssFeed)
            }
          })
        })

        if (rssById.size) {
          this.shelves.slice(0, this.initialShelvesRenderCount).forEach((shelf) => {
            if (!Array.isArray(shelf?.entities)) return
            shelf.entities.forEach((entity) => {
              const rssFeed = rssById.get(String(entity?.id || ''))
              if (rssFeed === undefined) return
              if (entity.rssFeed === rssFeed) return
              this.$set(entity, 'rssFeed', rssFeed)
            })
          })
        }
      }

      this.lastRssHydrationAt = Date.now()
      this.lastRssHydrationLibraryId = this.currentLibraryId
      this.rssHydrationInFlight = false
    },
    enrichShelvesWithLocalItems(shelves, localLibraryItems) {
      if (!Array.isArray(shelves) || !shelves.length || !Array.isArray(localLibraryItems) || !localLibraryItems.length) {
        return shelves
      }

      const localByServerId = new Map()
      for (const lli of localLibraryItems) {
        if (lli?.libraryItemId) {
          localByServerId.set(String(lli.libraryItemId), lli)
        }
      }

      return shelves.map((shelf) => {
        if (!shelf?.entities || (shelf.type !== 'book' && shelf.type !== 'podcast' && shelf.type !== 'episode')) {
          return shelf
        }

        return {
          ...shelf,
          entities: shelf.entities.map((entity) => {
            const localLibraryItem = localByServerId.get(String(entity?.id || ''))
            if (!localLibraryItem) return entity
            return {
              ...entity,
              localLibraryItem
            }
          })
        }
      })
    },
    getShelfLabel(shelf) {
      if (shelf.labelStringKey && this.$strings[shelf.labelStringKey]) return this.$strings[shelf.labelStringKey]
      return shelf.label
    },
    getLocalMediaItemCategories() {
      const localMedia = this.localLibraryItems
      if (!localMedia?.length) return []

      const categories = []
      const books = []
      const podcasts = []
      const booksContinueListening = []
      const podcastEpisodesContinueListening = []
      localMedia.forEach((item) => {
        if (item.mediaType == 'book') {
          item.progress = this.$store.getters['globals/getLocalMediaProgressById'](item.id)
          if (item.progress && !item.progress.isFinished && item.progress.progress > 0) booksContinueListening.push(item)
          books.push(item)
        } else if (item.mediaType == 'podcast') {
          const podcastEpisodeItemCloner = { ...item }
          item.media.episodes = item.media.episodes.map((ep) => {
            ep.progress = this.$store.getters['globals/getLocalMediaProgressById'](item.id, ep.id)
            if (ep.progress && !ep.progress.isFinished && ep.progress.progress > 0) {
              podcastEpisodesContinueListening.push({
                ...podcastEpisodeItemCloner,
                recentEpisode: ep
              })
            }
            return ep
          })
          podcasts.push(item)
        }
      })

      // Local continue listening shelves, only shown offline
      if (booksContinueListening.length) {
        categories.push({
          id: 'local-books-continue',
          label: this.$strings.LabelContinueBooks,
          type: 'book',
          localOnly: true,
          entities: booksContinueListening.sort((a, b) => {
            if (a.progress && b.progress) {
              return b.progress.lastUpdate > a.progress.lastUpdate ? 1 : -1
            }
            return 0
          })
        })
      }
      if (podcastEpisodesContinueListening.length) {
        categories.push({
          id: 'local-episodes-continue',
          label: this.$strings.LabelContinueEpisodes,
          type: 'episode',
          localOnly: true,
          entities: podcastEpisodesContinueListening.sort((a, b) => {
            if (a.recentEpisode.progress && b.recentEpisode.progress) {
              return b.recentEpisode.progress.lastUpdate > a.recentEpisode.progress.lastUpdate ? 1 : -1
            }
            return 0
          })
        })
      }

      // Local books and local podcast shelves
      if (books.length) {
        categories.push({
          id: 'local-books',
          label: this.$strings.LabelLocalBooks,
          type: 'book',
          entities: books.sort((a, b) => {
            if (a.progress && a.progress.isFinished) return 1
            else if (b.progress && b.progress.isFinished) return -1
            else if (a.progress && b.progress) {
              return b.progress.lastUpdate > a.progress.lastUpdate ? 1 : -1
            }
            return 0
          })
        })
      }
      if (podcasts.length) {
        categories.push({
          id: 'local-podcasts',
          label: this.$strings.LabelLocalPodcasts,
          type: 'podcast',
          entities: podcasts
        })
      }

      return categories
    },
    async fetchCategories() {
      console.log(`[categories] fetchCategories networkConnected=${this.networkConnected}, lastServerFetch=${this.lastServerFetch}, lastLocalFetch=${this.lastLocalFetch}`)

      // TODO: Find a better way to keep the shelf up-to-date with local vs server library because this is a disaster
      const isConnectedToServerWithInternet = this.user && this.currentLibraryId && this.networkConnected
      if (isConnectedToServerWithInternet) {
        if (this.lastServerFetch && Date.now() - this.lastServerFetch < 5000 && this.lastServerFetchLibraryId == this.currentLibraryId) {
          console.log(`[categories] fetchCategories server fetch was ${Date.now() - this.lastServerFetch}ms ago so not doing it.`)
          return
        } else {
          console.log(`[categories] fetchCategories fetching from server. Last was ${this.lastServerFetch ? Date.now() - this.lastServerFetch + 'ms' : 'Never'} ago. lastServerFetchLibraryId=${this.lastServerFetchLibraryId} and currentLibraryId=${this.currentLibraryId}`)
          this.lastServerFetchLibraryId = this.currentLibraryId
          this.lastServerFetch = Date.now()
          this.lastLocalFetch = 0
        }
      } else {
        if (this.lastLocalFetch && Date.now() - this.lastLocalFetch < 5000) {
          console.log(`[categories] fetchCategories local fetch was ${Date.now() - this.lastLocalFetch}ms ago so not doing it.`)
          return
        } else {
          console.log(`[categories] fetchCategories fetching from local. Last was ${this.lastLocalFetch ? Date.now() - this.lastLocalFetch + 'ms' : 'Never'} ago`)
          this.lastServerFetchLibraryId = null
          this.lastServerFetch = 0
          this.lastLocalFetch = Date.now()
        }
      }

      this.isLoading = true
      const fetchToken = ++this.categoriesFetchToken

      const tryLocalFallbackShelves = async () => {
        await new Promise((resolve) => setTimeout(resolve, 1200))
        if (fetchToken !== this.categoriesFetchToken) return
        if (!this.isLoading || this.shelves.length) return

        this.localLibraryItems = await this.$db.getLocalLibraryItems().catch(() => [])
        if (fetchToken !== this.categoriesFetchToken) return

        const localCategories = this.getLocalMediaItemCategories()
        if (!localCategories.length) return

        this.shelves = localCategories
        this.lastLocalFetch = Date.now()
        this.isLoading = false
        this.scheduleVisibleRssHydration()
      }

      if (isConnectedToServerWithInternet) {
        tryLocalFallbackShelves()

        const shouldRunQuickFetch = !this.shelves.length
        if (shouldRunQuickFetch) {
          const quickCategories = await this.$nativeHttp
            .get(
              `/api/libraries/${this.currentLibraryId}/personalized?minified=1&include=numEpisodesIncomplete&limit=${this.initialServerShelfLimit}&shelves=continue-listening,recent-series`,
              { connectTimeout: 4000 }
            )
            .catch(() => [])

          if (fetchToken !== this.categoriesFetchToken) {
            return
          }

          if (quickCategories.length) {
            this.applyShelvesProgressive(quickCategories)
            this.isLoading = false
          }
        }

        const serverStartedAt = Date.now()
        const categories = await this.$nativeHttp
          .get(`/api/libraries/${this.currentLibraryId}/personalized?minified=1&include=numEpisodesIncomplete&limit=${this.initialServerShelfLimit}`, {
            connectTimeout: 7000
          })
          .catch((error) => {
            console.error('[categories] Failed to fetch categories', error)
            return []
          })

        if (fetchToken !== this.categoriesFetchToken) {
          return
        }

        if (!categories.length) {
          // Failed to load categories so use local shelves
          console.warn(`[categories] Failed to get server categories so using local categories`)
          this.localLibraryItems = await this.$db.getLocalLibraryItems()
          if (fetchToken !== this.categoriesFetchToken) {
            return
          }
          const localCategories = this.getLocalMediaItemCategories()
          this.shelves = localCategories
          this.scheduleVisibleRssHydration()
          this.lastServerFetch = 0
          this.lastLocalFetch = Date.now()
          this.isLoading = false
          console.log('[categories] Local shelves set from failure', this.shelves.length, this.lastLocalFetch)
          return
        }

        this.applyShelvesProgressive(categories)
        this.isLoading = false

        const localStartedAt = Date.now()
        this.localLibraryItems = await this.$db.getLocalLibraryItems()
        if (fetchToken !== this.categoriesFetchToken) {
          return
        }
        const localCategories = this.getLocalMediaItemCategories()
        const localShelves = localCategories.filter((cat) => cat.type === this.currentLibraryMediaType && !cat.localOnly)

        const enrichedShelves = this.enrichShelvesWithLocalItems(this.shelves, this.localLibraryItems)
        const finalShelves = [...enrichedShelves, ...localShelves]
        this.shelves = finalShelves
        this.scheduleVisibleRssHydration()
        this.saveShelvesCache(finalShelves)

        console.log(`[categories] Server shelves ready in ${Date.now() - serverStartedAt}ms, local enrichment in ${Date.now() - localStartedAt}ms`)
        console.log('[categories] Server shelves set', this.shelves.length, this.lastServerFetch)
        return
      }

      // Offline/local only
      this.localLibraryItems = await this.$db.getLocalLibraryItems()
      const localCategories = this.getLocalMediaItemCategories()
      if (fetchToken !== this.categoriesFetchToken) {
        return
      }
      this.shelves = localCategories
      this.scheduleVisibleRssHydration()
      this.saveShelvesCache(localCategories)
      console.log('[categories] Local shelves set', this.shelves.length, this.lastLocalFetch)

      this.isLoading = false
    },
    libraryChanged() {
      if (this.currentLibraryId) {
        this.lastRssHydrationAt = 0
        this.lastRssHydrationLibraryId = null
        console.log(`[categories] libraryChanged so fetching categories`)
        this.fetchCategories()
      }
    },
    audiobookAdded(audiobook) {
      // TODO: Check if audiobook would be on this shelf
      if (!this.search) {
        this.fetchCategories()
      }
    },
    audiobookUpdated(audiobook) {
      this.shelves.forEach((shelf) => {
        if (shelf.type === 'books') {
          shelf.entities = shelf.entities.map((ent) => {
            if (ent.id === audiobook.id) {
              return audiobook
            }
            return ent
          })
        } else if (shelf.type === 'series') {
          shelf.entities.forEach((ent) => {
            ent.books = ent.books.map((book) => {
              if (book.id === audiobook.id) return audiobook
              return book
            })
          })
        }
      })
    },
    removeBookFromShelf(audiobook) {
      this.shelves.forEach((shelf) => {
        if (shelf.type === 'books') {
          shelf.entities = shelf.entities.filter((ent) => {
            return ent.id !== audiobook.id
          })
        } else if (shelf.type === 'series') {
          shelf.entities.forEach((ent) => {
            ent.books = ent.books.filter((book) => {
              return book.id !== audiobook.id
            })
          })
        }
      })
    },
    initListeners() {
      this.$eventBus.$on('library-changed', this.libraryChanged)
    },
    removeListeners() {
      this.$eventBus.$off('library-changed', this.libraryChanged)
    }
  },
  async mounted() {
    if (this.$route.query.error) {
      this.$toast.error(this.$route.query.error)
    }

    this.initListeners()
    this.loadShelvesCache()
    console.log(`[categories] mounted so fetching categories`)
    this.fetchCategories()
    this.$store.dispatch('globals/loadLocalMediaProgress').then(() => {
      if (!this.networkConnected) {
        this.fetchCategories()
      }
    })
  },
  beforeDestroy() {
    if (this.rssHydrationTimer) {
      clearTimeout(this.rssHydrationTimer)
      this.rssHydrationTimer = null
    }
    this.removeListeners()
  }
}
</script>
