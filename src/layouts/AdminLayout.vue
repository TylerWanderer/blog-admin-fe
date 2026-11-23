<script setup>
import { computed, ref } from 'vue'
import { useTheme } from 'vuetify'

import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const roleLabel = computed(() => (auth.isAdmin ? 'Admin' : ''))

// The sidebar's links. Each `to` is a route name from src/router/index.js.
const navItems = [
  { title: 'Dashboard', icon: 'mdi-view-dashboard-outline', to: 'dashboard' },
  { title: 'Posts', icon: 'mdi-file-document-edit-outline', to: 'posts' },
  { title: 'Tags', icon: 'mdi-tag-multiple-outline', to: 'tags' },
]

// null lets Vuetify decide: open on desktop, closed (slide-over) on phones.
const drawer = ref(null)

const theme = useTheme()
</script>

<template>
  <v-navigation-drawer v-model="drawer">
    <v-list-item title="Blog Engine" subtitle="Admin" prepend-icon="mdi-feather" class="py-4" />
    <v-divider />
    <v-list nav density="comfortable">
      <v-list-item
        v-for="item in navItems"
        :key="item.to"
        :title="item.title"
        :prepend-icon="item.icon"
        :to="{ name: item.to }"
        color="primary"
      />
    </v-list>
  </v-navigation-drawer>

  <v-app-bar flat border="b">
    <v-app-bar-nav-icon aria-label="Toggle navigation" @click="drawer = !drawer" />
    <v-app-bar-title>{{ $route.meta.title }}</v-app-bar-title>
    <template #append>
      <v-btn
        icon="mdi-theme-light-dark"
        aria-label="Toggle light or dark theme"
        @click="theme.toggle(['light', 'dark'])"
      />
      <!-- Who is logged in, and Log out (spec FE-SES-07). -->
      <v-menu location="bottom end">
        <template #activator="{ props }">
          <v-btn v-bind="props" class="text-none" aria-label="Account menu">
            <v-icon icon="mdi-account-circle-outline" size="large" />
            <span class="d-none d-sm-inline ml-2">{{ auth.user?.email }}</span>
          </v-btn>
        </template>
        <v-list density="compact" min-width="240">
          <v-list-item :title="auth.user?.email" :subtitle="roleLabel" />
          <v-divider class="my-1" />
          <v-list-item title="Log out" prepend-icon="mdi-logout" :to="{ name: 'logout' }" />
        </v-list>
      </v-menu>
    </template>
  </v-app-bar>

  <v-main>
    <v-container class="py-6" max-width="1200">
      <RouterView />
    </v-container>
  </v-main>
</template>
