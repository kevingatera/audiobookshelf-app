<template>
  <div class="w-full h-full bg-bg">
    <!-- Section header -->
    <div class="flex items-center px-4 pt-6 pb-2">
      <p class="text-xs font-semibold text-fg-muted uppercase tracking-wider">{{ $strings.HeaderLocalFolders }}</p>
      <button type="button" class="material-symbols text-base text-fg-muted ml-2" @click.stop="showLocalFolderMoreInfo">info</button>
    </div>

    <div v-if="!isIos">
      <!-- Folders list -->
      <div v-if="localFolders.length" class="bg-secondary rounded-xl mx-4 mb-4 overflow-hidden">
        <template v-for="folder in localFolders">
          <nuxt-link :to="`/localMedia/folders/${folder.id}`" :key="folder.id" class="flex items-center px-4 py-3 border-b border-warm last:border-0">
            <span class="material-symbols fill text-xl text-yellow-400">folder</span>
            <div class="flex-grow ml-3 min-w-0">
              <p class="text-sm text-fg truncate">{{ folder.name }}</p>
              <p class="text-xs text-fg-muted mt-0.5 capitalize">{{ folder.mediaType }}s</p>
            </div>
            <span class="material-symbols text-lg text-fg-muted ml-2">chevron_right</span>
          </nuxt-link>
        </template>
      </div>

      <!-- Empty state -->
      <div v-if="!localFolders.length" class="mx-4 mb-4">
        <div class="bg-secondary rounded-xl px-6 py-8 text-center">
          <span class="material-symbols text-3xl text-fg-muted mb-2">folder_off</span>
          <p class="text-sm text-fg-muted">{{ $strings.MessageNoMediaFolders }}</p>
        </div>
      </div>

      <!-- Add new folder -->
      <div v-if="!isAndroid10OrBelow || overrideFolderRestriction" class="mx-4 mb-4">
        <div class="bg-secondary rounded-xl px-4 py-3 flex items-center">
          <div class="flex-grow pr-2">
            <ui-dropdown v-model="newFolderMediaType" :placeholder="$strings.LabelSelectMediaType" :items="mediaTypeItems" />
          </div>
          <ui-btn small class="w-28" color="success" @click="selectFolder">{{ $strings.ButtonNewFolder }}</ui-btn>
        </div>
      </div>
      <div v-else class="mx-4 mb-4">
        <div class="bg-secondary rounded-xl px-4 py-3 flex items-center">
          <div class="flex-grow pr-2">
            <p class="text-sm text-fg-muted">{{ $strings.MessageAndroid10Downloads }}</p>
          </div>
          <ui-btn small class="w-28" color="primary" @click="overrideFolderRestriction = true">{{ $strings.ButtonOverride }}</ui-btn>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { AbsFileSystem } from '@/plugins/capacitor'
import { Dialog } from '@capacitor/dialog'

export default {
  data() {
    return {
      localFolders: [],
      localLibraryItems: [],
      newFolderMediaType: null,
      mediaTypeItems: [
        {
          value: 'book',
          text: this.$strings.LabelBooks
        },
        {
          value: 'podcast',
          text: this.$strings.LabelPodcasts
        }
      ],
      syncing: false,
      isAndroid10OrBelow: false,
      overrideFolderRestriction: false
    }
  },
  computed: {
    isIos() {
      return this.$platform === 'ios'
    }
  },
  methods: {
    async selectFolder() {
      if (!this.newFolderMediaType) {
        return this.$toast.error('Must select a media type')
      }
      var folderObj = await AbsFileSystem.selectFolder({ mediaType: this.newFolderMediaType })
      if (!folderObj) return
      if (folderObj.error) {
        return this.$toast.error(`Error: ${folderObj.error || 'Unknown Error'}`)
      }

      const indexOfExisting = this.localFolders.findIndex((lf) => lf.id == folderObj.id)
      if (indexOfExisting >= 0) {
        this.localFolders.splice(indexOfExisting, 1, folderObj)
      } else {
        this.localFolders.push(folderObj)
      }

      const permissionsGood = await AbsFileSystem.checkFolderPermissions({ folderUrl: folderObj.contentUrl })

      if (!permissionsGood) {
        this.$toast.error('Folder permissions failed')
        return
      } else {
        this.$toast.success('Folder permission success')
      }
    },
    async showLocalFolderMoreInfo() {
      const confirmResult = await Dialog.confirm({
        title: this.$strings.HeaderLocalFolders,
        message: this.$strings.MessageLocalFolderDescription,
        cancelButtonTitle: 'View More'
      })
      if (!confirmResult.value) {
        window.open('https://www.audiobookshelf.org/guides/android_app_shared_storage', '_blank')
      }
    },
    async init() {
      const androidSdkVersion = await this.$getAndroidSDKVersion()
      this.isAndroid10OrBelow = !!androidSdkVersion && androidSdkVersion <= 29
      console.log(`androidSdkVersion=${androidSdkVersion}, isAndroid10OrBelow=${this.isAndroid10OrBelow}`)

      this.localFolders = (await this.$db.getLocalFolders()) || []
      this.localLibraryItems = await this.$db.getLocalLibraryItems()
    }
  },
  mounted() {
    this.init()
  }
}
</script>
