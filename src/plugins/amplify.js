import { Amplify } from 'aws-amplify'

// Points Amplify Auth at our Cognito user pool. Both IDs are public by design:
// they end up in the browser bundle anyway, and the API's token checks are
// what protect the data. Amplify's default sign-in flow is SRP (spec FE-AUTH-01),
// so the password itself is never sent.
export function configureAmplify() {
  const userPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID
  const userPoolClientId = import.meta.env.VITE_COGNITO_USER_POOL_CLIENT_ID

  // Fail at startup with a clear message rather than on the first login attempt.
  if (!userPoolId || !userPoolClientId) {
    throw new Error(
      'Missing VITE_COGNITO_USER_POOL_ID or VITE_COGNITO_USER_POOL_CLIENT_ID. See .env.example.',
    )
  }

  Amplify.configure({
    Auth: {
      Cognito: { userPoolId, userPoolClientId, loginWith: { email: true } },
    },
  })
}
