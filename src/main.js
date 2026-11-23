import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import { configureAmplify } from './plugins/amplify'
import { setUnauthorizedHandler } from './api/client'
import { useAuthStore } from './stores/auth'

configureAmplify()

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(vuetify)

// The API rejected our token (expired refresh token, disabled account...):
// sign out and send the user to log in again (spec FE-SES-05).
const auth = useAuthStore()
setUnauthorizedHandler(async () => {
  const wasLoggedIn = auth.isAuthenticated
  await auth.signOut()
  // During the first load the router guard does the redirect itself.
  if (wasLoggedIn) {
    router.push({
      name: 'login',
      query: { redirect: router.currentRoute.value.fullPath, reason: 'expired' },
    })
  }
})

app.mount('#app')
