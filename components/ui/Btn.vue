<template>
  <nuxt-link v-if="to" :to="to" class="btn outline-none rounded-lg relative border text-center transition-colors duration-150" :disabled="disabled || loading" :class="classList">
    <slot />
    <div v-if="loading" class="absolute top-0 left-0 w-full h-full flex items-center justify-center" style="color: #1ad691">
      <svg class="animate-spin" style="width: 24px; height: 24px" viewBox="0 0 24 24">
        <path fill="currentColor" d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z" />
      </svg>
    </div>
  </nuxt-link>
  <button v-else class="btn outline-none rounded-lg relative border transition-colors duration-150" :disabled="disabled || loading" :type="type" :class="classList" @mousedown.prevent @click="click">
    <slot />
    <div v-if="loading" class="absolute top-0 left-0 w-full h-full flex items-center justify-center" style="color: #1ad691">
      <svg class="animate-spin" style="width: 24px; height: 24px" viewBox="0 0 24 24">
        <path fill="currentColor" d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z" />
      </svg>
    </div>
  </button>
</template>

<script>
export default {
  props: {
    to: String,
    color: {
      type: String,
      default: ''
    },
    variant: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: ''
    },
    paddingX: Number,
    paddingY: Number,
    small: Boolean,
    loading: Boolean,
    disabled: Boolean
  },
  data() {
    return {}
  },
  computed: {
    resolvedVariant() {
      if (this.variant) return this.variant
      // Map legacy color prop to variant
      if (this.color === 'success') return 'accent'
      if (this.color === 'error' || this.color === 'danger') return 'danger'
      if (this.color === 'primary' || this.color === '') return 'default'
      // Fallback: keep legacy bg-{color} behavior
      return 'legacy'
    },
    classList() {
      var list = []
      if (this.loading) list.push('text-opacity-0')

      // Variant-based styling
      switch (this.resolvedVariant) {
        case 'accent':
          list.push('bg-accent text-primary font-semibold border-accent')
          break
        case 'ghost':
          list.push('bg-transparent border-transparent text-fg hover:bg-fg/10')
          break
        case 'danger':
          list.push('bg-error/10 text-error border-error/20')
          break
        case 'legacy':
          // Legacy: use color prop directly
          if (this.color === 'success') {
            list.push('text-white')
          }
          list.push(`bg-${this.color} border-border`)
          break
        default:
          // 'default' variant
          list.push('bg-bg border-warm text-fg')
          break
      }

      if (this.small) {
        list.push('text-sm')
        if (this.paddingX === undefined) list.push('px-4')
        if (this.paddingY === undefined) list.push('py-1')
      } else {
        if (this.paddingX === undefined) list.push('px-8')
        if (this.paddingY === undefined) list.push('py-2')
      }
      if (this.paddingX !== undefined) {
        list.push(`px-${this.paddingX}`)
      }
      if (this.paddingY !== undefined) {
        list.push(`py-${this.paddingY}`)
      }
      if (this.disabled) {
        list.push('cursor-not-allowed opacity-50')
      }
      return list
    }
  },
  methods: {
    click(e) {
      this.$emit('click', e)
    }
  },
  mounted() {}
}
</script>

<style>
.btn::before {
  content: '';
  position: absolute;
  border-radius: 8px;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0);
  transition: background-color 150ms ease;
}
.btn:hover:not(:disabled)::before {
  background-color: rgba(255, 255, 255, 0.06);
}
button:disabled::before {
  background-color: rgba(0, 0, 0, 0.2);
}
</style>
