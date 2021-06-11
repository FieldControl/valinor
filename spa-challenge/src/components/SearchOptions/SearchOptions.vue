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
      required: true,
    },
  },
  data() {
    return {
      showList: false,
      selectedItem: '',
    };
  },
  mounted() {
    this.selectedItem = Object(this.list[0]).name;
  },
  methods: {
    selectItem(index: number): void {
      this.selectedItem = Object(this.list[index]).name;
      this.showList = false;
    },
  },
});
</script>

<style lang="scss" scoped>
  @import './style.scss';
</style>
