import {createRouter, createWebHistory} from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('@/views/layouts/template/AppTemplate'),
    children: [
      {
        path:'',
        name: 'home',
        component: () => import('@/views/pages/home')
      }
    ]
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

export default router
