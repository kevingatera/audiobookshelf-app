<template>
  <modals-bottom-sheet v-model="show" :title="$strings.LabelPlaybackSpeed">
    <div class="w-full">
      <!-- Speed presets as pill buttons -->
      <div class="flex flex-wrap gap-2 px-4 py-4 justify-center">
        <button
          v-for="rate in rates"
          :key="rate"
          class="px-4 py-2 rounded-full text-base font-medium transition-colors"
          :class="rate === selected ? 'bg-success/20 text-success border border-success/40' : 'bg-bg text-fg border border-warm'"
          @click="clickedOption(rate)"
        >
          {{ rate }}x
        </button>
      </div>

      <!-- Fine-tune controls -->
      <div class="flex items-center justify-center py-4 border-t border-warm">
        <button :disabled="!canDecrement" @click="decrement" class="icon-num-btn w-10 h-10 text-fg-muted rounded-full border border-warm flex items-center justify-center">
          <span class="material-symbols">remove</span>
        </button>
        <div class="w-28 text-center">
          <p class="text-2xl text-fg">{{ playbackRate }}<span class="text-lg text-fg-muted">⨯</span></p>
        </div>
        <button :disabled="!canIncrement" @click="increment" class="icon-num-btn w-10 h-10 text-fg-muted rounded-full border border-warm flex items-center justify-center">
          <span class="material-symbols">add</span>
        </button>
      </div>
    </div>
  </modals-bottom-sheet>
</template>

<script>
export default {
  props: {
    value: Boolean,
    playbackRate: Number
  },
  data() {
    return {
      currentPlaybackRate: 0,
      MIN_SPEED: 0.5,
      MAX_SPEED: 10
    }
  },
  watch: {
    show(newVal) {
      if (newVal) {
        this.currentPlaybackRate = this.selected
      } else {
        // On close, emit change if speed was modified via increment/decrement
        if (this.currentPlaybackRate !== this.selected) {
          this.$emit('change', this.selected)
        }
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
        return this.playbackRate
      },
      set(val) {
        this.$emit('update:playbackRate', val)
      }
    },
    rates() {
      return [0.5, 1, 1.2, 1.5, 1.7, 2, 3]
    },
    canIncrement() {
      return this.playbackRate + 0.1 <= this.MAX_SPEED
    },
    canDecrement() {
      return this.playbackRate - 0.1 >= this.MIN_SPEED
    }
  },
  methods: {
    increment() {
      if (this.selected + 0.1 > this.MAX_SPEED) return
      var newPlaybackRate = this.selected + 0.1
      this.selected = Number(newPlaybackRate.toFixed(1))
    },
    decrement() {
      if (this.selected - 0.1 < this.MIN_SPEED) return
      var newPlaybackRate = this.selected - 0.1
      this.selected = Number(newPlaybackRate.toFixed(1))
    },
    clickedOption(rate) {
      this.selected = Number(rate)
      this.show = false
      this.$emit('change', Number(rate))
    }
  },
  mounted() {}
}
</script>

<style>
button.icon-num-btn:disabled {
  cursor: not-allowed;
}
button.icon-num-btn:disabled::before {
  background-color: rgba(0, 0, 0, 0.2);
}
button.icon-num-btn:disabled span {
  color: #777;
}
</style>
