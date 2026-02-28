<template>
  <div class="w-full">
    <p class="text-xs font-semibold text-fg-muted uppercase tracking-wider mb-1">{{ label }}</p>
    <ui-text-input v-model="inputValue" ref="input" :disabled="disabled" :type="type" :placeholder="placeholder" :autofocus="autofocus" text-size="base" class="w-full" />
  </div>
</template>

<script>
export default {
  props: {
    value: [String, Number],
    label: String,
    type: {
      type: String,
      default: 'text'
    },
    disabled: Boolean,
    placeholder: String,
    autofocus: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {}
  },
  computed: {
    inputValue: {
      get() {
        return this.value
      },
      set(val) {
        this.$emit('input', val)
      }
    }
  },
  methods: {},
  mounted() {}
}
</script>
