<template>
  <div>
    <search-bar
      :style-minimized="true"
      :search-query="query.q"
    />
    <section
      v-if="response.error === null"
      class="container"
    >
      <div class="informations">
        <h1 class="txt-overflow">
          {{ query.q | $capitalize }}
        </h1>
        <h2 class="txt-overflow">
          {{ response.total | $numberFormat }} repositórios
        </h2>
      </div>
      <div class="options">
        <search-sort
          :list="lists.sortOptions"
          type-option="sort"
        />
        <search-sort
          :list="lists.resultOptions"
        />
      </div>
      <ul
        v-if="response.items.length > 0"
        class="items"
      >
        <li
          v-for="(repo, index) in response.items"
          :key="index"
        >
          <div class="title">
            <a
              rel="noreferrer noopener"
              target="_blank"
              :href="repo.html_url"
            >
              {{ repo.full_name }}
            </a>
            <p>
              <i class="far fa-star" /> {{ repo.stargazers_count | $numberFormat }}
            </p>
          </div>
          <p class="description">
            <template v-if="repo.description !== null">
              {{ repo.description | $emoji }}
            </template>
            <template v-else>
              Sem descrição
            </template>
          </p>
          <p class="points">
            {{ repo.forks_count | $numberFormat }} forks
            &nbsp;•&nbsp;
            {{ repo.open_issues_count | $numberFormat }} issues
            &nbsp;•&nbsp;
            {{ repo.watchers | $numberFormat }} watchers
          </p>
        </li>
      </ul>
      <div
        v-else
        class="items-empty"
      >
        <i class="fas fa-search" />
        <p>Nenhum resultado encontrado</p>
      </div>
    </section>
    <section
      v-else
      class="container error-container"
    >
      <img
        src="/images/favicon.svg"
        alt="Ícone do GitHub"
      >
      <h3>Ocorreu um erro!</h3>
      <p> {{ response.error | $capitalize }} </p>
      <button
        v-wave
        class="btn-primary"
        @click="searchRepositories"
      >
        Tentar novamente
      </button>
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
      response: {
        total: 0,
        items: [],
        error: null,
        loaded: false,
      },
    };
  },
  computed: {
    query() {
      return this.$route.query;
    },
  },
  watch: {
    query() {
      this.searchRepositories();
    },
  },
  created() {
    this.lists = data;
    document.title = `${this.$route.query.q} - SearchHub`;
    this.searchRepositories();
  },
  methods: {
    searchRepositories() {
      const { $axios, query } = this;

      const q = encodeURIComponent(query.q);
      const params = { q, per_page: 10 };

      const filter = this.findQuery(query.filter, 'sortOptions', 'name');
      const perPage = this.findQuery(Number(query.per_page), 'resultOptions', 'code');

      if (filter !== undefined) {
        Object.assign(params, {
          sort: filter.sort,
          order: filter.order,
        });
      }

      if (perPage !== undefined) {
        Object.assign(params, {
          per_page: perPage.code,
        });
      }

      if (Number.isInteger(query.page)) {
        Object.assign(params, {
          page: query.page,
        });
      }

      $axios({ params })
        .then((res) => {
          this.response.total = res.data.total_count;
          this.response.items = res.data.items;
        })
        .catch((err) => {
          this.response.error = err.response.data.message;
        });
    },
    findQuery(param, objName, objVerification) {
      const list = this.lists[objName];
      if (list === undefined) {
        return undefined;
      }

      const index = list.findIndex((res) => res[objVerification] === param);
      if (index < 0) {
        return undefined;
      }

      return list[index];
    },
  },
});
</script>

<style lang="scss" scoped>
  @import './style.scss';
</style>
