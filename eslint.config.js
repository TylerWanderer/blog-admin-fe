// ESLint finds bugs and Vue mistakes; Prettier owns formatting, so the
// formatting rules are switched off here (eslint-config-prettier, last).
import { defineConfig, globalIgnores } from 'eslint/config'
import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import prettierConfig from 'eslint-config-prettier/flat'
import globals from 'globals'

export default defineConfig([
  globalIgnores(['dist/**', 'coverage/**']),

  {
    files: ['**/*.{js,mjs,vue}'],
    languageOptions: { globals: globals.browser },
  },

  // Config files run in Node, not the browser.
  {
    files: ['*.config.js'],
    languageOptions: { globals: globals.node },
  },

  js.configs.recommended,
  // "recommended" = errors + strongly recommended + recommended style rules.
  ...pluginVue.configs['flat/recommended'],

  {
    rules: {
      // Allows dropping a key by destructuring: `const { id, ...rest } = obj`.
      'no-unused-vars': ['error', { ignoreRestSiblings: true }],
    },
  },

  prettierConfig,
])
