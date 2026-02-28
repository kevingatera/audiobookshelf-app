<template>
  <div class="w-full h-full overflow-hidden" style="-webkit-overflow-scrolling: touch">
    <!-- Log card -->
    <div class="bg-secondary rounded-xl mx-4 mt-4 overflow-hidden flex flex-col" style="max-height: calc(100% - 2rem)">
      <!-- Header -->
      <div class="px-4 py-3 flex items-center justify-between border-b border-warm flex-shrink-0">
        <p class="text-base font-semibold text-fg">{{ $strings.ButtonLogs }}</p>
        <div class="flex items-center gap-2">
          <ui-icon-btn outlined borderless :icon="isCopied ? 'check' : 'content_copy'" @click="copyToClipboard" />
          <ui-icon-btn outlined borderless icon="share" @click="shareLogs" />
          <ui-icon-btn outlined borderless icon="more_vert" @click="showDialog = true" />
        </div>
      </div>

      <!-- Log entries -->
      <div class="overflow-y-auto flex-grow" ref="logContainer" style="-webkit-overflow-scrolling: touch">
        <div v-if="!logs.length && !isLoading" class="flex items-center justify-center h-32 p-4">
          <p class="text-fg-muted text-sm">{{ $strings.MessageNoLogs }}</p>
        </div>

        <div v-for="(log, index) in logs" :key="log.id" class="px-4 py-2 font-mono text-xs border-b border-warm last:border-0">
          <div class="flex items-center gap-3 mb-0.5">
            <div
              class="uppercase font-bold text-xxs"
              :class="{
                'text-error': log.level === 'error',
                'text-warning': log.level === 'warn' || log.level === 'warning',
                'text-fg-muted': log.level === 'info' || log.level === 'debug'
              }"
            >{{ log.level }}</div>
            <div class="text-xxs text-fg-muted">{{ formatEpochToDatetimeString(log.timestamp) }}</div>
            <div class="flex-grow"></div>
            <div class="text-xxs text-fg-muted">{{ log.tag }}</div>
          </div>
          <div class="break-words text-fg/80">{{ maskServerAddress ? log.maskedMessage : log.message }}</div>
        </div>
      </div>
    </div>

    <modals-dialog v-model="showDialog" :items="dialogItems" @action="dialogAction" />
  </div>
</template>

<script>
import { AbsLogger } from '@/plugins/capacitor'
import { FileSharer } from '@webnativellc/capacitor-filesharer'

export default {
  data() {
    return {
      logs: [],
      isLoading: true,
      isCopied: false,
      hasScrolled: false,
      maskServerAddress: true,
      showDialog: false
    }
  },
  computed: {
    dialogItems() {
      return [
        {
          text: this.maskServerAddress ? this.$strings.ButtonUnmaskServerAddress : this.$strings.ButtonMaskServerAddress,
          value: 'toggle-mask-server-address',
          icon: this.maskServerAddress ? 'remove_moderator' : 'shield'
        },
        {
          text: this.$strings.ButtonClearLogs,
          value: 'clear-logs',
          icon: 'delete'
        }
      ]
    }
  },
  methods: {
    async dialogAction(action) {
      await this.$hapticsImpact()

      if (action === 'clear-logs') {
        await AbsLogger.clearLogs()
        this.logs = []
      } else if (action === 'toggle-mask-server-address') {
        this.maskServerAddress = !this.maskServerAddress
      }
      this.showDialog = false
    },
    clearLogs() {
      AbsLogger.clearLogs().then(() => {
        this.logs = []
      })
    },
    toggleMaskServerAddress() {
      this.maskServerAddress = !this.maskServerAddress
    },
    async copyToClipboard() {
      await this.$hapticsImpact()
      this.$copyToClipboard(this.getLogsString()).then(() => {
        this.isCopied = true
        setTimeout(() => {
          this.isCopied = false
        }, 2000)
      })
    },
    /**
     * Formats an epoch timestamp to YYYY-MM-DD HH:mm:ss.SSS
     * Use 24 hour time format
     * @param {number} epoch
     * @returns {string}
     */
    formatEpochToDatetimeString(epoch) {
      return new Date(epoch)
        .toLocaleString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          fractionalSecondDigits: 3,
          hour12: false
        })
        .replace(',', '')
    },
    getLogsString() {
      return this.logs
        .map((log) => {
          const logMessage = this.maskServerAddress ? log.maskedMessage : log.message
          return `${this.formatEpochToDatetimeString(log.timestamp)} [${log.level.toUpperCase()}] ${logMessage}`
        })
        .join('\n')
    },
    async shareLogs() {
      await this.$hapticsImpact()
      // Share .txt file with logs
      const base64Data = Buffer.from(this.getLogsString()).toString('base64')

      FileSharer.share({
        filename: `abs_logs_${this.$platform}_${this.$config.version}.txt`,
        contentType: 'text/plain',
        base64Data
      }).catch((error) => {
        if (error.message !== 'USER_CANCELLED') {
          console.error('Failed to share', error.message)
          this.$toast.error('Failed to share: ' + error.message)
        }
      })
    },
    scrollToBottom() {
      this.$refs.logContainer.scrollTop = this.$refs.logContainer.scrollHeight
      this.hasScrolled = this.$refs.logContainer.scrollTop > 0
    },
    maskLogMessage(message) {
      return message.replace(/(https?:\/\/)\S+/g, '$1[SERVER_ADDRESS]')
    },
    loadLogs() {
      this.isLoading = true
      AbsLogger.getAllLogs()
        .then((logData) => {
          const logs = logData.value || []
          this.logs = logs.map((log) => {
            log.maskedMessage = this.maskLogMessage(log.message)
            return log
          })
          this.$nextTick(() => {
            this.scrollToBottom()
          })
          this.isLoading = false
        })
        .catch((error) => {
          this.isLoading = false
          console.error('Failed to load logs', error)
          this.$toast.error('Failed to load logs: ' + error.message)
        })
    }
  },
  mounted() {
    AbsLogger.addListener('onLog', (log) => {
      log.maskedMessage = this.maskLogMessage(log.message)
      this.logs.push(log)
      this.logs.sort((a, b) => a.timestamp - b.timestamp)

      this.$nextTick(() => {
        this.scrollToBottom()
      })
    })
    this.loadLogs()
  },
  beforeDestroy() {
    AbsLogger.removeAllListeners()
  }
}
</script>
