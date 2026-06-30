import { createRouter, createWebHistory } from 'vue-router'
import { popLastGuard, hasGuards } from '@/composables/useBackGuard'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomePage.vue')
  },
  {
    path: '/services',
    name: 'Services',
    component: () => import('@/views/ServicesPage.vue')
  },
  {
    path: '/trips',
    name: 'Trips',
    component: () => import('@/views/TripsPage.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

router.beforeEach((to, from) => {
  if (hasGuards()) {
    popLastGuard()
    return false
  }
  return true
})

export default router