import { request } from './client'

/** @returns one page of tags: { items, total, limit, offset }. The API allows limit ≤ 100. */
export function listTags({ limit = 20, offset = 0, signal } = {}) {
  return request('GET', '/tags', { query: { limit, offset }, signal })
}
