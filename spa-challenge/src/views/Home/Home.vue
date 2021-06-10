<template>
  <div style="height: 100%;">
    <section class="container">
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
    <footer class="container footer">
      Feito com <i class="fas fa-heart" /> para a equipe da Field avaliar
    </footer>
  </div>
</template>

<script>
import Vue from 'vue';

export default Vue.extend({
  data() {
    return {
      search: null,
      showClearButton: false,
    };
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
      }
    },
  },
});
</script>

<style lang="scss">
  @import './style.scss';
</style>
