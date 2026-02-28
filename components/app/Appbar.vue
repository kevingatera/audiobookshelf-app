<template>
  <div class="w-full h-12 bg-primary border-b border-warm relative z-appbar">
    <div id="appbar" class="absolute top-0 left-0 w-full h-full flex items-center px-2">
      <!-- Left: back arrow (sub-pages) or logo (home) -->
      <a v-if="showBack" @click="back" aria-label="Go back" class="rounded-full h-9 w-9 flex items-center justify-center mr-1 cursor-pointer">
        <span class="material-symbols text-2xl text-fg">arrow_back</span>
      </a>
      <nuxt-link v-else to="/" class="mr-2">
        <img src="/Logo.png" class="h-8 w-8" alt="Audiobookshelf" />
      </nuxt-link>

      <!-- Center: library name / picker -->
      <div v-if="user && currentLibrary" class="flex-grow flex justify-center">
        <button type="button" aria-label="Select library" class="pl-1.5 pr-2.5 py-1.5 bg-bg bg-opacity-30 rounded-btn flex items-center" @click="clickShowLibraryModal">
          <ui-library-icon :icon="currentLibraryIcon" :size="4" font-size="base" />
          <p class="text-sm leading-4 ml-1.5 max-w-24 truncate">{{ currentLibraryName }}</p>
        </button>
      </div>
      <div v-else class="flex-grow" />

      <!-- Right: utility icons -->
      <widgets-connection-indicator />

      <widgets-download-progress-indicator />

      <!-- Must be connected to a server to cast, only supports media items on server -->
      <button type="button" aria-label="Cast" v-show="isCastAvailable && user" class="mx-1.5 cursor-pointer flex items-center" @click="castClick">
        <span class="material-symbols text-xl leading-none">
          {{ isCasting ? 'cast_connected' : 'cast' }}
        </span>
      </button>
    </div>
  </div>
</template>

<script>
import { AbsAudioPlayer } from '@/plugins/capacitor'

export default {
  data() {
    return {
      onCastAvailableUpdateListener: null
    }
  },
  computed: {
    isCastAvailable: {
      get() {
        return this.$store.state.isCastAvailable
      },
      set(val) {
        this.$store.commit('setCastAvailable', val)
      }
    },
    currentLibrary() {
      return this.$store.getters['libraries/getCurrentLibrary']
    },
    currentLibraryName() {
      return this.currentLibrary?.name || ''
    },
    currentLibraryIcon() {
      return this.currentLibrary?.icon || 'database'
    },
    showBack() {
      if (!this.$route.name) return true
      return this.$route.name !== 'index' && !this.$route.name.startsWith('bookshelf')
    },
    user() {
      return this.$store.state.user.user
    },
    username() {
      return this.user?.username || 'err'
    },
    isCasting() {
      return this.$store.state.isCasting
    }
  },
  methods: {
    castClick() {
      if (this.$store.getters['getIsCurrentSessionLocal']) {
        this.$eventBus.$emit('cast-local-item')
        return
      }
      AbsAudioPlayer.requestSession()
    },
    clickShowSideDrawer() {
      this.$store.commit('setShowSideDrawer', true)
    },
    clickShowLibraryModal() {
      this.$store.commit('libraries/setShowModal', true)
    },
    back() {
      window.history.back()
    },
    onCastAvailableUpdate(data) {
      this.isCastAvailable = data && data.value
    }
  },
  async mounted() {
    AbsAudioPlayer.getIsCastAvailable().then((data) => {
      this.isCastAvailable = data && data.value
    })
    this.onCastAvailableUpdateListener = await AbsAudioPlayer.addListener('onCastAvailableUpdate', this.onCastAvailableUpdate)
  },
  beforeDestroy() {
    this.onCastAvailableUpdateListener?.remove()
  }
}
</script>

<style>
#appbar {
  /* Shadow removed in favor of border-b border-warm on parent */
}
.loader-dots div {
  animation-timing-function: cubic-bezier(0, 1, 1, 0);
}
.loader-dots div:nth-child(1) {
  left: 0px;
  animation: loader-dots1 0.6s infinite;
}
.loader-dots div:nth-child(2) {
  left: 0px;
  animation: loader-dots2 0.6s infinite;
}
.loader-dots div:nth-child(3) {
  left: 10px;
  animation: loader-dots2 0.6s infinite;
}
.loader-dots div:nth-child(4) {
  left: 20px;
  animation: loader-dots3 0.6s infinite;
}
@keyframes loader-dots1 {
  0% {
    transform: scale(0);
  }
  100% {
    transform: scale(1);
  }
}
@keyframes loader-dots3 {
  0% {
    transform: scale(1);
  }
  100% {
    transform: scale(0);
  }
}
@keyframes loader-dots2 {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(10px, 0);
  }
}
</style>
