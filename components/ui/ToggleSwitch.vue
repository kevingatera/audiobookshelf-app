<template>
  <div>
    <button type="button" role="switch" :aria-checked="toggleValue ? 'true' : 'false'" :disabled="disabled" :aria-label="label" class="flex items-center justify-start min-w-[44px] min-h-[44px]" :class="disabled ? 'cursor-not-allowed' : 'cursor-pointer'" @click.stop="clickToggle">
      <span class="border rounded-full border-gray-400 flex items-center w-10 justify-start" :class="className">
        <span class="rounded-full border w-5 h-5 border-gray-100 shadow transform transition-transform duration-100" :class="switchClassName"></span>
      </span>
    </button>
  </div>
</template>

<script>
export default {
  props: {
    value: Boolean,
    label: String,
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
    className() {
      if (this.disabled) return this.toggleValue ? `bg-${this.onColor} cursor-not-allowed` : `bg-${this.offColor} cursor-not-allowed`
      return this.toggleValue ? `bg-${this.onColor}` : `bg-${this.offColor}`
    },
    switchClassName() {
      var bgColor = this.disabled ? 'bg-gray-300' : 'bg-white'
      return this.toggleValue ? 'translate-x-5 ' + bgColor : bgColor
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
