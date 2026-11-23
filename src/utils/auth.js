// Small helpers for the login screens.

// Cognito's default password policy (spec AUTH-07). Cognito checks it again on
// its side; this list only gives the user feedback while they type.
export const PASSWORD_RULES = [
  { label: 'At least 8 characters', test: (v) => v.length >= 8 },
  { label: 'An uppercase letter', test: (v) => /[A-Z]/.test(v) },
  { label: 'A lowercase letter', test: (v) => /[a-z]/.test(v) },
  { label: 'A number', test: (v) => /[0-9]/.test(v) },
  { label: 'A symbol, such as ! @ # $', test: (v) => /[^A-Za-z0-9\s]/.test(v) },
]

export const meetsPasswordRules = (value) => PASSWORD_RULES.every((rule) => rule.test(value))

const TOO_MANY = 'Too many attempts. Try again later.'

// Turns Amplify/Cognito errors into the messages the spec asks for. Wrong
// password and unknown email get the same text (FE-AUTH-02).
export function authErrorMessage(error) {
  switch (error?.name) {
    case 'NotAuthorizedException':
      // Cognito reports lockout as NotAuthorized with this message.
      return /attempts exceeded/i.test(error.message) ? TOO_MANY : 'Incorrect email or password.'
    case 'UserNotFoundException':
      return 'Incorrect email or password.'
    case 'LimitExceededException':
    case 'TooManyRequestsException':
    case 'TooManyFailedAttemptsException':
      return TOO_MANY
    case 'InvalidPasswordException':
      return "The new password doesn't meet the rules below."
    case 'CodeMismatchException':
      return "That code isn't right. Check the email and try again."
    case 'ExpiredCodeException':
      return 'That code has expired. Request a new one.'
    default:
      console.error(error)
      return 'Something went wrong. Please try again.'
  }
}

// Only same-site paths are allowed after login (FE-AUTH-05), so a crafted link
// like /login?redirect=https://evil.example can't send the user elsewhere.
export function safeRedirect(value) {
  const isLocalPath =
    typeof value === 'string' &&
    value.startsWith('/') &&
    !value.startsWith('//') &&
    !value.startsWith('/\\')
  return isLocalPath ? value : '/'
}
