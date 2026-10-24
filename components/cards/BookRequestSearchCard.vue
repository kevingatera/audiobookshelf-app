<template>
  <div class="flex items-center px-1 overflow-hidden">
    <img :src="coverSrc" alt="" class="shrink-0 rounded object-cover" :style="{ width: coverWidth + 'px', height: coverHeight + 'px' }" @error="coverFailed = true" />
    <div class="grow min-w-0 px-2">
      <p class="truncate text-sm">{{ result.title }}</p>
      <p class="truncate text-xs text-gray-200">{{ $getString('LabelByAuthor', [result.author]) }}</p>
    </div>
    <p v-if="statusText" class="shrink-0 text-xs text-gray-300">{{ statusText }}</p>
    <ui-btn v-else small :loading="state === 'submitting'" :disabled="!!state" @click="$emit('request', result)">
      {{ $strings.ButtonRequestBook }}
    </ui-btn>
  </div>
</template>

<script>
const STATUS_LABELS = {
  submitted: 'LabelRequested',
  tracked: 'LabelAlreadyRequested',
  in_library: 'LabelAlreadyInLibrary'
}

export default {
  props: {
    result: {
      type: Object,
      required: true
    },
    state: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      coverFailed: false
    }
  },
  watch: {
    'result.remoteCover'() {
      this.coverFailed = false
    }
  },
  computed: {
    statusText() {
      const key = STATUS_LABELS[this.state]
      return key ? this.$strings[key] : ''
    },
    bookCoverAspectRatio() {
      return this.$store.getters['libraries/getBookCoverAspectRatio']
    },
    coverWidth() {
      return this.bookCoverAspectRatio === 1 ? 48 : 40
    },
    coverHeight() {
      return this.coverWidth * this.bookCoverAspectRatio
    },
    coverSrc() {
      return this.coverFailed || !this.result.remoteCover ? '/book_placeholder.jpg' : this.result.remoteCover
    }
  }
}
</script>
