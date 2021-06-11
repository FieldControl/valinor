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
        ref="searchBar"
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

<script lang="ts">
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
      search: '',
    };
  },
  created() {
    this.search = this.searchQuery;
  },
  methods: {
    clearButton(): void {
      const { search } = this;

      if (search === '' || search === null) {
        this.showClearButton = false;
      } else {
        this.showClearButton = true;
      }
    },
    clearSearch(): void {
      this.search = '';
      this.showClearButton = false;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { searchBar } = this.$refs as any;
      if (searchBar !== undefined) searchBar.focus();
    },
    goToSearch(): void {
      const { search } = this;
      const query = { q: search };

      if (search !== '' && search !== this.searchQuery) {
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
