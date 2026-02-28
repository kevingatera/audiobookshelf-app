<template>
  <div class="relative" v-click-outside="clickOutside">
    <button type="button" class="relative w-full bg-primary border border-warm rounded-lg shadow-sm pl-3 pr-10 py-2 text-left focus:outline-none text-sm cursor-pointer transition-colors duration-150" aria-haspopup="listbox" aria-expanded="true" @click.stop.prevent="showMenu = !showMenu">
      <span class="flex items-center">
        <span class="block truncate text-fg">{{ label }}</span>
      </span>
      <span class="ml-3 absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
        <span class="material-symbols text-fg-muted">person</span>
      </span>
    </button>

    <transition name="menu">
      <ul v-show="showMenu" class="absolute z-10 mt-1 w-full bg-secondary border border-warm rounded-xl shadow-lg max-h-56 py-1 overflow-auto focus:outline-none text-sm" tabindex="-1" role="listbox">
        <template v-for="(item, idx) in items">
          <nuxt-link :key="'link-' + item.value" v-if="item.to" :to="item.to">
            <li class="text-fg select-none relative px-4 py-3 cursor-pointer transition-colors duration-150 hover:bg-bg-hover" role="option" @click="clickedOption(item.value)">
              <div class="flex items-center">
                <span class="font-normal block truncate text-sm">{{ item.text }}</span>
              </div>
            </li>
          </nuxt-link>
          <li v-else :key="'item-' + item.value" class="text-fg select-none relative px-4 py-3 cursor-pointer transition-colors duration-150 hover:bg-bg-hover" role="option" @click="clickedOption(item.value)">
            <div class="flex items-center">
              <span class="font-normal block truncate text-sm">{{ item.text }}</span>
            </div>
          </li>
          <div v-if="item.divider && idx < items.length - 1" :key="'div-' + item.value" class="border-b border-warm mx-2" />
        </template>
      </ul>
    </transition>
  </div>
</template>

<script>
export default {
  props: {
    label: {
      type: String,
      default: 'Menu'
    },
    items: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      showMenu: false
    }
  },
  methods: {
    clickOutside() {
      this.showMenu = false
    },
    clickedOption(itemValue) {
      this.$emit('action', itemValue)
      this.showMenu = false
    }
  },
  mounted() {}
}
</script>
