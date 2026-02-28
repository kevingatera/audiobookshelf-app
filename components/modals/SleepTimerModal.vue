<template>
  <modals-bottom-sheet v-model="show" :title="$strings.HeaderSleepTimer">
    <div class="w-full">
      <!-- Manual timer input -->
      <div v-if="manualTimerModal" class="p-4">
        <div class="flex mb-4 items-center" @click="manualTimerModal = false">
          <span class="material-symbols text-3xl text-fg cursor-pointer">arrow_back</span>
          <span class="text-fg ml-2">{{ $strings.ButtonBack }}</span>
        </div>
        <div class="flex my-2 justify-between items-center">
          <ui-btn @click="decreaseManualTimeout" class="w-9 h-9" :padding-x="0" small style="max-width: 36px"><span class="material-symbols text-lg">remove</span></ui-btn>
          <p class="text-2xl font-mono text-center text-fg">{{ manualTimeoutMin }} min</p>
          <ui-btn @click="increaseManualTimeout" class="w-9 h-9" :padding-x="0" small style="max-width: 36px"><span class="material-symbols text-lg">add</span></ui-btn>
        </div>
        <ui-btn @click="clickedOption(manualTimeoutMin)" class="w-full mt-4">{{ $strings.ButtonSetTimer }}</ui-btn>
      </div>

      <!-- Timer running -->
      <div v-else-if="sleepTimerRunning" class="p-4">
        <div class="flex my-2 justify-between items-center">
          <ui-btn @click="decreaseSleepTime" class="w-9 h-9" :padding-x="0" small style="max-width: 36px"><span class="material-symbols text-lg">remove</span></ui-btn>
          <p class="text-2xl font-mono text-center text-fg">{{ timeRemainingPretty }}</p>
          <ui-btn @click="increaseSleepTime" class="w-9 h-9" :padding-x="0" small style="max-width: 36px"><span class="material-symbols text-lg">add</span></ui-btn>
        </div>
        <ui-btn @click="cancelSleepTimer" class="w-full mt-4">{{ isAuto ? $strings.ButtonDisableAutoTimer : $strings.ButtonCancelTimer }}</ui-btn>
      </div>

      <!-- Timer options list -->
      <ul v-else class="w-full" role="listbox" aria-labelledby="listbox-label">
        <li
          v-for="timeout in timeouts"
          :key="timeout"
          class="text-fg select-none relative cursor-pointer border-b border-warm"
          style="min-height: 48px"
          role="option"
          @click="clickedOption(timeout)"
        >
          <div class="flex items-center justify-center py-3.5">
            <span class="font-normal block truncate text-lg">{{ timeout }} min</span>
          </div>
        </li>
        <li
          v-if="currentEndOfChapterTime"
          class="text-fg select-none relative cursor-pointer border-b border-warm"
          style="min-height: 48px"
          role="option"
          @click="clickedChapterOption()"
        >
          <div class="flex items-center justify-center py-3.5">
            <span class="font-normal block truncate text-lg text-center">{{ $strings.LabelEndOfChapter }}</span>
          </div>
        </li>
        <li
          class="text-fg select-none relative cursor-pointer"
          style="min-height: 48px"
          role="option"
          @click="manualTimerModal = true"
        >
          <div class="flex items-center justify-center py-3.5">
            <span class="font-normal block truncate text-lg text-center">{{ $strings.LabelCustomTime }}</span>
          </div>
        </li>
      </ul>
    </div>
  </modals-bottom-sheet>
</template>

<script>
import { Dialog } from '@capacitor/dialog'

export default {
  props: {
    value: Boolean,
    currentTime: Number,
    sleepTimerRunning: Boolean,
    currentEndOfChapterTime: Number,
    isAuto: Boolean
  },
  data() {
    return {
      manualTimerModal: false,
      manualTimeoutMin: 1
    }
  },
  computed: {
    show: {
      get() {
        return this.value
      },
      set(val) {
        if (!val) {
          this.manualTimerModal = false
        }
        this.$emit('input', val)
      }
    },
    timeouts() {
      return [5, 10, 15, 30, 45, 60, 90]
    },
    timeRemainingPretty() {
      if (this.currentTime <= 0) return '0:00'
      return this.$secondsToTimestamp(this.currentTime)
    },
    isIos() {
      return this.$platform === 'ios'
    }
  },
  methods: {
    async clickedChapterOption() {
      await this.$hapticsImpact()
      this.show = false
      this.$nextTick(() => this.$emit('change', { time: this.currentEndOfChapterTime * 1000, isChapterTime: true }))
    },
    async clickedOption(timeoutMin) {
      await this.$hapticsImpact()
      const timeout = timeoutMin * 1000 * 60
      this.show = false
      this.manualTimerModal = false
      this.$nextTick(() => this.$emit('change', { time: timeout, isChapterTime: false }))
    },
    async cancelSleepTimer() {
      if (this.isAuto) {
        const { value } = await Dialog.confirm({
          title: this.$strings.HeaderConfirm,
          message: this.$strings.MessageConfirmDisableAutoTimer
        })
        if (!value) return
      }

      await this.$hapticsImpact()
      this.$emit('cancel')
      this.show = false
    },
    async increaseSleepTime() {
      await this.$hapticsImpact()
      this.$emit('increase')
    },
    async decreaseSleepTime() {
      await this.$hapticsImpact()
      this.$emit('decrease')
    },
    async increaseManualTimeout() {
      await this.$hapticsImpact()
      this.manualTimeoutMin++
    },
    async decreaseManualTimeout() {
      await this.$hapticsImpact()
      if (this.manualTimeoutMin > 1) this.manualTimeoutMin--
    }
  },
  mounted() {}
}
</script>
