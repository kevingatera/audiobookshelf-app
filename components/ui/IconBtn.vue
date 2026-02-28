<template>
  <button class="icon-btn rounded-full flex items-center justify-center relative transition-colors duration-150" :disabled="disabled || loading" :class="className" :type="type" style="width: 40px; height: 40px; min-width: 40px; min-height: 40px" @mousedown.prevent @click="clickBtn">
    <div v-if="loading" class="text-fg absolute top-0 left-0 w-full h-full flex items-center justify-center text-opacity-100">
      <svg class="animate-spin" style="width: 24px; height: 24px" viewBox="0 0 24 24">
        <path fill="currentColor" d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z" />
      </svg>
    </div>
    <span v-else class="material-symbols text-2xl" :class="{ fill: !outlined }" :style="{ fontSize }">{{ icon }}</span>
  </button>
</template>

<script>
export default {
  props: {
    icon: String,
    type: {
      type: String,
      default: 'button'
    },
    disabled: Boolean,
    bgColor: {
      type: String,
      default: 'primary'
    },
    outlined: Boolean,
    borderless: Boolean,
    loading: Boolean
  },
  data() {
    return {}
  },
  computed: {
    className() {
      var classes = ['hover:bg-fg/10 active:bg-fg/15']
      if (!this.borderless) {
        classes.push(`bg-${this.bgColor} border border-warm`)
      }
      if (this.disabled) {
        classes.push('opacity-50 cursor-not-allowed')
      }
      return classes.join(' ')
    },
    fontSize() {
      if (this.icon === 'edit') return '1.25rem'
      return '1.4rem'
    }
  },
  methods: {
    clickBtn(e) {
      if (this.disabled || this.loading) {
        e.preventDefault()
        return
      }
      e.preventDefault()
      this.$emit('click')
      e.stopPropagation()
    }
  },
  mounted() {}
}
</script>

<style>
button.icon-btn:disabled {
  cursor: not-allowed;
}
button.icon-btn:disabled span {
  color: #777;
}
</style>
