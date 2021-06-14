import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';
import qs from 'qs';

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'Home',
    component: () => import(/* webpackChunkName: "index" */ './views/Home/Home.vue'),
  },
  {
    path: '/search',
    name: 'Search',
    component: () => import(/* webpackChunkName: "404" */ './views/Search/Search.vue'),
    beforeEnter: (to, from, next) => {
      const query = to.query.q;
      if (query !== '' && query !== undefined) {
        return next();
      }

      return next({ name: 'Home' });
    },
  },
  {
    path: '*',
    name: 'PageNotFound',
    component: () => import(/* webpackChunkName: "404" */ './views/PageNotFound/PageNotFound.vue'),
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
  stringifyQuery: (query) => {
    const result = qs.stringify(query, { format: 'RFC1738' });
    return result ? (`?${result}`) : '';
  },
  scrollBehavior() {
    return { x: 0, y: 0 };
  },
});

export default router;
