import { describe, expect, it } from 'vitest'

import { slugify } from '../slugify'

// The API's slug pattern; every result must match it or the API returns 422.
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

describe('slugify', () => {
  it.each([
    ['Learning AWS ECS', 'learning-aws-ecs'],
    ['Học AWS: Lambda & S3', 'hoc-aws-lambda-s3'],
    ['Đà Lạt trip', 'da-lat-trip'],
    ['  --Trim me--  ', 'trim-me'],
    ['C++ & C#', 'c-c'],
  ])('%s -> %s', (title, slug) => {
    expect(slugify(title)).toBe(slug)
    expect(slug).toMatch(SLUG_PATTERN)
  })

  it('returns an empty string when nothing usable is left', () => {
    expect(slugify('!!!')).toBe('')
  })

  it('cuts to maxLength without leaving a trailing hyphen', () => {
    const slug = slugify('abc def', 4) // "abc-" before the trim
    expect(slug).toBe('abc')
    expect(slug).toMatch(SLUG_PATTERN)
  })
})
