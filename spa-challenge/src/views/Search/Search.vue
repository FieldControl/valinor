<template>
  <div>
    <search-bar
      :style-minimized="true"
      :search-query="query.q"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import SearchBar from '@/components/SearchBar/SearchBar.vue';

export default Vue.extend({
  components: { SearchBar },
  computed: {
    query() {
      return this.$route.query;
    },
  },
});
</script>

<style lang="scss" scoped>
  @import './style.scss';
</style>
