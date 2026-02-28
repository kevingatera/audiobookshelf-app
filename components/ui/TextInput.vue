<template>
  <div class="relative">
    <input v-model="input" ref="input" :autofocus="autofocus" :type="type" :disabled="disabled" :readonly="readonly" autocorrect="off" autocapitalize="none" autocomplete="off" :placeholder="placeholder" class="h-10 w-full outline-none text-fg text-sm placeholder-fg-muted/50 transition-all duration-150 disabled:text-fg-muted" :class="inputClass" @keyup="keyup" />
    <div v-if="prependIcon" class="absolute top-0 left-0 h-full px-3 flex items-center justify-center">
      <span class="material-symbols text-lg text-fg-muted">{{ prependIcon }}</span>
    </div>
    <div v-if="clearable && input" class="absolute top-0 right-0 h-full px-3 flex items-center justify-center cursor-pointer" @click.stop="clear">
      <span class="material-symbols text-lg text-fg-muted">close</span>
    </div>
    <div v-else-if="!clearable && appendIcon" class="absolute top-0 right-0 h-full px-3 flex items-center justify-center">
      <span class="material-symbols text-lg text-fg-muted">{{ appendIcon }}</span>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    value: [String, Number],
    placeholder: String,
    type: String,
    disabled: Boolean,
    readonly: Boolean,
    borderless: Boolean,
    autofocus: {
      type: Boolean,
      default: true
    },
    bg: {
      type: String,
      default: 'primary'
    },
    rounded: {
      type: String,
      default: 'lg'
    },
    prependIcon: {
      type: String,
      default: null
    },
    appendIcon: {
      type: String,
      default: null
    },
    clearable: Boolean
  },
  data() {
    return {}
  },
  computed: {
    input: {
      get() {
        return this.value
      },
      set(val) {
        this.$emit('input', val)
      }
    },
    inputClass() {
      var classes = [`bg-${this.bg}`, `rounded-${this.rounded}`]
      if (this.disabled) classes.push('text-fg-muted')
      else classes.push('text-fg')

      if (this.prependIcon) classes.push('pl-10 pr-3')
      else classes.push('px-3')

      if (!this.borderless) classes.push('border border-warm focus:border-accent focus:ring-1 focus:ring-accent/50')
      return classes.join(' ')
    }
  },
  methods: {
    clear() {
      this.input = ''
    },
    focus() {
      if (this.$refs.input) {
        this.$refs.input.focus()
        this.$refs.input.click()
      }
    },
    keyup() {
      if (this.$refs.input) {
        this.input = this.$refs.input.value
      }
    }
  },
  mounted() {}
}
</script>

<style scoped>
input[type='time']::-webkit-calendar-picker-indicator {
  filter: invert(100%);
}
html[data-theme='light'] input[type='time']::-webkit-calendar-picker-indicator {
  filter: unset;
}
</style>
