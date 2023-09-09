<template>
  <div class="repository-details">
    <Header />

    <main class="repository-details__main">
      <div class="repository-details__header pt-4">
        <div class="repository-title d-flex align-items-center mb-4 px-2 px-lg-4">
          <h2 class="h5 text-primary mb-0 ml-2 font-weight-normal">
            <span class="fa-solid fa-box-open text-muted"></span>
            <small class="d-none">Issues: </small>
            {{ $route.params.username }}
            <small class="text-muted"> / </small>
            <strong>{{ $route.params.reponame }}</strong>
          </h2>

          <p class="repository-type border border-dark my-0 ml-2 px-2 font-12 text-muted">Public</p>
        </div>

        <ul class="repository-details__nav nav border-bottom border-dark px-2 px-lg-4">
          <li v-for="(item, index) in navItems" :key="index" class="nav-item" :class="{ 'active': item.active }">
            <router-link to="#" class="nav-link text-light">
              <span class="text-muted" :class="item.icon"></span>
              <span class="ml-2 font-13">{{ item.title }}</span>
            </router-link>
          </li>
        </ul>
      </div>

      <div class="repository-details__content container-xl px-3 py-4">
        <RepositoryIssues />
      </div>
    </main>
  </div>
</template>

<script>
import Header from '@/components/Header.vue';
import RepositoryIssues from '@/components/RepositoryDetails/RepositoryIssues.vue';

export default {
  name: 'SearchRepositoryDetails',
  components: {
    Header,
    RepositoryIssues
  },
  data: () => ({
    showHeaderDrawer: false
  }),
  computed: {
    title() {
      const { username, reponame } = this.$route.params;
      return `${username} / ${reponame}`;
    },
    navItems() {
      return [
        {
          title: 'Code',
          path: '#',
          icon: 'fa-solid fa-code'
        },
        {
          title: 'Issues',
          path: '#',
          icon: 'fa-regular fa-circle-dot',
          active: true
        },
        {
          title: 'Pull requests',
          path: '#',
          icon: 'fa-solid fa-code-pull-request'
        },
        {
          title: 'Discussions',
          path: '#',
          icon: 'fa-regular fa-comments'
        },
        {
          title: 'Actions',
          path: '#',
          icon: 'fa-regular fa-circle-play'
        },
        {
          title: 'Projects',
          path: '#',
          icon: 'fa-solid fa-table-list'
        },
        {
          title: 'Security',
          path: '#',
          icon: 'fa-solid fa-shield-halved',
        },
        {
          title: 'Insights',
          path: '#',
          icon: 'fa-solid fa-chart-line'
        }
      ];
    }
  }
}
</script>

<style>
.repository-details__header .nav-item.active::after {
  content: '';
  display: block;
  width: 100%;
  height: 2px;
  background-color: #F78166;
  transform: translateY(1.5px);
}

.repository-details .repository-type {
  border-radius: 20px !important;
}

.repository-details__content {
  padding-left: 30px;
  padding-right: 30px;
}

.repository-details .container-xl {
  max-width: 1280px;
}
</style>