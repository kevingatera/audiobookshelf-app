<template>
  <div class="w-full h-full overflow-y-auto pb-4" style="-webkit-overflow-scrolling: touch">
    <!-- Year in review banner shown at the top in December and January -->
    <div v-if="showYearInReviewBanner" class="px-4 pt-4">
      <div class="rounded-xl overflow-hidden">
        <stats-year-in-review-banner />
      </div>
    </div>

    <h1 class="text-xl font-semibold text-fg px-4 pt-4 pb-2">
      {{ $strings.HeaderYourStats }}
    </h1>

    <!-- Stats grid -->
    <div class="grid grid-cols-3 gap-3 px-4 pt-2">
      <div class="bg-secondary rounded-xl p-4 text-center">
        <p class="text-3xl font-bold text-fg">{{ $formatNumber(userItemsFinished.length) }}</p>
        <p class="text-xs text-fg-muted mt-1">{{ $strings.LabelStatsItemsFinished }}</p>
      </div>
      <div class="bg-secondary rounded-xl p-4 text-center">
        <p class="text-3xl font-bold text-fg">{{ $formatNumber(totalDaysListened) }}</p>
        <p class="text-xs text-fg-muted mt-1">{{ $strings.LabelStatsDaysListened }}</p>
      </div>
      <div class="bg-secondary rounded-xl p-4 text-center">
        <p class="text-3xl font-bold text-fg">{{ $formatNumber(totalMinutesListening) }}</p>
        <p class="text-xs text-fg-muted mt-1">{{ $strings.LabelStatsMinutesListening }}</p>
      </div>
    </div>

    <!-- Listening chart -->
    <div class="px-4 pt-4">
      <div class="bg-secondary rounded-xl p-4 overflow-hidden">
        <stats-daily-listening-chart :listening-stats="listeningStats" class="w-full" />
      </div>
    </div>

    <!-- Recent sessions -->
    <div class="px-4 pt-4">
      <div class="bg-secondary rounded-xl p-4">
        <h2 class="text-base font-semibold text-fg mb-3">{{ $strings.HeaderStatsRecentSessions }}</h2>
        <p v-if="!mostRecentListeningSessions.length" class="text-sm text-fg-muted">{{ $strings.MessageNoListeningSessions }}</p>
        <template v-for="(item, index) in mostRecentListeningSessions">
          <div :key="item.id" class="py-2" :class="index < mostRecentListeningSessions.length - 1 ? 'border-b border-warm' : ''">
            <div class="flex items-center">
              <p class="text-sm text-fg-muted w-6 min-w-[24px] flex-shrink-0">{{ index + 1 }}.</p>
              <div class="flex-grow min-w-0">
                <p class="text-sm text-fg truncate">{{ item.mediaMetadata ? item.mediaMetadata.title : '' }}</p>
                <p class="text-xs text-fg-muted">{{ $dateDistanceFromNow(item.updatedAt) }}</p>
              </div>
              <div class="flex-shrink-0 ml-2">
                <p class="text-xs font-bold text-fg">{{ $elapsedPretty(item.timeListening) }}</p>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- Year in review banner shown at the bottom Feb - Nov -->
    <div v-if="!showYearInReviewBanner" class="px-4 pt-4">
      <div class="rounded-xl overflow-hidden">
        <stats-year-in-review-banner />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      listeningStats: null,
      windowWidth: 0,
      showYearInReviewBanner: false
    }
  },
  watch: {
    currentLibraryId(newVal) {
      if (newVal) {
        this.init()
      }
    }
  },
  computed: {
    user() {
      return this.$store.state.user.user
    },
    username() {
      return this.user ? this.user.username : ''
    },
    currentLibraryId() {
      return this.$store.state.libraries.currentLibraryId
    },
    userMediaProgress() {
      return this.user ? this.user.mediaProgress : []
    },
    userItemsFinished() {
      return this.userMediaProgress.filter((lip) => !!lip.isFinished)
    },
    mostRecentListeningSessions() {
      if (!this.listeningStats) return []
      return this.listeningStats.recentSessions || []
    },
    totalMinutesListening() {
      if (!this.listeningStats) return 0
      return Math.round(this.listeningStats.totalTime / 60)
    },
    totalDaysListened() {
      if (!this.listeningStats) return 0
      return Object.values(this.listeningStats.days).length
    }
  },
  methods: {
    async init() {
      this.listeningStats = await this.$nativeHttp.get(`/api/me/listening-stats`).catch((err) => {
        console.error('Failed to load listening sesions', err)
        return []
      })

      let month = new Date().getMonth()
      // January and December show year in review banner
      if (month === 11 || month === 0) {
        this.showYearInReviewBanner = true
      }
    }
  },
  mounted() {
    this.init()
  }
}
</script>
