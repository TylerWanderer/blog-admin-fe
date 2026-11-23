<script setup>
// Forgot password (spec FE-PWD-01..03): request a code by email, then set a
// new password with it.
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import NewPasswordFields from '@/components/auth/NewPasswordFields.vue'
import { useAuthStore } from '@/stores/auth'
import { authErrorMessage } from '@/utils/auth'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const step = ref('request') // 'request' | 'confirm'
const form = ref(null)
const email = ref(typeof route.query.email === 'string' ? route.query.email : '')
const code = ref('')
const newPassword = ref('')
const submitting = ref(false)
const error = ref('')

const required = (label) => (v) => !!v.trim() || `${label} is required`

async function run(action) {
  const { valid } = await form.value.validate()
  if (!valid) return
  submitting.value = true
  error.value = ''
  try {
    await action()
  } catch (e) {
    error.value = authErrorMessage(e)
  } finally {
    submitting.value = false
  }
}

const requestCode = () =>
  run(async () => {
    await auth.requestPasswordReset(email.value.trim())
    step.value = 'confirm'
  })

const resetPassword = () =>
  run(async () => {
    await auth.confirmPasswordReset(email.value.trim(), code.value.trim(), newPassword.value)
    router.push({ name: 'login', query: { reason: 'password-changed' } })
  })
</script>

<template>
  <v-card title="Reset your password">
    <v-card-text>
      <v-alert
        v-if="error"
        type="error"
        variant="tonal"
        density="compact"
        class="mb-4"
        :text="error"
        role="alert"
      />

      <v-form v-if="step === 'request'" ref="form" @submit.prevent="requestCode">
        <p class="text-body-2 text-medium-emphasis mb-4">
          Enter your email and we'll send you a code to reset your password.
        </p>
        <v-text-field
          v-model="email"
          label="Email"
          type="email"
          autocomplete="username"
          :rules="[required('Email')]"
          autofocus
        />
        <v-btn type="submit" color="primary" size="large" block :loading="submitting">
          Send code
        </v-btn>
      </v-form>

      <v-form v-else ref="form" @submit.prevent="resetPassword">
        <!-- Same text whether or not the account exists (FE-PWD-02). -->
        <v-alert
          type="info"
          variant="tonal"
          density="compact"
          class="mb-4"
          :text="`If an account exists for ${email.trim()}, we've sent a code to it.`"
        />
        <v-text-field
          v-model="code"
          label="Code"
          inputmode="numeric"
          autocomplete="one-time-code"
          :rules="[required('Code')]"
          autofocus
        />
        <NewPasswordFields v-model="newPassword" />
        <v-btn type="submit" color="primary" size="large" block :loading="submitting">
          Reset password
        </v-btn>
        <div class="text-center mt-4">
          <v-btn variant="text" size="small" :disabled="submitting" @click="step = 'request'">
            Send a new code
          </v-btn>
        </div>
      </v-form>

      <div class="text-center mt-2">
        <v-btn variant="text" size="small" :to="{ name: 'login' }">Back to log in</v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>
