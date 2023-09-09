<template>
  <div class="search-repository">
    <Header />
    
    <main class="d-flex">
      <h1 class="d-none">Search Repositories {{ $route.params.searchTerm }}</h1>
      <SidebarLeft />

      <section class="search-repository__content d-flex col p-0">
        <div class="col-12 p-3 p-lg-4">
          <div class="header-content__info">
            <h2 class="count-results font-15">
              {{ repositoriesCountFormatted }} results <span class="text-muted font-13">(400 ms)</span>
            </h2>
          </div>

          <div class="d-flex flex-column-reverse flex-lg-row p-0">
            <RepositoryList />
          
            <aside class="repository-search__info col-lg-4 p-0 pl-lg-4" v-if="showRepositorySearchInfo">
              <div class="mt-3 py-3 pr-3 border border-dark rounded">
                <div class="pl-3">
                  <div class="title d-flex align-items-center">
                    <figure class="mr-2 m-0">
                      <img src="https://github.com/nodejs.png?size=40" alt="Repository Avatar">
                    </figure>

                    <h3 class="font-16 m-0">Node.js</h3>
                  </div>

                  <div class="description my-2 font-14 text-muted">
                    <p class="m-0">
                      Node.js is a tool for executing JavaScript in a variety of environments.
                    </p>
                  </div>
                </div>

                <ul class="topics__list mt-3 mb-0 pl-2">
                  <li class="topics__list-item font-14 py-1 pl-2 rounded">
                    <a href="https://nodejs.org/en" target="_blank" class="d-flex align-items-center">
                      <span class="fa-solid fa-link mr-1 text-primary"></span>
                      <span class="text-primary">nodejs.org</span>
                    </a>
                  </li>
                  
                  <li class="topics__list-item font-14 py-1 pl-2 mt-2 rounded">
                    <a href="https://en.wikipedia.org/wiki/Node.js" target="_blank" class="d-flex align-items-center">
                      <span class="fa-solid fa-link mr-1 text-primary"></span>
                      <span class="text-primary">Wikipedia</span>
                    </a>
                  </li>
                  
                  <li class="topics__list-item font-14 py-1 pl-2 mt-2 rounded">
                    <a href="https://github.com/nodejs" target="_blank" class="d-flex text-muted align-items-center">
                      <span class="fa-solid fa-box-open mr-1"></span>
                      <span>nodejs</span>
                    </a>
                  </li>
                  
                  <li class="topics__list-item font-14 py-1 pl-2 mt-2 rounded">
                    <a href="https://github.com/topics/node" target="_blank" class="d-flex text-muted align-items-center">
                      <span class="fa-solid fa-hashtag mr-2"></span>
                      <span>View topic</span>
                    </a>
                  </li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
import { useGithubRepositorySearchStore } from '@/stores/github/repository/search';
import { mapState } from 'pinia';
import Header from '@/components/Header.vue';
import RepositoryList from '@/components/SearchRepository/RepositoryList.vue';
import SidebarLeft from '@/components/SearchRepository/SidebarLeft.vue';

export default {
  name: 'SearchRepository',
  components: {
    Header,
    RepositoryList,
    SidebarLeft
  },
  data: () => ({
    showHeaderDrawer: false
  }),
  computed: {
    ...mapState(useGithubRepositorySearchStore, [
      'loading',
      'repositoriesCount',
      'repositoriesCountFormatted'
    ]),
    showRepositorySearchInfo() {
      return this.loading || this.repositoriesCount > 0;
    }
  }
}
</script>

<style>
/* SEARCH HEADER */
.search-repository .search-input input {
  height: 30px;
}

.search-repository .search-input .input-group-prepend {
  top: 1px;
}

/* ASIDE REPOSITORY SEARCH */
.repository-search__info .title img {
  width: 24px;
}

.repository-search__info .topics__list-item:hover {
  background: var(--secundary-color-background-dark);
}

.topics__list-item .text-muted:hover span:last-child {
  color: var(--primary-color-light) !important;
}
</style>