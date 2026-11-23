import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import {
  confirmResetPassword,
  confirmSignIn,
  fetchAuthSession,
  resetPassword,
  signIn as amplifySignIn,
  signOut as amplifySignOut,
} from 'aws-amplify/auth'

// The Cognito group the API's write routes require (blog-engine-api app/auth.py).
const ADMIN_GROUP = 'admins'

// Who is logged in, and the actions that change it. Amplify keeps the tokens
// (in localStorage, so a reload keeps the session: spec FE-SES-02); this store
// keeps what the UI needs to know about the user.
export const useAuthStore = defineStore('auth', () => {
  // { sub, email, role }. role is 'admin', or null for "no access" (ROLE-03).
  const user = ref(null)

  const isAuthenticated = computed(() => user.value !== null)
  const role = computed(() => user.value?.role ?? null)
  const isAdmin = computed(() => role.value === 'admin')

  // init() runs once, from the router guard before the first page renders.
  let loading = null
  function init() {
    loading ??= loadUser()
    return loading
  }

  // forceRefresh gets a new token from Cognito, e.g. to pick up a group change.
  async function loadUser({ forceRefresh = false } = {}) {
    const { tokens } = await fetchAuthSession({ forceRefresh }).catch(() => ({}))
    if (!tokens?.accessToken) {
      user.value = null
      return
    }

    // Read straight from the access token Cognito signed. This only decides
    // what the UI shows: the API checks the same claim on every write, so
    // editing it in the browser gains nothing.
    const { sub, 'cognito:groups': groups = [] } = tokens.accessToken.payload
    user.value = {
      sub,
      email: tokens.idToken?.payload.email ?? '',
      role: groups.includes(ADMIN_GROUP) ? 'admin' : null,
    }
  }

  async function reload(options) {
    loading = loadUser(options)
    await loading
  }

  // Returns Cognito's next step: 'DONE', 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED', ...
  async function signIn(email, password) {
    const { nextStep } = await amplifySignIn({ username: email, password })
    return finishSignIn(nextStep)
  }

  // First login with a temporary password (spec AUTH-08, FE-AUTH-04).
  async function setNewPassword(newPassword) {
    const { nextStep } = await confirmSignIn({ challengeResponse: newPassword })
    return finishSignIn(nextStep)
  }

  async function finishSignIn(nextStep) {
    if (nextStep.signInStep === 'DONE') await reload()
    return nextStep.signInStep
  }

  async function signOut() {
    try {
      await amplifySignOut()
    } finally {
      user.value = null
      loading = null
    }
  }

  // Forgot password (spec FE-PWD-01..03).
  function requestPasswordReset(email) {
    return resetPassword({ username: email })
  }

  function confirmPasswordReset(email, code, newPassword) {
    return confirmResetPassword({ username: email, confirmationCode: code, newPassword })
  }

  return {
    user,
    isAuthenticated,
    role,
    isAdmin,
    init,
    reload,
    signIn,
    setNewPassword,
    signOut,
    requestPasswordReset,
    confirmPasswordReset,
  }
})
