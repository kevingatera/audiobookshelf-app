<template>
  <div class="w-full h-full"></div>
</template>

<script>
export default {
  async asyncData({ app, store, redirect }) {
    if (!store.state.onboardingHandled) {
      store.commit('setOnboardingHandled', true)
      const deviceData = await app.$db.getDeviceData()
      if (!deviceData?.serverConnectionConfigs?.length) return redirect('/connect')
    }
    return redirect('/bookshelf')
  },
  data() {
    return {}
  },
  computed: {},
  methods: {}
}
</script>
