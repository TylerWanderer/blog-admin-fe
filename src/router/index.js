import { createRouter, createWebHistory } from 'vue-router'

import { useAuthStore } from '@/stores/auth'
import { routes } from './routes'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// Runs before every navigation: the session rules from spec FE-SES-01,
// FE-AUTH-06 and FE-SES-08. This only decides what the UI shows; the API
// enforces the real permissions.
router.beforeEach(async (to) => {
  const auth = useAuthStore()
  await auth.init() // loads the saved session once; instant afterwards

  if (to.meta.public) {
    return to.name === 'login' && auth.isAuthenticated ? { name: 'dashboard' } : true
  }
  if (!auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if (!auth.role) {
    return to.name === 'no-access' ? true : { name: 'no-access' }
  }
  return to.name === 'no-access' ? { name: 'dashboard' } : true
})

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} · Blog Engine Admin` : 'Blog Engine Admin'
})

export default router
