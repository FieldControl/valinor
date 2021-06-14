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
        v-if="pages.after <= pages.last"
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
    total: {
      type: Number,
      default: 0,
    },
    perPage: {
      type: Number,
      default: 10,
    },
  },
  data() {
    return {
      pages: {
        after: 0,
        current: 0,
        before: 0,
        last: 0,
      },
    };
  },
  watch: {
    currentPage(): void {
      this.addPages();
    },
    total(): void {
      this.lastPage();
    },
  },
  created(): void {
    this.addPages();
    this.lastPage();
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
    lastPage(): void {
      const { total, perPage } = this;

      let totalItems = total;

      if (totalItems > 1000) {
        totalItems = 1000;
      }

      const lastPage = Math.ceil(totalItems / perPage);
      this.pages.last = lastPage;
    },
  },
});
</script>

<style lang="scss" scoped>
  @import './style.scss';
</style>
