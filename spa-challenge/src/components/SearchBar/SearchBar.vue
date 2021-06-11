<template>
  <section
    class="container"
    :class="{ minimized: styleMinimized }"
  >
    <h1>SearchHub</h1>
    <div class="search-bar">
      <div class="search-icon">
        <i class="fas fa-search" />
      </div>
      <input
        id="searchBar"
        v-model="search"
        type="text"
        placeholder="Pesquisar repositórios..."
        @keyup="clearButton"
        @keypress.enter="goToSearch"
      >
      <div
        v-if="showClearButton"
        class="times-icon"
        @click="clearSearch"
      >
        <i class="fas fa-backspace" />
      </div>
    </div>
    <div class="push" />
  </section>
</template>

<script>
import Vue from 'vue';

export default Vue.extend({
  props: {
    styleMinimized: {
      type: Boolean,
      default: false,
    },
    searchQuery: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      showClearButton: false,
      search: null,
    };
  },
  created() {
    this.search = this.searchQuery;
  },
  methods: {
    clearButton() {
      const { search } = this;

      if (search === '' || search === null) {
        this.showClearButton = false;
      } else {
        this.showClearButton = true;
      }
    },
    clearSearch() {
      this.search = null;
      this.showClearButton = false;

      document.querySelector('#searchBar').focus();
    },
    goToSearch() {
      const { search } = this;
      const query = { q: search };

      if (search !== null) {
        this.$router.push({ name: 'Search', query });
        document.title = `${search} - SearchHub`;
      }
    },
  },
});
</script>

<style lang="scss" scoped>
  @import './style.scss';
</style>
