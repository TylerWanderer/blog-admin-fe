<script setup>
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { useNotificationsStore } from '@/stores/notifications'

const notifications = useNotificationsStore()
</script>

<template>
  <v-app>
    <!-- The router picks the layout (AdminLayout for now; a login page could use none). -->
    <RouterView />

    <!-- App-wide UI, rendered once and driven by Pinia stores. -->
    <v-snackbar-queue v-model="notifications.queue" location="bottom right" closable />
    <ConfirmDialog />
  </v-app>
</template>
