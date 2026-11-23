import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

import { createVuetify } from 'vuetify'

// Components and directives are imported automatically, and only when used,
// by vite-plugin-vuetify (see vite.config.js), so we don't register them here.
export default createVuetify({
  theme: {
    // Follow the OS light/dark setting.
    defaultTheme: 'system',
  },
})
