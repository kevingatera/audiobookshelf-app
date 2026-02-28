<template>
  <div>
    <button type="button" role="switch" :aria-checked="toggleValue" class="relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none active:scale-95" :class="trackClass" :disabled="disabled" @click.stop="clickToggle" style="transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1)">
      <span class="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200" :class="thumbClass" style="transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1)"></span>
    </button>
  </div>
</template>

<script>
export default {
  props: {
    value: Boolean,
    onColor: {
      type: String,
      default: 'success'
    },
    offColor: {
      type: String,
      default: 'primary'
    },
    disabled: Boolean
  },
  computed: {
    toggleValue: {
      get() {
        return this.value
      },
      set(val) {
        this.$emit('input', val)
      }
    },
    trackClass() {
      var classes = []
      if (this.disabled) {
        classes.push('cursor-not-allowed opacity-50')
      } else {
        classes.push('cursor-pointer')
      }
      if (this.toggleValue) {
        classes.push('bg-accent')
      } else {
        classes.push('bg-bg')
      }
      return classes.join(' ')
    },
    thumbClass() {
      var classes = []
      if (this.toggleValue) {
        classes.push('translate-x-5')
      } else {
        classes.push('translate-x-0')
      }
      if (this.disabled) {
        classes.push('bg-bg-hover')
      }
      return classes.join(' ')
    }
  },
  methods: {
    clickToggle() {
      if (this.disabled) return
      this.toggleValue = !this.toggleValue
    }
  }
}
</script>
