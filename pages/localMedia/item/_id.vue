<template>
  <div class="w-full h-full bg-bg">
    <div v-if="localLibraryItem" class="w-full h-full">
      <!-- Header -->
      <div class="px-4 pt-6 pb-2 flex items-center">
        <p class="text-base font-semibold text-fg truncate flex-grow">{{ mediaMetadata.title }}</p>

        <button v-if="audioTracks.length && !isPodcast" class="text-success flex items-center justify-center rounded-full mx-2" @click.stop="play">
          <span class="material-symbols fill" style="font-size: 2rem">play_arrow</span>
        </button>
        <span class="material-symbols text-2xl text-fg-muted" @click="showItemDialog">more_vert</span>
      </div>

      <p v-if="!isIos" class="px-4 text-xs text-fg-muted">{{ $strings.LabelFolder }}: {{ folderName }}</p>
      <p class="px-4 mb-4 text-xs text-fg-muted mt-0.5">{{ libraryItemId ? 'Linked to item on server ' + liServerAddress : 'Not linked to server item' }}</p>

      <div class="w-full max-w-full media-item-container overflow-y-auto overflow-x-hidden relative pb-4" :class="{ 'media-order-changed': orderChanged }" style="-webkit-overflow-scrolling: touch">
        <!-- Audio Tracks section (books) -->
        <div v-if="!isPodcast && audioTracksCopy.length">
          <div class="flex justify-between items-center px-4 pt-2 pb-2">
            <p class="text-xs font-semibold text-fg-muted uppercase tracking-wider">Audio Tracks ({{ audioTracks.length }})</p>
            <p class="text-xs text-fg-muted">{{ $strings.LabelTotalSize }}: {{ $bytesPretty(totalAudioSize) }}</p>
          </div>

          <div class="bg-secondary rounded-xl mx-4 mb-4 overflow-hidden">
            <draggable v-model="audioTracksCopy" v-bind="dragOptions" handle=".drag-handle" draggable=".item" tag="div" @start="drag = true" @end="drag = false" @update="draggableUpdate" :disabled="isIos">
              <transition-group type="transition" :name="!drag ? 'dragtrack' : null">
                <template v-for="track in audioTracksCopy">
                  <div :key="track.localFileId" class="flex items-center px-4 py-3 border-b border-warm last:border-0 item">
                    <div v-if="!isIos" class="w-6 flex items-center justify-center mr-2" style="min-width: 24px">
                      <span class="material-symbols drag-handle text-base text-fg-muted">drag_indicator</span>
                    </div>
                    <div class="w-7 flex items-center justify-center mr-2" style="min-width: 28px">
                      <p class="font-mono font-bold text-base text-fg">{{ track.index }}</p>
                    </div>
                    <div class="flex-grow min-w-0">
                      <p class="text-sm text-fg truncate">{{ track.title }}</p>
                      <p class="text-xs text-fg-muted mt-0.5">{{ track.mimeType }} &middot; {{ $elapsedPretty(track.duration) }}</p>
                    </div>
                    <div v-if="!isIos" class="ml-2">
                      <span class="material-symbols text-xl text-fg-muted" @click="showTrackDialog(track)">more_vert</span>
                    </div>
                  </div>
                </template>
              </transition-group>
            </draggable>
          </div>
        </div>

        <!-- Episodes section (podcasts) -->
        <div v-if="isPodcast">
          <div class="flex justify-between items-center px-4 pt-2 pb-2">
            <p class="text-xs font-semibold text-fg-muted uppercase tracking-wider">Episodes ({{ episodes.length }})</p>
            <p class="text-xs text-fg-muted">{{ $strings.LabelTotalSize }}: {{ $bytesPretty(totalEpisodesSize) }}</p>
          </div>

          <div class="bg-secondary rounded-xl mx-4 mb-4 overflow-hidden">
            <template v-for="episode in episodes">
              <div :key="episode.id" class="flex items-center px-4 py-3 border-b border-warm last:border-0">
                <div class="w-7 flex items-center justify-center mr-2" style="min-width: 28px">
                  <p class="font-mono font-bold text-base text-fg">{{ episode.index }}</p>
                </div>
                <div class="flex-grow min-w-0">
                  <p class="text-sm text-fg truncate">{{ episode.title }}</p>
                  <p class="text-xs text-fg-muted mt-0.5">{{ episode.audioTrack.mimeType }} &middot; {{ $elapsedPretty(episode.audioTrack.duration) }}</p>
                </div>
                <span class="material-symbols text-xl text-fg-muted ml-2" @click="showTrackDialog(episode)">more_vert</span>
              </div>
            </template>
          </div>
        </div>

        <!-- EBook File section -->
        <div v-if="localFileForEbook">
          <p class="text-xs font-semibold text-fg-muted uppercase tracking-wider px-4 pt-2 pb-2">EBook File</p>

          <div class="bg-secondary rounded-xl mx-4 mb-4 overflow-hidden">
            <div class="flex items-center px-4 py-3">
              <div class="w-8 flex items-center justify-center mr-3">
                <p class="font-mono font-bold text-xs text-fg-muted uppercase">{{ ebookFile.ebookFormat }}</p>
              </div>
              <div class="flex-grow min-w-0">
                <p class="text-sm text-fg truncate">{{ localFileForEbook.filename }}</p>
                <p class="text-xs text-fg-muted mt-0.5">{{ localFileForEbook.mimeType }} &middot; {{ $bytesPretty(localFileForEbook.size) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Other Files section -->
        <div v-if="otherFiles.length">
          <div class="flex justify-between items-center px-4 pt-2 pb-2">
            <p class="text-xs font-semibold text-fg-muted uppercase tracking-wider">Other Files</p>
            <p class="text-xs text-fg-muted">{{ $strings.LabelTotalSize }}: {{ $bytesPretty(totalOtherFilesSize) }}</p>
          </div>

          <div class="bg-secondary rounded-xl mx-4 mb-4 overflow-hidden">
            <template v-for="file in otherFiles">
              <div :key="file.id" class="flex items-center px-4 py-3 border-b border-warm last:border-0">
                <div class="w-10 h-10 rounded-lg overflow-hidden bg-primary flex items-center justify-center mr-3" style="min-width: 40px">
                  <img v-if="(file.mimeType || '').startsWith('image')" :src="getCapImageSrc(file.contentUrl)" class="w-full h-full object-contain" />
                  <span v-else class="material-symbols text-fg-muted">music_note</span>
                </div>
                <div class="flex-grow min-w-0">
                  <p class="text-sm text-fg truncate">{{ file.filename }}</p>
                  <p class="text-xs text-fg-muted mt-0.5">{{ file.mimeType }} &middot; {{ $bytesPretty(file.size) }}</p>
                </div>
              </div>
            </template>
          </div>
        </div>

        <!-- Total size summary -->
        <div class="mx-4 mb-4 bg-secondary rounded-xl px-4 py-3">
          <p class="text-xs text-fg-muted">{{ $strings.LabelTotalSize }}: {{ $bytesPretty(totalLibraryItemSize) }}</p>
        </div>
      </div>
    </div>

    <!-- Loading / error state -->
    <div v-else class="w-full h-full flex items-center justify-center px-6">
      <div class="bg-secondary rounded-xl px-6 py-8 text-center">
        <span class="material-symbols text-3xl text-fg-muted mb-2">{{ failed ? 'error_outline' : 'hourglass_empty' }}</span>
        <p class="text-sm text-fg-muted">{{ failed ? 'Failed to get local library item ' + localLibraryItemId : 'Loading..' }}</p>
      </div>
    </div>

    <!-- Save order bar -->
    <div v-if="orderChanged" class="fixed left-0 w-full py-4 px-4 bg-bg box-shadow-book flex items-center" :style="{ bottom: isPlayerOpen ? '64px' : '0px' }">
      <div class="flex-grow" />
      <ui-btn small color="success" @click="saveTrackOrder">{{ $strings.ButtonSaveOrder }}</ui-btn>
    </div>

    <modals-dialog v-model="showDialog" :items="dialogItems" @action="dialogAction" />
  </div>
</template>

<script>
import draggable from 'vuedraggable'

import { Capacitor } from '@capacitor/core'
import { Dialog } from '@capacitor/dialog'
import { AbsFileSystem } from '@/plugins/capacitor'

export default {
  components: {
    draggable
  },
  asyncData({ params }) {
    return {
      localLibraryItemId: params.id
    }
  },
  data() {
    return {
      drag: false,
      dragOptions: {
        animation: 200,
        group: 'description',
        delay: 40,
        delayOnTouchOnly: true
      },
      failed: false,
      localLibraryItem: null,
      audioTracksCopy: [],
      removingItem: false,
      folderId: null,
      folder: null,
      showDialog: false,
      selectedAudioTrack: null,
      selectedEpisode: null,
      orderChanged: false
    }
  },
  computed: {
    isPlayerOpen() {
      return this.$store.getters['getIsPlayerOpen']
    },
    isIos() {
      return this.$platform === 'ios'
    },
    basePath() {
      return this.localLibraryItem?.basePath
    },
    localFiles() {
      return this.localLibraryItem?.localFiles || []
    },
    otherFiles() {
      if (!this.localFiles.filter) {
        console.error('Invalid local files', this.localFiles)
        return []
      }
      return this.localFiles.filter((lf) => {
        if (this.localFileForEbook?.id === lf.id) return false
        return !this.audioTracks.find((at) => at.localFileId == lf.id)
      })
    },
    folderName() {
      return this.folder?.name
    },
    isInternalStorage() {
      return this.folderId?.startsWith('internal-')
    },
    mediaType() {
      return this.localLibraryItem?.mediaType
    },
    isPodcast() {
      return this.mediaType == 'podcast'
    },
    libraryItemId() {
      return this.localLibraryItem?.libraryItemId
    },
    liServerAddress() {
      return this.localLibraryItem?.serverAddress
    },
    media() {
      return this.localLibraryItem?.media
    },
    mediaMetadata() {
      return this.media?.metadata || {}
    },
    ebookFile() {
      return this.media?.ebookFile
    },
    localFileForEbook() {
      if (!this.ebookFile) return null
      return this.localFiles.find((lf) => lf.id == this.ebookFile.localFileId)
    },
    episodes() {
      return this.media.episodes || []
    },
    audioTracks() {
      if (!this.media) return []
      if (this.mediaType == 'book') {
        return this.media.tracks || []
      } else {
        return (this.media.episodes || []).map((ep) => ep.audioTrack)
      }
    },
    dialogItems() {
      if (this.selectedAudioTrack || this.selectedEpisode) {
        const items = [
          {
            text: this.$strings.ButtonDeleteLocalFile,
            value: 'track-delete',
            icon: 'delete'
          }
        ]
        if (this.isPodcast && this.selectedEpisode) {
          items.unshift({
            text: this.$strings.ButtonPlayEpisode,
            value: 'play-episode',
            icon: 'play_arrow'
          })
        }
        return items
      } else {
        return [
          {
            text: this.$strings.ButtonDeleteLocalItem,
            value: 'delete',
            icon: 'delete'
          }
        ]
      }
    },
    playerIsStartingPlayback() {
      // Play has been pressed and waiting for native play response
      return this.$store.state.playerIsStartingPlayback
    },
    totalAudioSize() {
      return this.audioTracks.reduce((acc, item) => (item.metadata ? acc + item.metadata.size : acc), 0)
    },
    totalEpisodesSize() {
      return this.episodes.reduce((acc, item) => acc + item.size, 0)
    },
    totalOtherFilesSize() {
      return this.otherFiles.reduce((acc, item) => acc + item.size, 0)
    },
    totalLibraryItemSize() {
      return this.localFiles.reduce((acc, item) => acc + item.size, 0)
    }
  },
  methods: {
    draggableUpdate() {
      for (let i = 0; i < this.audioTracksCopy.length; i++) {
        var trackCopy = this.audioTracksCopy[i]
        var track = this.audioTracks[i]
        if (track.localFileId !== trackCopy.localFileId) {
          this.orderChanged = true
          return
        }
      }
      this.orderChanged = false
    },
    async saveTrackOrder() {
      var copyOfCopy = this.audioTracksCopy.map((at) => ({ ...at }))
      const payload = {
        localLibraryItemId: this.localLibraryItemId,
        tracks: copyOfCopy
      }
      var response = await this.$db.updateLocalTrackOrder(payload)
      if (response) {
        this.$toast.success('Library item updated')
        console.log('updateLocal track order response', JSON.stringify(response))
        this.localLibraryItem = response
        this.audioTracksCopy = this.audioTracks.map((at) => ({ ...at }))
      } else {
        this.$toast.info(this.$strings.MessageNoUpdatesWereNecessary)
      }
      this.orderChanged = false
    },
    showItemDialog() {
      this.selectedAudioTrack = null
      this.selectedEpisode = null
      this.showDialog = true
    },
    showTrackDialog(track) {
      if (this.isPodcast) {
        this.selectedAudioTrack = null
        this.selectedEpisode = track
      } else {
        this.selectedEpisode = null
        this.selectedAudioTrack = track
      }
      this.showDialog = true
    },
    async play() {
      if (this.playerIsStartingPlayback) return
      await this.$hapticsImpact()
      this.$store.commit('setPlayerIsStartingPlayback', this.localLibraryItemId)
      this.$eventBus.$emit('play-item', { libraryItemId: this.localLibraryItemId })
    },
    getCapImageSrc(contentUrl) {
      return Capacitor.convertFileSrc(contentUrl)
    },
    async playEpisode() {
      if (!this.selectedEpisode) return
      if (this.playerIsStartingPlayback) return
      await this.$hapticsImpact()
      this.$store.commit('setPlayerIsStartingPlayback', this.selectedEpisode.serverEpisodeId)

      this.$eventBus.$emit('play-item', {
        libraryItemId: this.localLibraryItemId,
        episodeId: this.selectedEpisode.id,
        serverLibraryItemId: this.libraryItemId,
        serverEpisodeId: this.selectedEpisode.serverEpisodeId
      })
    },
    async dialogAction(action) {
      console.log('Dialog action', action)
      await this.$hapticsImpact()

      if (action == 'delete') {
        this.deleteItem()
      } else if (action == 'track-delete') {
        if (this.isPodcast) this.deleteEpisode()
        else this.deleteTrack()
      } else if (action == 'play-episode') {
        this.playEpisode()
      }
      this.showDialog = false
    },
    getLocalFileForTrack(localFileId) {
      return this.localFiles.find((lf) => lf.id == localFileId)
    },
    async deleteEpisode() {
      if (!this.selectedEpisode) return
      var localFile = this.getLocalFileForTrack(this.selectedEpisode.audioTrack.localFileId)
      if (!localFile) {
        this.$toast.error('Audio track does not have matching local file..')
        return
      }

      let confirmMessage = `Remove local audio file "${localFile.basePath}" from your device?`
      if (this.libraryItemId) {
        confirmMessage += ' The file on the server will be unaffected.'
      }
      const { value } = await Dialog.confirm({
        title: this.$strings.HeaderConfirm,
        message: confirmMessage
      })
      if (value) {
        var res = await AbsFileSystem.deleteTrackFromItem({ id: this.localLibraryItem.id, trackLocalFileId: localFile.id, trackContentUrl: this.selectedEpisode.audioTrack.contentUrl })
        if (res && res.id) {
          this.$toast.success('Deleted track successfully')
          this.localLibraryItem = res
        } else this.$toast.error('Failed to delete')
      }
    },
    async deleteTrack() {
      if (!this.selectedAudioTrack) {
        return
      }
      var localFile = this.getLocalFileForTrack(this.selectedAudioTrack.localFileId)
      if (!localFile) {
        this.$toast.error('Audio track does not have matching local file..')
        return
      }

      let confirmMessage = `Remove local audio file "${localFile.basePath}" from your device?`
      if (this.libraryItemId) {
        confirmMessage += ' The file on the server will be unaffected.'
      }
      const { value } = await Dialog.confirm({
        title: this.$strings.HeaderConfirm,
        message: confirmMessage
      })
      if (value) {
        var res = await AbsFileSystem.deleteTrackFromItem({ id: this.localLibraryItem.id, trackLocalFileId: this.selectedAudioTrack.localFileId, trackContentUrl: this.selectedAudioTrack.contentUrl })
        if (res && res.id) {
          this.$toast.success('Deleted track successfully')
          this.localLibraryItem = res
        } else this.$toast.error('Failed to delete')
      }
    },
    async deleteItem() {
      let confirmMessage = 'Remove local files of this item from your device?'
      if (this.libraryItemId) {
        confirmMessage += ' The files on the server and your progress will be unaffected.'
      }
      const { value } = await Dialog.confirm({
        title: this.$strings.HeaderConfirm,
        message: confirmMessage
      })
      if (value) {
        var res = await AbsFileSystem.deleteItem(this.localLibraryItem)
        if (res && res.success) {
          this.$toast.success('Deleted Successfully')
          this.$router.replace(this.isIos ? '/downloads' : `/localMedia/folders/${this.folderId}`)
        } else this.$toast.error('Failed to delete')
      }
    },
    async init() {
      this.localLibraryItem = await this.$db.getLocalLibraryItem(this.localLibraryItemId)

      if (!this.localLibraryItem) {
        console.error('Failed to get local library item', this.localLibraryItemId)
        this.failed = true
        return
      }

      this.audioTracksCopy = this.audioTracks.map((at) => ({ ...at }))

      this.folderId = this.localLibraryItem.folderId
      this.folder = await this.$db.getLocalFolder(this.folderId)
    }
  },
  mounted() {
    this.init()
  }
}
</script>

<style scoped>
.media-item-container {
  height: calc(100vh - 200px);
  max-height: calc(100vh - 200px);
}
.media-item-container.media-order-changed {
  height: calc(100vh - 280px);
  max-height: calc(100vh - 280px);
}
.playerOpen .media-item-container {
  height: calc(100vh - 300px);
  max-height: calc(100vh - 300px);
}
.playerOpen .media-item-container.media-order-changed {
  height: calc(100vh - 380px);
  max-height: calc(100vh - 380px);
}
.sortable-ghost {
  opacity: 0.5;
}
.dragtrack-enter-from,
.dragtrack-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.dragtrack-leave-active {
  position: absolute;
}
</style>
