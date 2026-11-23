// The route table, kept apart from the router instance (index.js) so tests can
// build a router from it with in-memory history, without a browser.
import AdminLayout from '@/layouts/AdminLayout.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import { useAuthStore } from '@/stores/auth'

export const routes = [
  {
    // Every admin page renders inside AdminLayout's <RouterView>.
    // Keep this block first: both layouts sit at '/', and when two routes
    // match equally Vue Router takes the first one defined. Second, '/'
    // would render AuthLayout with an empty page instead of the dashboard.
    path: '/',
    component: AdminLayout,
    children: [
      {
        path: '',
        name: 'dashboard',
        // Lazy-loaded: each page becomes its own JS chunk, fetched on first visit.
        component: () => import('@/views/DashboardView.vue'),
        meta: { title: 'Dashboard' },
      },
      {
        path: 'posts',
        name: 'posts',
        component: () => import('@/views/PostsView.vue'),
        meta: { title: 'Posts' },
      },
      {
        path: 'posts/new',
        name: 'post-create',
        component: () => import('@/views/PostCreateView.vue'),
        meta: { title: 'New post' },
      },
      {
        path: 'tags',
        name: 'tags',
        component: () => import('@/views/TagsView.vue'),
        meta: { title: 'Tags' },
      },
      {
        path: ':pathMatch(.*)*',
        name: 'not-found',
        component: () => import('@/views/NotFoundView.vue'),
        meta: { title: 'Page not found' },
      },
    ],
  },
  {
    // Pages outside the admin shell. `public` pages work without a session.
    path: '/',
    component: AuthLayout,
    children: [
      {
        path: 'login',
        name: 'login',
        component: () => import('@/views/auth/LoginView.vue'),
        meta: { title: 'Log in', public: true },
      },
      {
        path: 'forgot-password',
        name: 'forgot-password',
        component: () => import('@/views/auth/ForgotPasswordView.vue'),
        meta: { title: 'Reset password', public: true },
      },
      {
        path: 'no-access',
        name: 'no-access',
        component: () => import('@/views/auth/NoAccessView.vue'),
        meta: { title: 'No access' },
      },
      {
        // Logging out is a navigation, so a page with unsaved changes can
        // still cancel it (its leave guard runs before this one).
        path: 'logout',
        name: 'logout',
        meta: { public: true },
        beforeEnter: async () => {
          await useAuthStore().signOut()
          return { name: 'login' }
        },
        // Never rendered: beforeEnter always redirects.
        component: () => import('@/views/auth/LoginView.vue'),
      },
    ],
  },
]
