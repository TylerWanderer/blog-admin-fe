// The one place that talks HTTP. Feature modules (posts.js, tags.js) build on
// `request`, so the base URL, the auth header and error handling live here only.
import { fetchAuthSession } from 'aws-amplify/auth'

// '/api' on the site's own origin: the Vite dev server (see vite.config.js) and
// CloudFront in production both forward /api/* to the API, which serves its
// endpoints under /api. So the browser never makes a cross-origin call.
// VITE_API_BASE_URL can point a build straight at the API instead, e.g.
// https://<service>.ecs.ap-southeast-1.on.aws/api (the API then needs CORS).
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'

// What the user sees for auth errors (spec FE-SES-05, FE-SES-06).
const MESSAGES = {
  401: 'Your session has expired. Please log in again.',
  403: "You don't have permission to do that.",
}

export class ApiError extends Error {
  constructor(status, detail, message) {
    super(message ?? (typeof detail === 'string' ? detail : `Request failed (${status})`))
    this.name = 'ApiError'
    // 0 means the request never got a response (network down, API not running).
    this.status = status
    // FastAPI's error body: a string, or a list of validation errors for 422.
    this.detail = detail
  }

  /**
   * FastAPI's 422 errors as { fieldName: message }, for showing next to inputs.
   * Each error has a `loc` like ['body', 'slug'] or ['body', 'tag_ids', 0].
   */
  get fieldErrors() {
    if (!Array.isArray(this.detail)) return {}
    const errors = {}
    for (const { loc = [], msg } of this.detail) {
      const field = loc[0] === 'body' ? loc[1] : undefined
      if (field && !errors[field]) errors[field] = msg
    }
    return errors
  }
}

// Set by main.js: what to do when the API rejects our token. Kept as a hook so
// this module doesn't import the router or stores (that would be a cycle).
let onUnauthorized = async () => {}
export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler
}

async function authHeader() {
  try {
    // Returns the cached tokens, refreshing the access token first if it's
    // about to expire (spec FE-SES-03). No tokens = not logged in.
    const { tokens } = await fetchAuthSession()
    return tokens?.accessToken ? { Authorization: `Bearer ${tokens.accessToken}` } : {}
  } catch {
    return {}
  }
}

export async function request(method, path, { body, query, signal } = {}) {
  const url = new URL(BASE_URL + path, window.location.origin)
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null) url.searchParams.set(key, value)
  }

  const headers = await authHeader()
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  let response
  try {
    response = await fetch(url, {
      method,
      signal,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch (error) {
    if (error.name === 'AbortError') throw error
    throw new ApiError(0, 'Could not reach the server. Check your connection and try again.')
  }

  if (response.status === 204) return null

  const data = await response.json().catch(() => null)
  if (!response.ok) {
    if (response.status === 401) await onUnauthorized()
    throw new ApiError(
      response.status,
      data?.detail ?? response.statusText,
      MESSAGES[response.status],
    )
  }
  return data
}
