import { afterEach, describe, expect, it, vi } from 'vitest'

import { authErrorMessage, meetsPasswordRules, safeRedirect } from '../auth'

describe('safeRedirect (FE-AUTH-05)', () => {
  it.each(['/', '/posts', '/posts/new?draft=1', '/tags#top'])('keeps the local path %s', (path) => {
    expect(safeRedirect(path)).toBe(path)
  })

  it.each([
    ['another site', 'https://evil.example'],
    ['a protocol-relative URL', '//evil.example'],
    ['a backslash trick', '/\\evil.example'],
    ['a relative path', 'posts'],
    ['a javascript: URL', 'javascript:alert(1)'],
    ['an empty value', ''],
    ['a repeated query param', ['/a', '/b']],
    ['no value', undefined],
  ])('falls back to / for %s', (_label, value) => {
    expect(safeRedirect(value)).toBe('/')
  })
})

describe('meetsPasswordRules (AUTH-07)', () => {
  it('accepts a password with every required kind of character', () => {
    expect(meetsPasswordRules('Str0ng!pw')).toBe(true)
  })

  it.each([
    ['too short', 'Sh0rt!'],
    ['no uppercase', 'weak0ne!pw'],
    ['no lowercase', 'WEAK0NE!PW'],
    ['no number', 'NoNumber!pw'],
    ['no symbol', 'NoSymb0lpw'],
  ])('rejects a password with %s', (_label, password) => {
    expect(meetsPasswordRules(password)).toBe(false)
  })
})

describe('authErrorMessage (FE-AUTH-02, FE-AUTH-03)', () => {
  afterEach(() => vi.restoreAllMocks())

  const error = (name, message = '') => Object.assign(new Error(message), { name })

  it('gives wrong passwords and unknown emails the same message', () => {
    const wrongPassword = authErrorMessage(
      error('NotAuthorizedException', 'Incorrect username or password.'),
    )
    const unknownEmail = authErrorMessage(error('UserNotFoundException'))
    expect(wrongPassword).toBe('Incorrect email or password.')
    expect(unknownEmail).toBe(wrongPassword)
  })

  it('reports a lockout as too many attempts', () => {
    const lockout = error('NotAuthorizedException', 'Password attempts exceeded')
    expect(authErrorMessage(lockout)).toBe('Too many attempts. Try again later.')
  })

  it('falls back to a generic message for unknown errors', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(authErrorMessage(error('SomethingNew'))).toBe('Something went wrong. Please try again.')
  })
})
