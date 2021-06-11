<template>
  <div>
    <div class="search-options">
      <button
        class="sort-button"
        @click="showList = !showList"
      >
        <p>{{ selectedItem }}</p>
      </button>
      <ul
        v-if="showList"
        class="list"
      >
        <li
          v-for="(item, index) in list"
          :key="index"
          :class="{ 'selected-item': item.name === selectedItem }"
          @click="selectItem(index)"
        >
          {{ item.name }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  props: {
    list: {
      type: Array,
      required: true,
    },
    typeOption: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      showList: false,
      selectedItem: '',
    };
  },
  created() {
    this.selectedItem = Object(this.list[0]).name;
  },
  methods: {
    selectItem(index: number): void {
      this.showList = false;

      const item = Object(this.list[index]);

      if (item.name !== this.selectedItem) {
        this.selectedItem = item.name;

        const { query } = this.$route;
        const searchParams = { ...query };
        delete searchParams.page;

        if (this.typeOption === 'sort') {
          Object.assign(searchParams, { filter: item.name.toLowerCase() });
        } else {
          Object.assign(searchParams, { per_page: item.code });
        }

        this.$router.replace({ query: searchParams });
      }
    },
  },
});
</script>

<style lang="scss" scoped>
  @import './style.scss';
</style>
