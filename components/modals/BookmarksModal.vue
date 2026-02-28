<template>
  <modals-bottom-sheet v-model="show" :title="$strings.LabelYourBookmarks">
    <div class="w-full">
      <!-- Bookmark title input / edit view -->
      <div v-if="showBookmarkTitleInput" class="p-4">
        <div class="flex mb-4 items-center">
          <div class="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white hover:bg-opacity-10 cursor-pointer" @click.stop="showBookmarkTitleInput = false">
            <span class="material-symbols text-3xl text-fg">arrow_back</span>
          </div>
          <p class="text-xl pl-2 text-fg">{{ selectedBookmark ? 'Edit Bookmark' : 'New Bookmark' }}</p>
          <div class="flex-grow" />
          <p class="text-xl font-mono text-fg-muted">{{ this.$secondsToTimestamp(currentTime / _playbackRate) }}</p>
        </div>

        <ui-text-input-with-label v-model="newBookmarkTitle" :placeholder="bookmarkPlaceholder()" :autofocus="false" ref="noteInput" label="Note" />
        <div class="flex justify-end mt-6">
          <ui-btn color="success" class="w-full" @click.stop="submitBookmark">{{ selectedBookmark ? 'Update' : 'Create' }}</ui-btn>
        </div>
      </div>

      <!-- Bookmark list view -->
      <div v-else class="w-full">
        <template v-for="bookmark in bookmarks">
          <div :key="bookmark.time" class="border-b border-warm">
            <modals-bookmarks-bookmark-item :highlight="currentTime === bookmark.time" :bookmark="bookmark" :playback-rate="_playbackRate" @click="clickBookmark" @edit="editBookmark" @delete="deleteBookmark" />
          </div>
        </template>
        <div v-if="!bookmarks.length" class="flex h-32 items-center justify-center">
          <p class="text-xl text-fg-muted">{{ $strings.MessageNoBookmarks }}</p>
        </div>
      </div>

      <!-- Create bookmark button -->
      <div v-if="canCreateBookmark && !showBookmarkTitleInput" class="flex px-4 py-3 items-center text-center justify-between border-t border-warm bg-success cursor-pointer text-white text-opacity-80 sticky bottom-0 left-0 w-full" @click.stop="createBookmark">
        <span class="material-symbols">add</span>
        <p class="text-base pl-2">{{ $strings.ButtonCreateBookmark }}</p>
        <p class="text-sm font-mono">{{ this.$secondsToTimestamp(currentTime / _playbackRate) }}</p>
      </div>
    </div>
  </modals-bottom-sheet>
</template>

<script>
import { Dialog } from '@capacitor/dialog'

export default {
  props: {
    value: Boolean,
    bookmarks: {
      type: Array,
      default: () => []
    },
    currentTime: {
      type: Number,
      default: 0
    },
    playbackRate: {
      type: Number,
      default: 1
    },
    libraryItemId: String
  },
  data() {
    return {
      selectedBookmark: null,
      showBookmarkTitleInput: false,
      newBookmarkTitle: ''
    }
  },
  watch: {
    show(newVal) {
      if (newVal) {
        this.showBookmarkTitleInput = false
        this.newBookmarkTitle = ''
      }
    }
  },
  computed: {
    show: {
      get() {
        return this.value
      },
      set(val) {
        this.$emit('input', val)
      }
    },
    canCreateBookmark() {
      return !this.bookmarks.find((bm) => bm.time === this.currentTime)
    },
    _playbackRate() {
      if (!this.playbackRate || isNaN(this.playbackRate)) return 1
      return this.playbackRate
    }
  },
  methods: {
    bookmarkPlaceholder() {
      // using a method prevents caching the date
      return this.$formatDate(Date.now(), 'MMM dd, yyyy HH:mm')
    },
    editBookmark(bm) {
      this.selectedBookmark = bm
      this.newBookmarkTitle = bm.title
      this.showBookmarkTitleInput = true
    },
    async deleteBookmark(bm) {
      await this.$hapticsImpact()
      const { value } = await Dialog.confirm({
        title: 'Remove Bookmark',
        message: this.$strings.MessageConfirmRemoveBookmark
      })
      if (!value) return

      this.$nativeHttp
        .delete(`/api/me/item/${this.libraryItemId}/bookmark/${bm.time}`)
        .then(() => {
          this.$store.commit('user/deleteBookmark', { libraryItemId: this.libraryItemId, time: bm.time })
        })
        .catch((error) => {
          this.$toast.error(this.$strings.ToastBookmarkRemoveFailed)
          console.error(error)
        })
    },
    async clickBookmark(bm) {
      await this.$hapticsImpact()
      this.$emit('select', bm)
    },
    submitUpdateBookmark(updatedBookmark) {
      this.$nativeHttp
        .patch(`/api/me/item/${this.libraryItemId}/bookmark`, updatedBookmark)
        .then((bookmark) => {
          this.$store.commit('user/updateBookmark', bookmark)
          this.showBookmarkTitleInput = false
        })
        .catch((error) => {
          this.$toast.error(this.$strings.ToastBookmarkUpdateFailed)
          console.error(error)
        })
    },
    submitCreateBookmark() {
      if (!this.newBookmarkTitle) {
        this.newBookmarkTitle = this.$formatDate(Date.now(), 'MMM dd, yyyy HH:mm')
      }
      const bookmark = {
        title: this.newBookmarkTitle,
        time: Math.floor(this.currentTime)
      }
      this.$nativeHttp
        .post(`/api/me/item/${this.libraryItemId}/bookmark`, bookmark)
        .then(() => {
          this.$toast.success('Bookmark added')
        })
        .catch((error) => {
          this.$toast.error(this.$strings.ToastBookmarkCreateFailed)
          console.error(error)
        })

      this.newBookmarkTitle = ''
      this.showBookmarkTitleInput = false

      this.show = false
    },
    createBookmark() {
      this.selectedBookmark = null
      this.newBookmarkTitle = ''
      this.showBookmarkTitleInput = true
    },
    async submitBookmark() {
      await this.$hapticsImpact()
      if (this.selectedBookmark) {
        var updatePayload = {
          ...this.selectedBookmark,
          title: this.newBookmarkTitle
        }
        this.submitUpdateBookmark(updatePayload)
      } else {
        this.submitCreateBookmark()
      }
    }
  },
  mounted() {}
}
</script>
