<template>
  <div class="w-full h-full overflow-y-auto relative bg-bg" style="-webkit-overflow-scrolling: touch">
    <!-- Header -->
    <p class="text-xs font-semibold text-fg-muted uppercase tracking-wider px-4 pt-6 pb-2">History for {{ displayTitle }}</p>

    <!-- Empty state -->
    <div v-if="!mediaEvents.length" class="mx-4 mb-4">
      <div class="bg-secondary rounded-xl px-6 py-8 text-center">
        <span class="material-symbols text-3xl text-fg-muted mb-2">history</span>
        <p class="text-sm text-fg-muted">No History</p>
      </div>
    </div>

    <!-- Grouped events -->
    <div v-for="(events, name) in groupedMediaEvents" :key="name" class="mb-4">
      <p class="text-xs font-semibold text-fg-muted uppercase tracking-wider px-4 pt-4 pb-2">{{ name }}</p>
      <div class="bg-secondary rounded-xl mx-4 overflow-hidden">
        <div v-for="(evt, index) in events" :key="index" class="px-4 py-3 flex items-center border-b border-warm last:border-0">
          <p class="text-xs text-fg-muted w-10 font-mono">{{ $formatDate(evt.timestamp, 'HH:mm') }}</p>
          <span class="material-symbols fill text-lg mx-2" :class="`text-${getEventColor(evt.name)}`">{{ getEventIcon(evt.name) }}</span>
          <p class="text-sm text-fg">{{ evt.name }}</p>

          <span v-if="evt.serverSyncAttempted && evt.serverSyncSuccess" class="material-symbols px-1 text-base text-success">cloud_done</span>
          <span v-if="evt.serverSyncAttempted && !evt.serverSyncSuccess" class="material-symbols px-1 text-base text-error">error_outline</span>

          <p v-if="evt.num" class="text-xs text-fg-muted italic px-1">+{{ evt.num }}</p>

          <div class="flex-grow" />
          <p class="text-sm text-fg font-mono" @click="clickPlaybackTime(evt.currentTime)">{{ $secondsToTimestampFull(evt.currentTime) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { AbsAudioPlayer } from '@/plugins/capacitor'

export default {
  async asyncData({ params, store, redirect, app, query }) {
    const mediaItemHistory = await app.$db.getMediaItemHistory(params.id)

    return {
      title: query.title || 'Unknown',
      mediaItemHistory
    }
  },
  data() {
    return {
      onMediaItemHistoryUpdatedListener: null
    }
  },
  computed: {
    displayTitle() {
      if (!this.mediaItemHistory) return this.title
      return this.mediaItemHistory.mediaDisplayTitle
    },
    mediaEvents() {
      if (!this.mediaItemHistory) return []
      return (this.mediaItemHistory.events || []).sort((a, b) => b.timestamp - a.timestamp)
    },
    mediaItemLibraryItemId() {
      if (!this.mediaItemHistory) return null
      return this.mediaItemHistory.libraryItemId
    },
    mediaItemEpisodeId() {
      if (!this.mediaItemHistory) return null
      return this.mediaItemHistory.episodeId
    },
    groupedMediaEvents() {
      const groups = {}

      const today = this.$formatDate(new Date(), 'MMM dd, yyyy')
      const yesterday = this.$formatDate(Date.now() - 1000 * 60 * 60 * 24, 'MMM dd, yyyy')

      let lastKey = null
      let numSaves = 0
      let numSyncs = 0
      let lastSaveName = null

      this.mediaEvents.forEach((evt) => {
        const date = this.$formatDate(evt.timestamp, 'MMM dd, yyyy')
        let include = true
        let keyUpdated = false

        let key = date
        if (date === today) key = 'Today'
        else if (date === yesterday) key = 'Yesterday'

        if (!groups[key]) groups[key] = []

        if (!lastKey || lastKey !== key) {
          lastKey = key
          keyUpdated = true
        }

        // Collapse saves
        if (evt.name === 'Save') {
          let saveName = evt.name + '-' + evt.serverSyncAttempted + '-' + evt.serverSyncSuccess
          if (lastSaveName === saveName && numSaves > 0 && !keyUpdated) {
            include = false
            const totalInGroup = groups[key].length
            groups[key][totalInGroup - 1].num = numSaves
            numSaves++
          } else {
            numSaves = 1
          }
          lastSaveName = saveName
        } else {
          numSaves = 0
        }

        // Collapse syncs
        if (evt.name === 'Sync') {
          if (numSyncs > 0 && !keyUpdated) {
            include = false
            const totalInGroup = groups[key].length
            groups[key][totalInGroup - 1].num = numSyncs
            numSyncs++
          } else {
            numSyncs = 1
          }
        } else {
          numSyncs = 0
        }

        if (include) {
          groups[key].push(evt)
        }
      })

      return groups
    },
    playerIsStartingPlayback() {
      // Play has been pressed and waiting for native play response
      return this.$store.state.playerIsStartingPlayback
    }
  },
  methods: {
    async clickPlaybackTime(time) {
      if (this.playerIsStartingPlayback) return

      await this.$hapticsImpact()
      this.playAtTime(time)
    },
    playAtTime(startTime) {
      this.$store.commit('setPlayerIsStartingPlayback', this.mediaItemEpisodeId || this.mediaItemLibraryItemId)
      // Server may have local
      const localProg = this.$store.getters['globals/getLocalMediaProgressByServerItemId'](this.mediaItemLibraryItemId, this.mediaItemEpisodeId)
      if (localProg) {
        // Has local copy so prefer
        this.$eventBus.$emit('play-item', { libraryItemId: localProg.localLibraryItemId, episodeId: localProg.localEpisodeId, serverLibraryItemId: this.mediaItemLibraryItemId, serverEpisodeId: this.mediaItemEpisodeId, startTime })
      } else {
        // Only on server
        this.$eventBus.$emit('play-item', { libraryItemId: this.mediaItemLibraryItemId, episodeId: this.mediaItemEpisodeId, startTime })
      }
    },
    getEventIcon(name) {
      switch (name) {
        case 'Play':
          return 'play_circle'
        case 'Pause':
          return 'pause_circle'
        case 'Stop':
          return 'stop_circle'
        case 'Save':
          return 'sync'
        case 'Seek':
          return 'commit'
        case 'Sync':
          return 'cloud_download'
        default:
          return 'info'
      }
    },
    getEventColor(name) {
      switch (name) {
        case 'Play':
          return 'success'
        case 'Pause':
          return 'gray-300'
        case 'Stop':
          return 'error'
        case 'Save':
          return 'info'
        case 'Seek':
          return 'gray-200'
        case 'Sync':
          return 'accent'
        default:
          return 'info'
      }
    },
    onMediaItemHistoryUpdated(mediaItemHistory) {
      if (!mediaItemHistory || !mediaItemHistory.id) {
        console.error('Invalid media item history', mediaItemHistory)
        return
      }
      if (mediaItemHistory.id !== this.mediaItemHistory.id) {
        return
      }
      console.log('Media Item History updated')

      this.mediaItemHistory = mediaItemHistory
    }
  },
  async mounted() {
    this.onMediaItemHistoryUpdatedListener = await AbsAudioPlayer.addListener('onMediaItemHistoryUpdated', this.onMediaItemHistoryUpdated)
  },
  beforeDestroy() {
    this.onMediaItemHistoryUpdatedListener?.remove()
  }
}
</script>
