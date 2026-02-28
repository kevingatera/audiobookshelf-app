<template>
  <label class="flex justify-start items-center" :class="!disabled ? 'cursor-pointer' : ''">
    <div class="rounded-md flex flex-shrink-0 justify-center items-center transition-all duration-150" :class="wrapperClass">
      <input v-model="selected" :disabled="disabled" type="checkbox" class="opacity-0 absolute" :class="!disabled ? 'cursor-pointer' : ''" />
      <svg v-if="selected" class="fill-current pointer-events-none text-white" :class="svgClass" viewBox="0 0 20 20"><path d="M0 11l2-2 5 5L18 3l2 2L7 18z" /></svg>
    </div>
    <div v-if="label" class="select-none text-fg" :class="labelClassname">{{ label }}</div>
  </label>
</template>

<script>
export default {
  props: {
    value: Boolean,
    label: String,
    small: Boolean,
    checkboxBg: {
      type: String,
      default: 'white'
    },
    borderColor: {
      type: String,
      default: 'gray-400'
    },
    checkColor: {
      type: String,
      default: 'green-500'
    },
    labelClass: {
      type: String,
      default: ''
    },
    disabled: Boolean
  },
  data() {
    return {}
  },
  computed: {
    selected: {
      get() {
        return this.value
      },
      set(val) {
        this.$emit('input', !!val)
      }
    },
    wrapperClass() {
      var classes = []
      if (this.selected) {
        classes.push('bg-accent border-2 border-accent')
      } else {
        classes.push('bg-transparent border-2 border-warm-emphasis')
      }
      // Fixed 20x20 size
      if (this.small) classes.push('w-4 h-4')
      else classes.push('w-5 h-5')

      return classes.join(' ')
    },
    labelClassname() {
      if (this.labelClass) return this.labelClass
      var classes = ['pl-2']
      if (this.small) classes.push('text-xs md:text-sm')
      return classes.join(' ')
    },
    svgClass() {
      var classes = []
      if (this.small) classes.push('w-2.5 h-2.5')
      else classes.push('w-3 h-3')

      return classes.join(' ')
    }
  },
  methods: {},
  mounted() {}
}
</script>
