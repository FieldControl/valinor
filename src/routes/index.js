import { createRouter, createWebHashHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    component: () => import('@/pages/Home.vue')
  },
  {
    name: 'searchRepository',
    path: '/github/repository/search/:searchTerm',
    component: () => import('@/pages/SearchRepository.vue')
  },
  {
    name: 'searchRepositoryDetails',
    path: '/:username:/:reponame/:type',
    component: () => import('@/pages/SearchRepositoryDetails.vue')
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;