<template>
  <v-app-bar color="primary">
    <div class="mx-6">
      <router-link to="/" class="d-flex justify-center">
        <v-img src="src/assets/github.png" width="40">
        </v-img>
      </router-link>
    </div>
    <v-fade-transition group>
      <v-sheet v-for="route in routes" :key="route.name" :color="getBackgroundColor(route.name)"
               style="cursor: pointer" class="d-flex align-center py-3 pr-6 pl-5">
        <v-avatar size="45" class="ml-n1 pr-2"
                  @click="sendTo(route.name)">
          <v-icon size="30">{{ route.icon }}</v-icon>
        </v-avatar>
        <div class="text-subtitle-2">{{ route.text }}</div>
      </v-sheet>
    </v-fade-transition>
  </v-app-bar>
</template>

<script>
export default {
  name: 'AppTopbar',
  computed: {
    routeName() {
      return this.$route.name
    },
  },
  data() {
    return {
      routes: [
        {
          icon: 'mdi-format-list-bulleted',
          text: 'Repositories',
          name: 'Home'
        },
      ]
    }
  },
  methods: {
    sendTo(name) {
      this.$router.push({name: name})
    },
    getBackgroundColor(name) {
      return this.routeName === name ? 'secondary' : 'transparent'
    },
  },
}
</script>

<style scoped>

</style>
