<template>
  <div>
    <section class="pagination">
      <button
        v-if="pages.before > 0"
        v-wave
        @click="goToPage(pages.before)"
      >
        {{ pages.before }}
      </button>
      <button
        v-wave
        class="current"
        @click="goToPage(pages.current)"
      >
        {{ pages.current }}
      </button>
      <button
        v-wave
        @click="goToPage(pages.after)"
      >
        {{ pages.after }}
      </button>
    </section>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  props: {
    currentPage: {
      type: Number,
      default: 1,
    },
  },
  data() {
    return {
      pages: {
        after: 0,
        current: 0,
        before: 0,
      },
    };
  },
  watch: {
    currentPage(): void {
      this.addPages();
    },
  },
  created(): void {
    this.addPages();
  },
  methods: {
    addPages(): void {
      this.pages.current = this.currentPage;
      this.pages.after = this.currentPage + 1;
      this.pages.before = this.currentPage - 1;
    },
    goToPage(page: number): void {
      const { query } = this.$route;
      const newQuery = { ...query, page: String(page) };

      this.$router.replace({ query: newQuery });
    },
  },
});
</script>

<style lang="scss" scoped>
  @import './style.scss';
</style>
