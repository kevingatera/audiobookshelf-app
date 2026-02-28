<template>
  <div class="w-full">
    <p class="text-xs font-semibold uppercase tracking-wider mb-1" :class="disabled ? 'text-fg-muted/50' : 'text-fg-muted'">{{ label }}</p>
    <div ref="wrapper" class="relative">
      <form @submit.prevent="submitForm">
        <div ref="inputWrapper" style="min-height: 40px" class="flex-wrap relative w-full flex items-center border border-warm rounded-lg px-2 py-1 transition-all duration-150" :class="wrapperClass" @click.stop.prevent="clickWrapper" @mouseup.stop.prevent @mousedown.prevent>
          <div v-for="item in selected" :key="item" class="rounded-full px-3 py-1 mx-0.5 my-0.5 text-xs font-medium flex flex-nowrap break-all items-center relative" style="background: rgba(26, 214, 145, 0.15); color: #1ad691">
            <div v-if="!disabled" class="w-full h-full rounded-full absolute top-0 left-0 px-1 flex items-center justify-end opacity-0 hover:opacity-100" style="background: rgba(26, 214, 145, 0.25)">
              <span v-if="showEdit" class="material-symbols hover:text-warning cursor-pointer" style="font-size: 1.1rem; color: #1ad691" @click.stop="editItem(item)">edit</span>
              <span class="material-symbols hover:text-error cursor-pointer" style="font-size: 1.1rem; color: #1ad691" @click.stop="removeItem(item)">close</span>
            </div>
            {{ item }}
          </div>
          <input v-show="!readonly" ref="input" v-model="textInput" :disabled="disabled" style="min-width: 40px; width: 40px" class="h-full bg-primary focus:outline-none px-1 text-fg text-sm" @keydown="keydownInput" @focus="inputFocus" @blur="inputBlur" />
        </div>
      </form>

      <ul ref="menu" v-show="showMenu" class="absolute z-50 mt-1 w-full bg-secondary border border-warm rounded-xl shadow-lg max-h-56 py-1 overflow-auto focus:outline-none text-sm" role="listbox" aria-labelledby="listbox-label">
        <template v-for="item in itemsToShow">
          <li :key="item" class="text-fg select-none relative py-3 px-4 pr-9 cursor-pointer transition-colors duration-150 hover:bg-bg-hover" role="option" @click="clickedOption($event, item)" @mouseup.stop.prevent @mousedown.prevent>
            <div class="flex items-center">
              <span class="font-normal block truncate text-sm">{{ item }}</span>
            </div>
            <span v-if="selected.includes(item)" class="absolute inset-y-0 right-0 flex items-center pr-4" style="color: #1ad691">
              <span class="material-symbols text-xl">check</span>
            </span>
          </li>
        </template>
        <li v-if="!itemsToShow.length" class="text-fg-muted select-none relative py-3 px-4" role="option">
          <div class="flex items-center justify-center">
            <span class="font-normal text-sm">No Items</span>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: Array,
      default: () => []
    },
    items: {
      type: Array,
      default: () => []
    },
    label: String,
    disabled: Boolean,
    readonly: Boolean,
    showEdit: Boolean
  },
  data() {
    return {
      textInput: null,
      currentSearch: null,
      typingTimeout: null,
      isFocused: false,
      menu: null
    }
  },
  watch: {
    showMenu(newVal) {
      if (newVal) this.setListener()
      else this.removeListener()
    }
  },
  computed: {
    selected: {
      get() {
        return this.value || []
      },
      set(val) {
        this.$emit('input', val)
      }
    },
    showMenu() {
      return this.isFocused
    },
    wrapperClass() {
      var classes = []
      if (this.disabled) classes.push('bg-primary opacity-60 cursor-not-allowed')
      else classes.push('bg-primary')
      if (this.isFocused) classes.push('border-accent ring-1 ring-accent/50')
      if (!this.readonly) classes.push('cursor-text')
      return classes.join(' ')
    },
    itemsToShow() {
      if (!this.currentSearch || !this.textInput) {
        return this.items
      }

      return this.items.filter((i) => {
        var iValue = String(i).toLowerCase()
        return iValue.includes(this.currentSearch.toLowerCase())
      })
    }
  },
  methods: {
    editItem(item) {
      this.$emit('edit', item)
    },
    keydownInput() {
      clearTimeout(this.typingTimeout)
      this.typingTimeout = setTimeout(() => {
        this.currentSearch = this.textInput
      }, 100)
      this.setInputWidth()
    },
    setInputWidth() {
      setTimeout(() => {
        var value = this.$refs.input.value
        var len = value.length * 7 + 24
        this.$refs.input.style.width = len + 'px'
        this.recalcMenuPos()
      }, 50)
    },
    recalcMenuPos() {
      if (!this.menu) return
      var boundingBox = this.$refs.inputWrapper.getBoundingClientRect()
      if (boundingBox.y > window.innerHeight - 8) {
        // Input is off the page
        return this.forceBlur()
      }
      var menuHeight = this.menu.clientHeight
      var top = boundingBox.y + boundingBox.height - 4
      if (top + menuHeight > window.innerHeight - 20) {
        // Reverse menu to open upwards
        top = boundingBox.y - menuHeight - 4
      }

      this.menu.style.top = top + 'px'
      this.menu.style.left = boundingBox.x + 'px'
      this.menu.style.width = boundingBox.width + 'px'
    },
    unmountMountMenu() {
      if (!this.$refs.menu) return
      this.menu = this.$refs.menu

      var boundingBox = this.$refs.inputWrapper.getBoundingClientRect()
      this.menu.remove()
      document.body.appendChild(this.menu)
      this.menu.style.top = boundingBox.y + boundingBox.height - 4 + 'px'
      this.menu.style.left = boundingBox.x + 'px'
      this.menu.style.width = boundingBox.width + 'px'
    },
    inputFocus() {
      if (!this.menu) {
        this.unmountMountMenu()
      }
      this.isFocused = true
      this.$nextTick(this.recalcMenuPos)
    },
    inputBlur() {
      if (!this.isFocused) return

      setTimeout(() => {
        if (document.activeElement === this.$refs.input) {
          return
        }
        this.isFocused = false
        if (this.textInput) this.submitForm()
      }, 50)
    },
    focus() {
      if (this.$refs.input) this.$refs.input.focus()
    },
    blur() {
      if (this.$refs.input) this.$refs.input.blur()
    },
    forceBlur() {
      this.isFocused = false
      if (this.textInput) this.submitForm()
      if (this.$refs.input) this.$refs.input.blur()
    },
    clickedOption(e, itemValue) {
      if (e) {
        e.stopPropagation()
        e.preventDefault()
      }
      if (this.$refs.input) this.$refs.input.focus()

      var newSelected = null
      if (this.selected.includes(itemValue)) {
        newSelected = this.selected.filter((s) => s !== itemValue)
        this.$emit('removedItem', itemValue)
      } else {
        newSelected = this.selected.concat([itemValue])
      }
      this.textInput = null
      this.currentSearch = null
      this.$emit('input', newSelected)
      this.$nextTick(() => {
        this.recalcMenuPos()
      })
    },
    clickWrapper() {
      if (this.disabled) return
      if (this.showMenu) {
        return this.blur()
      }
      this.focus()
    },
    removeItem(item) {
      var remaining = this.selected.filter((i) => i !== item)
      this.$emit('input', remaining)
      this.$emit('removedItem', item)
      this.$nextTick(() => {
        this.recalcMenuPos()
      })
    },
    insertNewItem(item) {
      this.selected.push(item)
      this.$emit('input', this.selected)
      this.$emit('newItem', item)
      this.textInput = null
      this.currentSearch = null
      this.$nextTick(() => {
        this.blur()
      })
    },
    submitForm() {
      if (!this.textInput) return

      var cleaned = this.textInput.trim()
      var matchesItem = this.items.find((i) => {
        return i === cleaned
      })
      if (matchesItem) {
        this.clickedOption(null, matchesItem)
      } else {
        this.insertNewItem(this.textInput)
      }
    },
    scroll() {
      this.recalcMenuPos()
    },
    setListener() {
      document.addEventListener('scroll', this.scroll, true)
    },
    removeListener() {
      document.removeEventListener('scroll', this.scroll, true)
    }
  },
  mounted() {},
  beforeDestroy() {
    if (this.menu) this.menu.remove()
  }
}
</script>

<style scoped>
input {
  border-style: inherit !important;
}
input:read-only {
  color: rgb(var(--color-fg-muted));
  background-color: rgb(var(--color-primary));
}
</style>
