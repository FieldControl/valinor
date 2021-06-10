<template>
  <div>
    <search-bar
      :style-minimized="true"
      :search-query="searchQuery"
    />
  </div>
</template>

<script>
import Vue from 'vue';
import SearchBar from '@/components/SearchBar/SearchBar.vue';

export default Vue.extend({
  components: { SearchBar },
  data() {
    return {
      searchQuery: null,
    };
  },
  created() {
    const { q } = this.$route.query;

    if (q !== undefined && q !== '') {
      this.searchQuery = q;
    }
  },
});
</script>

<style lang="scss" scoped>
  @import './style.scss';
</style>
