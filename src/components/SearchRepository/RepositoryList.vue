<template>
  <div v-if="store.loading || store.repositories.length > 0" class="repository-list col-12 col-lg-8 p-0 pb-5">
    <div v-if="!store.loading">
      <article
        v-for="(repository, index) in store.repositories"
        :key="index"
        class="repository-list__card d-flex justify-content-between p-3 mt-3 border border-dark rounded"
      >
        <div class="repository-list__card-info overflow-hidden">
          <div class="title d-flex align-items-center">
            <figure class="mr-2 m-0">
              <img :src="repository.avatar" alt="Repository Avatar" class="rounded">
            </figure>
            
            <h3 class="font-16 m-0">
              <router-link :to="`/${repository.owner}/${repository.name}/issues`" class="text-primary">
                {{ repository.owner }}/<strong>{{ repository.name }}</strong>
              </router-link>
            </h3>
          </div>

          <div class="description mt-1 mb-2 font-14">
            <p class="m-0">{{ repository.description }}</p>
          </div>

          <div class="topics__list d-flex flex-wrap">
            <div v-for="topic in repository.topics" :key="topic" class="topics__list-item font-13">
              <router-link to="#" class="font-small">{{ topic }}</router-link>
            </div>
          </div>

          <div class="details mt-2 font-13 text-muted">
            <span class="language">{{ repository.language }}</span>
            <span class="separator mx-2">·</span>
            <span class="starts">{{ repository.stars }}</span>
            <span class="separator mx-2">·</span>
            <span class="updated">Updated {{ repository.updated }}</span>
          </div>
        </div>

        <div class="repository-list__card-btns mt-1">
          <button class="btn btn-dark--secundary btn-sm">
            <span class="fa-regular fa-star"></span>
            <span class="font-13 ml-1">Star</span>
          </button>
        </div>
      </article>

      <Pagination
        class="mt-5"
        :items_count="store.repositoriesCount"
        :per_page="store.perPage"
        @toPage="store.fetchRepositories($event)"
      />
    </div>

    <skeleton v-else>
      <skeleton-block v-for="item in store.perPage" :key="item" h="100px" class="rounded mt-3" />
    </skeleton>
  </div>

  <div v-else class="repository-list__not-results col-12 border border-dark mt-3">
    <div class="d-flex flex-column flex-lg-row align-items-center">
      <figure class="col-md-7 col-lg-5">
        <img src="@/assets/images/not-results.png" alt="No Results">
      </figure>

      <div class="col-lg-7 text-center text-lg-left mt-5 mt-lg-0">
        <h2 class="h4">Your search did not match any repositories</h2>
        <p class="text-muted mt-4 mt-lg-0">Search for other repositories...</p>
      </div>
    </div>
  </div>
</template>

<script>
import { useGithubRepositorySearchStore } from '@/stores/github/repository/search';
import Pagination from '@/components/Pagination.vue';
import Skeleton from "@/components/Skeleton.vue";
import SkeletonBlock from "@/components/SkeletonBlock.vue";

export default {
  components: {
    Pagination,
    Skeleton,
    SkeletonBlock
  },
  setup() {
    const store = useGithubRepositorySearchStore();
    return { store }
  },
  created() {
    const searchTerm = this.$route.params.searchTerm;
    const page = this.$route.query.p;

    this.store.searchTerm = searchTerm;
    this.store.fetchRepositories(page);
  },
  watch: {
    '$route.params.searchTerm'(term) {
      this.store.searchTerm = term;
      this.store.fetchRepositories();
    }
  }
}
</script>

<style scoped>
.repository-list__card-info .title img {
  width: 20px;
}

.repository-list__card-info .title .text-primary:hover {
  text-decoration: underline;
  text-decoration-color: var(--primary-color-blue);
  color: var(--primary-color-blue) !important
}

.repository-list__card-info .topics__list {
  column-gap: 10px;
  row-gap: 10px;
}

.repository-list__card-info .topics__list-item {
  background: var(--secundary-color-blue-light);
  border-radius: 10px;
  padding: 1px 8px;
}

.repository-list__card-info .topics__list-item:hover {
  background: var(--secundary-color-blue);
}

.repository-list__card-info .topics__list-item:hover a {
  color: var(--primary-color-light);
}

.repository-list__card-btns {
  min-width: 62px;
}

.repository-list__card-btns button {
  border-radius: 6px;
}

/* NOT RESULTS  */
.repository-list__not-results {
  padding: 128px 128px 128px 48px;
  border-radius: 6px;
}

@media (max-width: 1024px) {
  .repository-list__not-results {
    padding: 60px 0px;
  }
}
</style>
  