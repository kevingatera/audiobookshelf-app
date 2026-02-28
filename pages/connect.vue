<template>
  <div class="w-full h-full bg-bg" style="-webkit-overflow-scrolling: touch">
    <div class="relative flex flex-col items-center justify-center min-h-screen sm:pt-0">
      <nuxt-link to="/" class="absolute top-2 left-2 z-20" aria-label="Go back">
        <span class="material-symbols text-4xl text-fg">arrow_back</span>
      </nuxt-link>

      <!-- Logo + App name -->
      <div class="flex flex-col items-center justify-center z-0 short:hidden mb-4">
        <img src="/Logo.png" class="w-20 h-20 mb-3 connect-logo-pulse" />
        <h1 class="text-2xl font-semibold text-fg">audiobookshelf</h1>
      </div>
      <p class="hidden short:block absolute top-1.5 left-12 p-2 text-xl font-semibold text-fg">audiobookshelf</p>

      <!-- Server connect form -->
      <connection-server-connect-form v-if="deviceData" />

      <!-- Backup restore hint -->
      <div v-if="showBackupHint" class="bg-accent/10 border border-accent/20 rounded-xl p-4 mx-6 mt-4 max-w-md w-full">
        <div class="flex items-center gap-3">
          <span class="material-symbols text-accent text-xl">settings_backup_restore</span>
          <div>
            <p class="text-sm font-medium text-fg">Settings backup available</p>
            <p class="text-xs text-fg-muted mt-0.5">A previous backup was found and can be restored</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="flex items-center justify-center pt-4 fixed bottom-4 left-0 right-0">
      <a href="https://github.com/advplyr/audiobookshelf-app" target="_blank" class="text-sm text-fg-muted pr-2">{{ $strings.MessageFollowTheProjectOnGithub }}</a>
      <a href="https://github.com/advplyr/audiobookshelf-app" target="_blank" aria-label="View on GitHub"
        ><svg class="w-8 h-8 text-fg-muted" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" width="32" height="32" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24">
          <path
            d="M12 2.247a10 10 0 0 0-3.162 19.487c.5.088.687-.212.687-.475c0-.237-.012-1.025-.012-1.862c-2.513.462-3.163-.613-3.363-1.175a3.636 3.636 0 0 0-1.025-1.413c-.35-.187-.85-.65-.013-.662a2.001 2.001 0 0 1 1.538 1.025a2.137 2.137 0 0 0 2.912.825a2.104 2.104 0 0 1 .638-1.338c-2.225-.25-4.55-1.112-4.55-4.937a3.892 3.892 0 0 1 1.025-2.688a3.594 3.594 0 0 1 .1-2.65s.837-.262 2.75 1.025a9.427 9.427 0 0 1 5 0c1.912-1.3 2.75-1.025 2.75-1.025a3.593 3.593 0 0 1 .1 2.65a3.869 3.869 0 0 1 1.025 2.688c0 3.837-2.338 4.687-4.563 4.937a2.368 2.368 0 0 1 .675 1.85c0 1.338-.012 2.413-.012 2.75c0 .263.187.575.687.475A10.005 10.005 0 0 0 12 2.247z"
            fill="currentColor"
          /></svg
      ></a>
    </div>
  </div>
</template>

<script>
import { Dialog } from '@capacitor/dialog'

export default {
  layout: 'blank',
  data() {
    return {
      deviceData: null,
      showBackupHint: false
    }
  },
  computed: {},
  methods: {
    async maybeRestoreSettingsBackup() {
      const alreadyPrompted = await this.$localStore.getPreferenceByKey('settingsBackupRestorePrompted')
      if (alreadyPrompted === '1') return

      const backupInfo = await this.$db.getSettingsBackupInfo().catch(() => null)
      if (!backupInfo?.exists) return

      this.showBackupHint = true

      const confirmResult = await Dialog.confirm({
        title: 'Restore settings backup?',
        message: 'A previous Audiobookshelf Homelab settings backup was found in Downloads. Restore it now?',
        okButtonTitle: 'Restore',
        cancelButtonTitle: 'Skip'
      })

      await this.$localStore.setPreferenceByKey('settingsBackupRestorePrompted', '1')
      this.showBackupHint = false

      if (!confirmResult.value) return

      const restoreResult = await this.$db.restoreSettingsBackup().catch(() => null)
      if (restoreResult?.success && restoreResult.deviceData) {
        this.deviceData = restoreResult.deviceData
        this.$store.commit('setDeviceData', restoreResult.deviceData)
      }
    },
    async init() {
      await this.$store.dispatch('setupNetworkListener')
      this.deviceData = await this.$db.getDeviceData()
      this.$store.commit('setDeviceData', this.deviceData)

      if (!this.deviceData?.serverConnectionConfigs?.length) {
        await this.maybeRestoreSettingsBackup()
      }
    }
  },
  mounted() {
    // Reset data on logouts
    this.$store.commit('libraries/reset')
    this.$store.commit('setIsFirstLoad', true)
    this.init()
  }
}
</script>

<style scoped>
.connect-logo-pulse {
  animation: logoPulse 3s ease-in-out infinite;
}

@keyframes logoPulse {
  0%, 100% {
    opacity: 0.85;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.03);
  }
}
</style>
