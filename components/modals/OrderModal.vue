<template>
  <modals-bottom-sheet v-model="show" :title="$strings.LabelSortBy || 'Sort By'">
    <div class="w-full">
      <ul class="w-full" role="listbox" aria-labelledby="listbox-label">
        <template v-for="item in items">
          <li
            :key="item.value"
            class="text-fg select-none relative cursor-pointer border-b border-warm"
            :class="item.value === selected ? 'bg-bg/30' : ''"
            style="min-height: 48px"
            role="option"
            @click="clickedOption(item.value)"
          >
            <div class="flex items-center justify-between px-4 py-3.5">
              <span class="font-normal block truncate text-base">{{ item.text }}</span>
              <span v-if="item.value === selected" class="material-symbols text-xl" style="color: #1ad691">{{ descending ? 'south' : 'north' }}</span>
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
    orderBy: String,
    descending: Boolean,
    episodes: Boolean
  },
  data() {
    return {
      bookItems: [
        {
          text: this.$strings.LabelTitle,
          value: 'media.metadata.title'
        },
        {
          text: this.$strings.LabelAuthorFirstLast,
          value: 'media.metadata.authorName'
        },
        {
          text: this.$strings.LabelAuthorLastFirst,
          value: 'media.metadata.authorNameLF'
        },
        {
          text: this.$strings.LabelPublishYear,
          value: 'media.metadata.publishedYear'
        },
        {
          text: this.$strings.LabelAddedAt,
          value: 'addedAt'
        },
        {
          text: this.$strings.LabelSize,
          value: 'size'
        },
        {
          text: this.$strings.LabelDuration,
          value: 'media.duration'
        },
        {
          text: this.$strings.LabelFileBirthtime,
          value: 'birthtimeMs'
        },
        {
          text: this.$strings.LabelFileModified,
          value: 'mtimeMs'
        },
        {
          text: this.$strings.LabelLibrarySortByProgress,
          value: 'progress'
        },
        {
          text: this.$strings.LabelLibrarySortByProgressStarted,
          value: 'progress.createdAt'
        },
        {
          text: this.$strings.LabelLibrarySortByProgressFinished,
          value: 'progress.finishedAt'
        },
        {
          text: this.$strings.LabelRandomly,
          value: 'random'
        }
      ],
      podcastItems: [
        {
          text: this.$strings.LabelTitle,
          value: 'media.metadata.title'
        },
        {
          text: this.$strings.LabelAuthor,
          value: 'media.metadata.author'
        },
        {
          text: this.$strings.LabelAddedAt,
          value: 'addedAt'
        },
        {
          text: this.$strings.LabelSize,
          value: 'size'
        },
        {
          text: this.$strings.LabelNumberOfEpisodes,
          value: 'media.numTracks'
        },
        {
          text: this.$strings.LabelFileBirthtime,
          value: 'birthtimeMs'
        },
        {
          text: this.$strings.LabelFileModified,
          value: 'mtimeMs'
        },
        {
          text: this.$strings.LabelRandomly,
          value: 'random'
        }
      ],
      episodeItems: [
        {
          text: this.$strings.LabelPubDate,
          value: 'publishedAt'
        },
        {
          text: this.$strings.LabelTitle,
          value: 'title'
        },
        {
          text: this.$strings.LabelSeason,
          value: 'season'
        },
        {
          text: this.$strings.LabelEpisode,
          value: 'episode'
        },
        {
          text: this.$strings.LabelFilename,
          value: 'audioFile.metadata.filename'
        }
      ]
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
        return this.orderBy
      },
      set(val) {
        this.$emit('update:orderBy', val)
      }
    },
    selectedDesc: {
      get() {
        return this.descending
      },
      set(val) {
        this.$emit('update:descending', val)
      }
    },
    isPodcast() {
      return this.$store.getters['libraries/getCurrentLibraryMediaType'] === 'podcast'
    },
    items() {
      if (this.episodes) return this.episodeItems
      if (this.isPodcast) return this.podcastItems
      return this.bookItems
    }
  },
  methods: {
    async clickedOption(val) {
      await this.$hapticsImpact()
      if (this.selected === val) {
        this.selectedDesc = !this.selectedDesc
      } else {
        if (val === 'recent' || val === 'addedAt') this.selectedDesc = true // Progress defaults to descending
        this.selected = val
      }
      this.show = false
      this.$nextTick(() => this.$emit('change', val))
    }
  },
  mounted() {}
}
</script>
