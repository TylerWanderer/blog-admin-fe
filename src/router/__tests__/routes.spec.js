import { describe, expect, it } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'

import AdminLayout from '@/layouts/AdminLayout.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import { routes } from '../routes'

// Resolving only matches the route table; no guards run, so no session needed.
const router = createRouter({ history: createMemoryHistory(), routes })
const resolve = (path) => router.resolve(path)

describe('route table', () => {
  it.each([
    ['/', 'dashboard', AdminLayout],
    ['/posts', 'posts', AdminLayout],
    ['/posts/new', 'post-create', AdminLayout],
    ['/tags', 'tags', AdminLayout],
    ['/login', 'login', AuthLayout],
    ['/forgot-password', 'forgot-password', AuthLayout],
    ['/no-access', 'no-access', AuthLayout],
    ['/logout', 'logout', AuthLayout],
    ['/no-such-page', 'not-found', AdminLayout],
  ])('%s renders %s inside the right layout', (path, name, layout) => {
    const route = resolve(path)
    expect(route.name).toBe(name)
    expect(route.matched[0].components.default).toBe(layout)
  })

  it('/ is the dashboard, not an empty auth layout', () => {
    // Regression: both layouts sit at '/'. With AuthLayout first, '/' matched
    // the AuthLayout parent itself and showed a blank page after login.
    expect(resolve('/').matched).toHaveLength(2)
  })

  it('only the login and forgot-password pages (and logout) are public', () => {
    const publicNames = router
      .getRoutes()
      .filter((route) => route.meta.public)
      .map((route) => route.name)
      .sort()
    expect(publicNames).toEqual(['forgot-password', 'login', 'logout'])
  })
})
