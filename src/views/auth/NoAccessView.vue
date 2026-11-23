<script setup>
// Logged in, but not in the Cognito `admins` group (spec ROLE-03, FE-SES-08).
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const checking = ref(false)

// Group changes reach the browser only in a new token, so ask Cognito for one.
async function checkAgain() {
  checking.value = true
  try {
    await auth.reload({ forceRefresh: true })
    if (auth.isAdmin) router.replace({ name: 'dashboard' })
  } finally {
    checking.value = false
  }
}
</script>

<template>
  <v-card title="No access yet">
    <v-card-text>
      Your account doesn't have access to the admin site. Ask the owner to add you to the admins
      group, then log out and back in.
    </v-card-text>
    <v-card-actions>
      <v-btn :loading="checking" @click="checkAgain">Check again</v-btn>
      <v-spacer />
      <v-btn color="primary" variant="flat" :to="{ name: 'logout' }">Log out</v-btn>
    </v-card-actions>
  </v-card>
</template>
