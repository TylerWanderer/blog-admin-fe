import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import vuetify from 'vite-plugin-vuetify'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Loads .env, .env.[mode] and their .local versions. The '' prefix also
  // loads variables without VITE_, which stay in this config and never reach
  // the browser bundle.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      vue(),
      // Imports only the Vuetify components and directives the app uses.
      vuetify({ autoImport: true }),
      vueDevTools(),
    ],
    server: {
      proxy: {
        // The browser calls /api/posts on the dev server's own origin, and Vite
        // forwards it server-side, path unchanged, to the API, which serves
        // every endpoint under /api. Same origin for the browser, so the API
        // needs no CORS setup. CloudFront does the same in production: it
        // sends /api/* to the API and everything else to the S3 site.
        '/api': {
          // The deployed API on ECS, or a local uvicorn (see .env.example).
          target: env.API_PROXY_TARGET || 'http://localhost:8000',
          changeOrigin: true,
        },
      },
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    test: {
      // Vuetify components import their own CSS, which plain Node can't load;
      // inlining sends Vuetify through Vite's pipeline, which handles it.
      server: { deps: { inline: ['vuetify'] } },
    },
  }
})
