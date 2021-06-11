<template>
  <div style="height: 100%;">
    <section class="home-container">
      <search-bar />
      <div class="push" />
    </section>
    <footer class="container footer">
      Feito com <i class="fas fa-heart" /> para a equipe da Field avaliar
    </footer>
  </div>
</template>

<script >
import Vue from 'vue';
import SearchBar from '@/components/SearchBar/SearchBar.vue';

export default Vue.extend({
  components: { SearchBar },
  created() {
    document.title = 'SearchHub - Pesquise repositórios do GitHub';
  },
});
</script>

<style lang="scss" scoped>
  @import './style.scss';
</style>
