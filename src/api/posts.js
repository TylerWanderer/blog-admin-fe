import { request } from './client'

// Mirrors the API's limits (blog-engine-api/app/schemas/post.py) so the form
// can catch mistakes before a round trip. The API stays the source of truth.
export const POST_LIMITS = {
  titleMax: 200,
  slugMax: 200,
  excerptMax: 500,
  contentMaxBytes: 65_535,
  tagsMax: 20,
}

export const PostStatus = Object.freeze({
  DRAFT: 'draft',
  PUBLISHED: 'published',
})

/** @returns the created post (PostRead). */
export function createPost(post) {
  return request('POST', '/posts', { body: post })
}
