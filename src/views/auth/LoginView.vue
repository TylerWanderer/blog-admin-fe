<script setup>
// Login (spec FE-AUTH-01..06), including the forced new password on a first
// login with a temporary password.
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import NewPasswordFields from '@/components/auth/NewPasswordFields.vue'
import { useAuthStore } from '@/stores/auth'
import { authErrorMessage, safeRedirect } from '@/utils/auth'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const step = ref('signIn') // 'signIn' | 'newPassword'
const form = ref(null)
const email = ref('')
const password = ref('')
const newPassword = ref('')
const showPassword = ref(false)
const submitting = ref(false)
const error = ref('')

// Why the user landed here, set by whoever sent them (?reason=...).
const notice = computed(
  () =>
    ({
      expired: 'Your session has expired. Please log in again.',
      'password-changed': 'Password changed. Log in with your new password.',
    })[route.query.reason],
)

const required = (label) => (v) => !!v.trim() || `${label} is required`

async function run(action) {
  const { valid } = await form.value.validate()
  if (!valid) return
  submitting.value = true
  error.value = ''
  try {
    handleStep(await action())
  } catch (e) {
    handleError(e)
  } finally {
    submitting.value = false
  }
}

const submitSignIn = () => run(() => auth.signIn(email.value.trim(), password.value))
const submitNewPassword = () => run(() => auth.setNewPassword(newPassword.value))

function handleStep(nextStep) {
  if (nextStep === 'DONE') {
    // The router guard sends users without a role on to the "no access" page.
    router.replace(safeRedirect(route.query.redirect))
  } else if (nextStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
    step.value = 'newPassword'
    password.value = ''
  } else if (nextStep === 'RESET_PASSWORD') {
    // The owner forced a reset in Cognito.
    router.push({ name: 'forgot-password', query: { email: email.value.trim() } })
  } else {
    // e.g. MFA, which isn't built yet (spec Q1).
    error.value = "This account needs a sign-in step the admin site doesn't support yet."
  }
}

function handleError(e) {
  // Cognito keeps the first-login session for a few minutes only.
  if (step.value === 'newPassword' && e?.name === 'NotAuthorizedException') {
    step.value = 'signIn'
    error.value = 'That took too long. Please log in again with your temporary password.'
    return
  }
  error.value = authErrorMessage(e)
}
</script>

<template>
  <v-card :title="step === 'signIn' ? 'Log in' : 'Set a new password'">
    <v-card-text>
      <v-alert
        v-if="notice && step === 'signIn' && !error"
        type="info"
        variant="tonal"
        density="compact"
        class="mb-4"
        :text="notice"
      />
      <v-alert
        v-if="error"
        type="error"
        variant="tonal"
        density="compact"
        class="mb-4"
        :text="error"
        role="alert"
      />

      <v-form v-if="step === 'signIn'" ref="form" @submit.prevent="submitSignIn">
        <v-text-field
          v-model="email"
          label="Email"
          type="email"
          autocomplete="username"
          :rules="[required('Email')]"
          autofocus
        />
        <v-text-field
          v-model="password"
          label="Password"
          :type="showPassword ? 'text' : 'password'"
          :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
          autocomplete="current-password"
          :rules="[required('Password')]"
          @click:append-inner="showPassword = !showPassword"
        />
        <v-btn type="submit" color="primary" size="large" block :loading="submitting">
          Log in
        </v-btn>
        <div class="text-center mt-4">
          <v-btn
            variant="text"
            size="small"
            :to="{ name: 'forgot-password', query: email.trim() ? { email: email.trim() } : {} }"
          >
            Forgot password?
          </v-btn>
        </div>
      </v-form>

      <v-form v-else ref="form" @submit.prevent="submitNewPassword">
        <p class="text-body-2 text-medium-emphasis mb-4">
          You logged in with a temporary password. Choose your own password to continue.
        </p>
        <NewPasswordFields v-model="newPassword" />
        <v-btn type="submit" color="primary" size="large" block :loading="submitting">
          Set password and continue
        </v-btn>
      </v-form>
    </v-card-text>
  </v-card>
</template>
