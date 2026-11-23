<script setup>
// "New password" + "Confirm" fields with a live checklist of the password rules.
// Used by the first-login step and by forgot password.
import { computed, ref } from 'vue'

import { PASSWORD_RULES, meetsPasswordRules } from '@/utils/auth'

const password = defineModel({ type: String, required: true })
const confirmation = ref('')
const visible = ref(false)

const checks = computed(() =>
  PASSWORD_RULES.map((rule) => ({ label: rule.label, ok: rule.test(password.value) })),
)

const passwordRules = [(v) => meetsPasswordRules(v) || "Password doesn't meet the rules below"]
const confirmRules = [(v) => v === password.value || "Passwords don't match"]
</script>

<template>
  <v-text-field
    v-model="password"
    label="New password"
    :type="visible ? 'text' : 'password'"
    :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'"
    :rules="passwordRules"
    autocomplete="new-password"
    @click:append-inner="visible = !visible"
  />
  <v-text-field
    v-model="confirmation"
    label="Confirm new password"
    :type="visible ? 'text' : 'password'"
    :rules="confirmRules"
    autocomplete="new-password"
  />
  <v-list density="compact" bg-color="transparent" class="py-0 mb-4" aria-label="Password rules">
    <v-list-item
      v-for="check in checks"
      :key="check.label"
      :title="check.label"
      :prepend-icon="check.ok ? 'mdi-check-circle' : 'mdi-circle-outline'"
      :base-color="check.ok ? 'success' : undefined"
      min-height="28"
    />
  </v-list>
</template>
