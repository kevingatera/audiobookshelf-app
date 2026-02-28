<template>
  <div>
    <div class="bottom-sheet-scrim" :class="{ active: value }" @click="onScrimClick" />
    <div
      ref="sheet"
      class="bottom-sheet"
      :class="{ open: value }"
      :style="sheetStyle"
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
    >
      <div ref="handle" class="bottom-sheet-handle" />
      <div v-if="title" class="sheet-header px-4 py-3 flex items-center justify-between border-b border-warm">
        <h3 class="text-base font-semibold text-fg">{{ title }}</h3>
        <button @click="dismiss" class="w-8 h-8 flex items-center justify-center rounded-full">
          <span class="material-symbols text-fg-muted">close</span>
        </button>
      </div>
      <div class="sheet-content overflow-y-auto" :style="{ maxHeight: contentMaxHeight }">
        <slot />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
    maxHeight: {
      type: String,
      default: '85vh'
    },
    persistent: {
      type: Boolean,
      default: false
    },
    processing: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      dragStartY: 0,
      dragCurrentY: 0,
      isDragging: false,
      sheetHeight: 0,
      dragStartTime: 0
    }
  },
  computed: {
    sheetStyle() {
      return {
        maxHeight: this.maxHeight,
        willChange: 'transform'
      }
    },
    contentMaxHeight() {
      // Subtract handle (16px) + header (~52px if title) for content area
      if (this.title) {
        return `calc(${this.maxHeight} - 68px)`
      }
      return `calc(${this.maxHeight} - 16px)`
    }
  },
  watch: {
    value(newVal) {
      if (newVal) {
        this.onOpen()
      } else {
        this.onClose()
      }
    }
  },
  methods: {
    dismiss() {
      if (this.processing || this.persistent) return
      this.$emit('input', false)
    },
    onScrimClick() {
      this.dismiss()
    },
    onOpen() {
      this.$store.commit('globals/setIsModalOpen', true)
      document.documentElement.classList.add('modal-open')
    },
    onClose() {
      this.$store.commit('globals/setIsModalOpen', false)
      document.documentElement.classList.remove('modal-open')
    },
    onTouchStart(e) {
      if (this.processing || this.persistent) return

      // Only allow drag from handle or header area
      const sheet = this.$refs.sheet
      if (!sheet) return

      const touch = e.touches[0]
      const target = e.target

      // Check if the touch is on a scrollable content area that has scrolled
      const contentEl = sheet.querySelector('.sheet-content')
      if (contentEl && contentEl.contains(target) && contentEl.scrollTop > 0) {
        return
      }

      this.isDragging = true
      this.dragStartY = touch.clientY
      this.dragCurrentY = touch.clientY
      this.dragStartTime = Date.now()
      this.sheetHeight = sheet.offsetHeight

      // Disable transition during drag for responsive feel
      sheet.style.transition = 'none'
    },
    onTouchMove(e) {
      if (!this.isDragging) return

      const touch = e.touches[0]
      this.dragCurrentY = touch.clientY
      const deltaY = this.dragCurrentY - this.dragStartY

      // Only allow dragging downward
      if (deltaY < 0) return

      const sheet = this.$refs.sheet
      if (sheet) {
        sheet.style.transform = `translateY(${deltaY}px)`
      }
    },
    onTouchEnd() {
      if (!this.isDragging) return
      this.isDragging = false

      const sheet = this.$refs.sheet
      if (!sheet) return

      const deltaY = this.dragCurrentY - this.dragStartY
      const elapsed = Date.now() - this.dragStartTime
      const velocity = deltaY / Math.max(elapsed, 1)
      const threshold = this.sheetHeight * 0.3

      // Restore transition
      sheet.style.transition = ''

      if (deltaY > threshold || (velocity > 0.5 && deltaY > 50)) {
        // Dismiss: slide to bottom
        this.$emit('input', false)
      } else {
        // Snap back
        sheet.style.transform = ''
      }
    },
    closeModalEvt() {
      this.$emit('input', false)
    }
  },
  mounted() {
    this.$eventBus.$on('close-modal', this.closeModalEvt)
    if (this.value) {
      this.onOpen()
    }
  },
  beforeDestroy() {
    this.$eventBus.$off('close-modal', this.closeModalEvt)
    if (this.value) {
      this.onClose()
    }
  }
}
</script>
