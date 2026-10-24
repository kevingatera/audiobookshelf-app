<template>
  <modals-modal :value="value" sheet width="100%" max-width="100%" :processing="processing" @input="$emit('input', $event)">
    <div ref="sheet" role="dialog" aria-modal="true" tabindex="-1" class="relative flex flex-col w-full bg-primary rounded-t-sheet border-t border-fg/20 outline-none" :style="sheetStyle" @keydown="onSheetKeydown">
      <div class="flex justify-center pt-2 pb-3 touch-none cursor-grab shrink-0" @touchstart="onHandleStart" @touchmove="onHandleMove" @touchend="onHandleEnd" @touchcancel="onHandleCancel">
        <div class="w-10 h-1 rounded-full bg-fg/30" />
      </div>
      <button type="button" class="absolute top-1 right-2 h-10 w-10 flex items-center justify-center text-fg-muted" :aria-label="$strings.ButtonClose" @click="close">
        <span class="material-symbols text-2xl">close</span>
      </button>
      <div class="min-h-0 overflow-y-auto overscroll-contain">
        <slot />
      </div>
    </div>
  </modals-modal>
</template>

<script>
// Built on modals-modal (sheet mode) so open, close, v-model, Android Back and
// the scrim all go through Modal.vue. This component only adds the handle drag.
export default {
  props: {
    value: Boolean,
    processing: Boolean,
    maxHeight: {
      type: String,
      default: '85vh'
    }
  },
  data() {
    return {
      dragState: 'idle', // idle | dragging | settling
      dragOffset: 0,
      startY: 0,
      opener: null,
      dismissTimer: null,
      resetTimer: null
    }
  },
  computed: {
    sheetStyle() {
      return {
        maxHeight: this.maxHeight,
        paddingBottom: 'env(safe-area-inset-bottom)',
        transform: `translateY(${this.dragOffset}px)`,
        transition: this.dragState === 'settling' ? 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)' : 'none'
      }
    }
  },
  watch: {
    value(isOpen) {
      clearTimeout(this.dismissTimer)
      clearTimeout(this.resetTimer)
      if (isOpen) {
        this.resetDrag()
        this.opener = document.activeElement
        // Modal appends its wrapper to body in a watcher; focus after that runs.
        this.$nextTick(() => this.$refs.sheet?.focus())
      } else {
        this.opener?.focus?.()
        this.opener = null
        // Drag offset stays put while Modal slides the sheet out, then clears.
        this.resetTimer = setTimeout(() => {
          if (!this.value) this.resetDrag()
        }, 220)
      }
    }
  },
  beforeDestroy() {
    clearTimeout(this.dismissTimer)
    clearTimeout(this.resetTimer)
  },
  methods: {
    close() {
      this.$emit('input', false)
    },
    onSheetKeydown(e) {
      if (e.key === 'Escape') {
        if (this.processing) return
        e.stopPropagation()
        this.close()
        return
      }
      if (e.key !== 'Tab') return
      // Keep Tab and Shift+Tab inside the sheet while it is open.
      const focusable = this.$refs.sheet.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = document.activeElement
      if (e.shiftKey && (active === first || active === this.$refs.sheet)) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && active === last) {
        e.preventDefault()
        first.focus()
      }
    },
    resetDrag() {
      this.dragState = 'idle'
      this.dragOffset = 0
    },
    onHandleStart(e) {
      if (e.touches.length !== 1) return
      this.startY = e.touches[0].clientY
      this.dragOffset = 0
      this.dragState = 'dragging'
    },
    onHandleMove(e) {
      if (this.dragState !== 'dragging') return
      this.dragOffset = Math.max(0, e.touches[0].clientY - this.startY)
    },
    onHandleEnd() {
      if (this.dragState !== 'dragging') return
      const height = this.$refs.sheet.offsetHeight
      if (this.dragOffset > Math.min(120, height * 0.3)) {
        // Slide the rest of the way, then let Modal run its close transition.
        this.dragState = 'settling'
        this.dragOffset = height
        this.dismissTimer = setTimeout(() => this.close(), 200)
      } else {
        this.snapBack()
      }
    },
    onHandleCancel() {
      if (this.dragState === 'dragging') this.snapBack()
    },
    snapBack() {
      this.dragState = 'settling'
      this.dragOffset = 0
    }
  }
}
</script>
