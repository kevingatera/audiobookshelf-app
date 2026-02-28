<template>
  <modals-bottom-sheet v-model="show" :title="$strings.LabelFilter || 'Filter'">
    <div class="w-full">
      <!-- Clear filter button -->
      <div v-if="selected !== 'all'" class="px-4 py-2 border-b border-warm">
        <button class="text-sm font-medium px-3 py-1.5 rounded-full border border-success/40 text-success" @click="clearSelected">{{ $strings.ButtonClearFilter }}</button>
      </div>

      <!-- Main filter list -->
      <ul v-show="!sublist" class="w-full" role="listbox" aria-labelledby="listbox-label">
        <template v-for="item in items">
          <li
            :key="item.value"
            class="text-fg select-none relative cursor-pointer border-b border-warm"
            :class="item.value === selected ? 'bg-bg/30' : ''"
            style="min-height: 48px"
            role="option"
            @click="clickedOption(item)"
          >
            <div class="flex items-center justify-between px-4 py-3.5">
              <span class="font-normal block truncate text-base">{{ item.text }}</span>
              <span v-if="item.sublist" class="material-symbols text-xl text-fg-muted">chevron_right</span>
              <span v-else-if="item.value === selected" class="material-symbols text-xl" style="color: #1ad691">check</span>
            </div>
          </li>
        </template>
      </ul>

      <!-- Sublist -->
      <ul v-show="sublist" class="w-full" role="listbox" aria-labelledby="listbox-label">
        <li class="text-fg select-none relative cursor-pointer border-b border-warm" style="min-height: 48px" role="option" @click="sublist = null">
          <div class="flex items-center px-4 py-3.5">
            <span class="material-symbols text-xl text-fg-muted mr-2">arrow_back</span>
            <span class="font-normal block truncate text-base">{{ $strings.ButtonBack }}</span>
          </div>
        </li>
        <li v-if="!sublistItems.length" class="text-fg-muted select-none relative px-4" role="option">
          <div class="flex items-center justify-center py-5">
            <span class="font-normal block truncate text-base">No {{ sublist }} items</span>
          </div>
        </li>
        <template v-for="item in sublistItems">
          <li
            :key="item.value"
            class="text-fg select-none relative cursor-pointer border-b border-warm"
            :class="`${sublist}.${item.value}` === selected ? 'bg-bg/30' : ''"
            style="min-height: 48px"
            role="option"
            @click="clickedSublistOption(item.value)"
          >
            <div class="flex items-center justify-between px-4 py-3">
              <span class="font-normal truncate text-base">{{ item.text }}</span>
              <span v-if="`${sublist}.${item.value}` === selected" class="material-symbols text-xl" style="color: #1ad691">check</span>
            </div>
          </li>
        </template>
      </ul>
    </div>
  </modals-bottom-sheet>
</template>

<script>
export default {
  props: {
    value: Boolean,
    filterBy: String
  },
  data() {
    return {
      sublist: null
    }
  },
  watch: {
    show(newVal) {
      if (!newVal) {
        if (this.sublist && !this.selectedItemSublist) this.sublist = null
        if (!this.sublist && this.selectedItemSublist) this.sublist = this.selectedItemSublist
      }
    }
  },
  computed: {
    show: {
      get() {
        return this.value
      },
      set(val) {
        this.$emit('input', val)
      }
    },
    selected: {
      get() {
        return this.filterBy
      },
      set(val) {
        this.$emit('update:filterBy', val)
      }
    },
    userCanAccessExplicitContent() {
      return this.$store.getters['user/getUserCanAccessExplicitContent']
    },
    bookItems() {
      const items = [
        {
          text: this.$strings.LabelAll,
          value: 'all'
        },
        {
          text: this.$strings.LabelGenre,
          value: 'genres',
          sublist: true
        },
        {
          text: this.$strings.LabelTag,
          value: 'tags',
          sublist: true
        },
        {
          text: this.$strings.LabelSeries,
          value: 'series',
          sublist: true
        },
        {
          text: this.$strings.LabelAuthor,
          value: 'authors',
          sublist: true
        },
        {
          text: this.$strings.LabelNarrator,
          value: 'narrators',
          sublist: true
        },
        {
          text: this.$strings.LabelLanguage,
          value: 'languages',
          sublist: true
        },
        {
          text: this.$strings.LabelProgress,
          value: 'progress',
          sublist: true
        },
        {
          text: this.$strings.LabelEbooks,
          value: 'ebooks',
          sublist: true
        },
        {
          text: this.$strings.ButtonIssues,
          value: 'issues',
          sublist: false
        },
        {
          text: this.$strings.LabelRSSFeedOpen,
          value: 'feed-open',
          sublist: false
        }
      ]

      if (this.userCanAccessExplicitContent) {
        items.push({
          text: this.$strings.LabelExplicit,
          value: 'explicit',
          sublist: false
        })
      }

      return items
    },
    podcastItems() {
      const items = [
        {
          text: this.$strings.LabelAll,
          value: 'all'
        },
        {
          text: this.$strings.LabelGenre,
          value: 'genres',
          sublist: true
        },
        {
          text: this.$strings.LabelTag,
          value: 'tags',
          sublist: true
        },
        {
          text: this.$strings.LabelRSSFeedOpen,
          value: 'feed-open',
          sublist: false
        }
      ]

      if (this.userCanAccessExplicitContent) {
        items.push({
          text: this.$strings.LabelExplicit,
          value: 'explicit',
          sublist: false
        })
      }

      return items
    },
    isPodcast() {
      return this.$store.getters['libraries/getCurrentLibraryMediaType'] === 'podcast'
    },
    items() {
      if (this.isPodcast) return this.podcastItems
      return this.bookItems
    },
    selectedItemSublist() {
      return this.selected && this.selected.includes('.') ? this.selected.split('.')[0] : false
    },
    genres() {
      return this.filterData.genres || []
    },
    tags() {
      return this.filterData.tags || []
    },
    series() {
      return this.filterData.series || []
    },
    authors() {
      return this.filterData.authors || []
    },
    narrators() {
      return this.filterData.narrators || []
    },
    languages() {
      return this.filterData.languages || []
    },
    progress() {
      return [
        {
          id: 'finished',
          name: this.$strings.LabelFinished
        },
        {
          id: 'in-progress',
          name: this.$strings.LabelInProgress
        },
        {
          id: 'not-started',
          name: this.$strings.LabelNotStarted
        },
        {
          id: 'not-finished',
          name: this.$strings.LabelNotFinished
        }
      ]
    },
    ebooks() {
      return [
        {
          id: 'ebook',
          name: this.$strings.LabelHasEbook
        },
        {
          id: 'supplementary',
          name: this.$strings.LabelHasSupplementaryEbook
        }
      ]
    },
    sublistItems() {
      const sublistItems = (this[this.sublist] || []).map((item) => {
        if (typeof item === 'string') {
          return {
            text: item,
            value: this.$encode(item)
          }
        } else {
          return {
            text: item.name,
            value: this.$encode(item.id)
          }
        }
      })
      if (this.sublist === 'series') {
        sublistItems.unshift({
          text: this.$strings.MessageNoSeries,
          value: this.$encode('no-series')
        })
      }
      return sublistItems
    },
    filterData() {
      return this.$store.state.libraries.filterData || {}
    }
  },
  methods: {
    async clearSelected() {
      await this.$hapticsImpact()
      this.selected = 'all'
      this.show = false
      this.$nextTick(() => this.$emit('change', 'all'))
    },
    clickedSublistOption(item) {
      this.clickedOption({ value: `${this.sublist}.${item}` })
    },
    async clickedOption(option) {
      if (option.sublist) {
        this.sublist = option.value
        return
      }

      var val = option.value
      if (this.selected === val) {
        this.show = false
        return
      }
      await this.$hapticsImpact()
      this.selected = val
      this.show = false
      this.$nextTick(() => this.$emit('change', val))
    }
  },
  mounted() {}
}
</script>
