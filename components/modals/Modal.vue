<template>
  <div ref="wrapper" class="modal modal-bg w-full h-full max-h-screen fixed top-0 left-0 bg-primary bg-opacity-75 flex justify-center z-50 opacity-0" :class="sheet ? 'items-end' : 'items-center'">
    <template v-if="!sheet">
      <div class="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-black to-transparent opacity-90 pointer-events-none" />

      <div class="absolute z-40 top-11 right-4 h-10 w-10 flex items-center justify-center cursor-pointer text-white hover:text-gray-300" @click="show = false">
        <span class="material-symbols text-4xl">close</span>
      </div>
    </template>
    <slot name="outer" />
    <div ref="content" class="relative text-fg max-h-screen" :class="sheet ? 'w-full' : ''" :style="contentStyle" v-click-outside="clickBg">
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    value: Boolean,
    processing: Boolean,
    persistent: {
      type: Boolean,
      default: true
    },
    width: {
      type: [String, Number],
      default: 500
    },
    height: {
      type: [String, Number],
      default: 'unset'
    },
    maxWidth: {
      type: String,
      default: '90%'
    },
    // Bottom-anchored, slides up. Used by modals/BottomSheet.vue.
    sheet: Boolean
  },
  data() {
    return {
      el: null,
      content: null,
      removeTimer: null
    }
  },
  watch: {
    show(newVal) {
      if (newVal) {
        this.setShow()
      } else {
        this.setHide()
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
    modalHeight() {
      if (typeof this.height === 'string') {
        return this.height
      } else {
        return this.height + 'px'
      }
    },
    modalWidth() {
      return typeof this.width === 'string' ? this.width : this.width + 'px'
    },
    contentStyle() {
      return {
        minHeight: this.sheet ? '0' : '200px',
        height: this.modalHeight,
        width: this.modalWidth,
        maxWidth: this.maxWidth
      }
    }
  },
  methods: {
    clickBg(ev) {
      if (this.processing && this.persistent) return
      if (ev && ev.srcElement && ev.srcElement.classList && ev.srcElement.classList.contains('modal-bg')) {
        this.show = false
      }
    },
    setShow() {
      this.$store.commit('globals/setIsModalOpen', true)

      if (this.removeTimer) {
        clearTimeout(this.removeTimer)
        this.removeTimer = null
      }
      document.body.appendChild(this.el)
      setTimeout(() => {
        this.content.style.transform = this.sheet ? 'translateY(0)' : 'scale(1)'
      }, 10)
      document.documentElement.classList.add('modal-open')
    },
    setHide() {
      this.$store.commit('globals/setIsModalOpen', false)

      this.content.style.transform = this.sheet ? 'translateY(100%)' : 'scale(0)'
      if (this.sheet) {
        // Keep the wrapper mounted until the slide-out transition finishes.
        this.removeTimer = setTimeout(() => {
          this.removeTimer = null
          this.el.remove()
        }, 200)
      } else {
        this.el.remove()
      }
      document.documentElement.classList.remove('modal-open')
    },
    closeModalEvt() {
      console.log('Close modal event')
      this.show = false
    }
  },
  mounted() {
    this.$eventBus.$on('close-modal', this.closeModalEvt)
    this.el = this.$refs.wrapper
    this.content = this.$refs.content
    this.content.style.transform = this.sheet ? 'translateY(100%)' : 'scale(0)'
    this.content.style.transition = `transform ${this.sheet ? '0.2s' : '0.25s'} cubic-bezier(0.16, 1, 0.3, 1)`
    this.el.style.opacity = 1
    this.el.remove()
  },
  beforeDestroy() {
    this.$eventBus.$off('close-modal', this.closeModalEvt)
    if (this.removeTimer) {
      clearTimeout(this.removeTimer)
      this.removeTimer = null
      this.el.remove()
    }
  }
}
</script>
