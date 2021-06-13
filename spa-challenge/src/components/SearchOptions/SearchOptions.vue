<template>
  <div>
    <div
      v-click-outside="() => showList = false"
      class="search-options"
    >
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
          :class="{ 'selected-item': item.name === selectedItem.toLowerCase() }"
          @click="selectItem(index)"
        >
          {{ item.name | $capitalize }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';
import ClickOutside from 'vue-click-outside';

export default Vue.extend({
  directives: {
    ClickOutside,
  },
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
  computed: {
    search() {
      return this.$route.query.q;
    },
  },
  watch: {
    search() {
      this.comboBox();
    },
  },
  created() {
    this.comboBox();
  },
  methods: {
    comboBox() {
      const { list, $route, typeOption } = this;

      const type = typeOption === 'sort' ? 'filter' : 'per_page';
      let itemIndex;
      let itemName;

      if (type === 'filter') {
        itemIndex = list.findIndex((obj) => String(obj.name) === $route.query[type]);
      } else {
        itemIndex = list.findIndex((obj) => String(obj.code) === $route.query[type]);
      }

      if (itemIndex >= 0) {
        itemName = list[itemIndex].name;
      } else {
        itemName = list[0].name;
      }

      this.selectedItem = this.$options.filters.$capitalize(itemName);
    },
    selectItem(index) {
      this.showList = false;

      const item = Object(this.list[index]);
      const name = this.$options.filters.$capitalize(item.name);

      if (name !== this.selectedItem) {
        this.selectedItem = name;

        const { query } = this.$route;
        const searchParams = { ...query };
        delete searchParams.page;

        if (this.typeOption === 'sort') {
          Object.assign(searchParams, { filter: item.name });
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
