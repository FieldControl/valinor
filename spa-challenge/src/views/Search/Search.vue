<template>
  <div>
    <search-bar
      :style-minimized="true"
      :search-query="query.q"
    />
    <section class="container">
      <div class="informations">
        <h1 class="txt-overflow">
          {{ query.q }}
        </h1>
        <h2 class="txt-overflow">
          70.652 repositórios
        </h2>
      </div>
      <div class="options">
        <search-sort
          :list="lists.sortOptions"
          type-option="sort"
        />
      </div>
    </section>
  </div>
</template>

<script>
import Vue from 'vue';
import SearchBar from '@/components/SearchBar/SearchBar.vue';
import SearchSort from '@/components/SearchOptions/SearchOptions.vue';
import data from './data';

export default Vue.extend({
  components: { SearchBar, SearchSort },
  data() {
    return {
      lists: {},
    };
  },
  computed: {
    query() {
      return this.$route.query;
    },
  },
  created() {
    this.lists = data;
  },
});
</script>

<style lang="scss" scoped>
  @import './style.scss';
</style>
