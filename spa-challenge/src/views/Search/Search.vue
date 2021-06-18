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
          <div
            v-if="!response.loaded"
            class="loader loader-repository"
          />
          {{ response.total | $numberFormat }} repositórios
        </h2>
        <div />
        <div class="options">
          <search-sort
            :list="lists.sortOptions"
            type-option="sort"
          />
          <search-sort
            :list="lists.resultOptions"
          />
        </div>
        <template v-if="response.items.length > 0 && response.loaded">
          <ul class="items">
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
          <pagination
            :current-page="parseInt(query.page) || 1"
            :total="response.total"
            :per-page="parseInt(query.per_page) || 10"
            :per-pages-accepted="lists.resultOptions"
          />
        </template>
        <template v-else>
          <div
            v-if="response.loaded"
            class="items-empty"
          >
            <i class="fas fa-search" />
            <p>Nenhum resultado encontrado</p>
          </div>
          <div v-else>
            <ul class="items">
              <li
                v-for="(fakeRepo, index) in response.fakeLoaded"
                :key="index"
                style="border: none;"
              >
                <div class="loader loader-item" />
                <div class="title">
                  <a>
                    {{ fakeRepo }}
                  </a>
                </div>
                <div class="description">
                  Lorem ipsum dolor sit amet consectetur, adipisicing elit.
                  Nemo incidunt doloremque vel,
                  nostrum ipsum atque quisquam, corrupti aperiam saepe dolorem
                  iusto eum molestias temporibus
                  sed, laudantium at. Voluptate, debitis velit?
                </div>
                <div class="points">
                  {{ fakeRepo }}
                </div>
              </li>
            </ul>
          </div>
        </template>
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
    <div class="push" />
  </div>
</template>

<script>
import Vue from 'vue';
import SearchBar from '@/components/SearchBar/SearchBar.vue';
import SearchSort from '@/components/SearchOptions/SearchOptions.vue';
import Pagination from '@/components/Pagination/Pagination.vue';
import data from './data';

export default Vue.extend({
  components: { SearchBar, SearchSort, Pagination },
  data() {
    return {
      lists: {},
      response: {
        total: 0,
        items: [],
        fakeLoaded: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
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
      this.response.loaded = false;

      const { $axios, query } = this;

      const { q } = query;
      const page = Number(query.page);
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

      if (Number.isInteger(page) && page >= 1) {
        Object.assign(params, {
          page,
        });
      }

      $axios({ params })
        .then((res) => {
          this.response.total = res.data.total_count;
          this.response.items = res.data.items;
          this.response.loaded = true;
        })
        .catch((err) => {
          this.response.loaded = true;
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
  @import './loader.scss';
</style>
