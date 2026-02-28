<template>
  <div class="w-full h-full overflow-y-auto" style="-webkit-overflow-scrolling: touch">
    <!-- User avatar + info header -->
    <div class="pt-8 pb-2">
      <div class="bg-secondary rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
        <span class="material-symbols text-3xl text-fg-muted">person</span>
      </div>
      <p class="text-xl font-semibold text-fg text-center">{{ username }}</p>
      <p class="text-sm text-fg-muted text-center mb-6">{{ serverAddress }}</p>
    </div>

    <!-- Server info -->
    <p class="text-xs font-semibold text-fg-muted uppercase tracking-wider px-4 pt-2 pb-2">Server</p>
    <div class="bg-secondary rounded-xl mx-4 mb-4 overflow-hidden">
      <div class="px-4 py-3 flex items-center justify-between border-b border-warm">
        <p class="text-sm text-fg">{{ $strings.LabelHost }}</p>
        <p class="text-sm text-fg-muted truncate ml-4 max-w-[60%] text-right">{{ serverAddress }}</p>
      </div>
      <div v-if="serverVersion" class="px-4 py-3 flex items-center justify-between last:border-0">
        <p class="text-sm text-fg">Server version</p>
        <p class="text-sm text-fg-muted">v{{ serverVersion }}</p>
      </div>
    </div>

    <!-- Account actions -->
    <div class="mx-4 mt-6">
      <ui-btn color="primary" class="w-full flex items-center justify-center gap-2 text-base" @click="logout">
        <span class="material-symbols" style="font-size: 1.1rem">logout</span>
        {{ $strings.ButtonSwitchServerUser }}
      </ui-btn>
    </div>

    <!-- Footer -->
    <div class="flex justify-center items-center px-4 pt-8 pb-4">
      <p class="text-sm text-fg-muted">{{ $strings.MessageReportBugsAndContribute }}
        <a class="underline text-accent" href="https://github.com/advplyr/audiobookshelf-app" target="_blank">GitHub</a>
      </p>
      <a href="https://github.com/advplyr/audiobookshelf-app" target="_blank" class="text-fg-muted ml-2">
        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" width="24" height="24" viewBox="0 0 24 24">
          <path
            d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
          />
        </svg>
      </a>
    </div>
  </div>
</template>

<script>
export default {
  asyncData({ redirect, store }) {
    if (!store.state.socketConnected) {
      return redirect('/connect')
    }
    return {}
  },
  data() {
    return {}
  },
  computed: {
    username() {
      if (!this.user) return ''
      return this.user.username
    },
    user() {
      return this.$store.state.user.user
    },
    serverConnectionConfig() {
      return this.$store.state.user.serverConnectionConfig || {}
    },
    serverAddress() {
      return this.serverConnectionConfig.address
    },
    serverVersion() {
      // Saved in server connection config after 0.9.81
      return this.serverConnectionConfig.version
    }
  },
  methods: {
    async logout() {
      await this.$hapticsImpact()
      await this.$store.dispatch('user/logout')
      this.$router.push('/connect')
    }
  },
  mounted() {}
}
</script>
