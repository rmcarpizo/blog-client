import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../pages/HomePage.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../pages/LoginPage.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../pages/RegisterPage.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/posts/:id',
    name: 'PostDetail',
    component: () => import('../pages/PostDetailPage.vue')
  },
  {
    path: '/posts/create',
    name: 'CreatePost',
    component: () => import('../pages/CreatePostPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/posts/:id/edit',
    name: 'EditPost',
    component: () => import('../pages/EditPostPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('../pages/AdminPage.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../pages/NotFoundPage.vue')
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Navigation Guards
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user'))

  if (to.meta.requiresAuth && !token) {
    return next({ name: 'Login', query: { redirect: to.fullPath } })
  }

  if (to.meta.requiresAdmin && user?.role !== 'admin') {
    return next({ name: 'Home' })
  }

  if (to.meta.guestOnly && token) {
    return next({ name: 'Home' })
  }

  next()
})

export default router
