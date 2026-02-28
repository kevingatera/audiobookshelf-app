<template>
  <div class="relative w-full" v-click-outside="clickedOutside">
    <p class="text-xs font-semibold uppercase tracking-wider mb-1" :class="disabled ? 'text-fg-muted' : 'text-fg-muted'">{{ label }}</p>
    <button type="button" :disabled="disabled" class="relative w-full rounded-lg pl-3 pr-8 py-2 text-left focus:outline-none text-sm transition-colors duration-150" :class="buttonClass" aria-haspopup="listbox" aria-expanded="true" @click.stop.prevent="clickShowMenu">
      <span class="flex items-center" :class="!selectedText ? 'text-fg-muted' : 'text-fg'">
        <span class="block truncate" :class="small ? 'text-sm' : ''">{{ selectedText || placeholder || '' }}</span>
      </span>
      <span class="ml-3 absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
        <span class="material-symbols text-fg-muted">arrow_drop_down</span>
      </span>
    </button>

    <transition name="menu">
      <ul v-show="showMenu" class="absolute z-10 mt-1 w-full bg-secondary rounded-xl border border-warm shadow-lg max-h-56 py-1 overflow-auto focus:outline-none text-sm" role="listbox">
        <template v-for="item in items">
          <li :key="item.value" class="text-fg select-none relative px-4 py-3 cursor-pointer transition-colors duration-150 hover:bg-bg-hover" role="option" @click="clickedOption(item.value)">
            <div class="flex items-center justify-between">
              <span class="font-normal block truncate text-sm">{{ item.text }}</span>
              <span v-if="selected === item.value" class="material-symbols text-accent text-lg">check</span>
            </div>
          </li>
        </template>
      </ul>
    </transition>
  </div>
</template>

<script>
export default {
  props: {
    value: [String, Number],
    label: {
      type: String,
      default: ''
    },
    items: {
      type: Array,
      default: () => []
    },
    disabled: Boolean,
    small: Boolean,
    placeholder: String
  },
  data() {
    return {
      showMenu: false
    }
  },
  computed: {
    selected: {
      get() {
        return this.value
      },
      set(val) {
        this.$emit('input', val)
      }
    },
    selectedItem() {
      return this.items.find((i) => i.value === this.selected)
    },
    selectedText() {
      return this.selectedItem ? this.selectedItem.text : ''
    },
    buttonClass() {
      const classes = []
      if (this.small) classes.push('h-9')
      else classes.push('h-10')

      if (this.disabled) classes.push('cursor-not-allowed bg-primary border border-warm opacity-60 text-fg-muted')
      else classes.push('cursor-pointer bg-primary border border-warm text-fg')

      return classes.join(' ')
    }
  },
  methods: {
    clickShowMenu() {
      if (this.disabled) return
      this.showMenu = !this.showMenu
    },
    clickedOutside() {
      this.showMenu = false
    },
    clickedOption(itemValue) {
      this.selected = itemValue
      this.showMenu = false
    }
  },
  mounted() {}
}
</script>
