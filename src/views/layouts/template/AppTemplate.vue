<template>
  <v-app>
    <app-top-bar></app-top-bar>
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script>
import AppTopBar from '@/views/layouts/template/AppTopBar.vue'

export default {
  name: 'AppTemplate',
  components: {AppTopBar}
}
</script>

<style scoped>

</style>
