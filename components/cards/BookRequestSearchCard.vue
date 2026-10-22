<template>
  <div class="flex h-full items-center px-1 overflow-hidden">
    <img :src="result.remoteCover || '/book_placeholder.jpg'" alt="" class="h-14 w-10 shrink-0 rounded object-cover" />
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
  computed: {
    statusText() {
      const key = STATUS_LABELS[this.state]
      return key ? this.$strings[key] : ''
    }
  }
}
</script>
