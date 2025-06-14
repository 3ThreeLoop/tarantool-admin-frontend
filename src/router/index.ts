import { useAuthStore } from '@/stores/auth/store'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('../layouts/MainLayout.vue'),
      meta: {requiresAuth: true},
      children: [
        {
          path: '/',
          name: 'home',
          component: () => import('../views/Home.vue'),
        },
      ],
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/Login.vue'),
    },
  ],
})

router.beforeEach((to, from, next)=> {
  const authStore = useAuthStore()
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next("/login")
  } else if (to.path === "/login" && authStore.isAuthenticated) {
    next("/")
  } else {
    next()
  }
})

export default router
