import { createRouter, createWebHistory } from 'vue-router'
import TabsView from '../views/TabsView.vue'
import RecommendView from '../views/RecommendView.vue'
import SearchView from '../views/SearchView.vue'
import RateView from '../views/RateView.vue'
import SingerView from '../views/SingerView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: 'recommend'
    },
    {
      path: '/tabs',
      name: 'tabs',
      component: TabsView,
      children: [
        { name: 'recommend', path: '/recommend', component: RecommendView },
        { name: 'singer', path: '/singer', component: SingerView },
        { name: 'rate', path: '/rate', component: RateView },
        { name: 'search', path: '/search', component: SearchView }
      ]
    },
    { name: 'singerdetail', path: '/singer/:id', component: () => import('../views/SingerDetail.vue') },
    { name: 'ratedetail', path: '/rate/:id', component: () => import('../views/RateDetail.vue') },
    { name: 'login', path: '/login', component: () => import('../views/LoginView.vue') }
    // {
    //   path: '/about',
    //   name: 'about',
    //   // route level code-splitting
    //   // this generates a separate chunk (About.[hash].js) for this route
    //   // which is lazy-loaded when the route is visited.
    //   component: () => import('../views/AboutView.vue')
    // }
  ]
})

export default router
