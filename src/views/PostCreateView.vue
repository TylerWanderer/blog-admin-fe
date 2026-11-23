<script setup>
// The "New post" page: owns the form data, sends it to the API, and turns
// API errors into messages next to the right fields.
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { onBeforeRouteLeave, useRouter } from 'vue-router'

import { ApiError } from '@/api/client'
import { PostStatus, createPost } from '@/api/posts'
import PostForm from '@/components/posts/PostForm.vue'
import { useConfirmStore } from '@/stores/confirm'
import { useNotificationsStore } from '@/stores/notifications'

const router = useRouter()
const confirm = useConfirmStore()
const notify = useNotificationsStore()

const emptyPost = () => ({ title: '', slug: '', excerpt: '', content: '', tag_ids: [] })

const post = ref(emptyPost())
const errors = ref({})
const saving = ref(null)
let saved = false

const isDirty = computed(() => JSON.stringify(post.value) !== JSON.stringify(emptyPost()))

async function save(status) {
  saving.value = status
  errors.value = {}
  try {
    await createPost({
      ...post.value,
      title: post.value.title.trim(),
      // Send null rather than an empty string for "no excerpt".
      excerpt: post.value.excerpt.trim() || null,
      status,
    })
    saved = true
    notify.success(status === PostStatus.PUBLISHED ? 'Post published' : 'Draft saved')
    // Go to the edit page here once it exists.
    router.push({ name: 'posts' })
  } catch (error) {
    showSaveError(error)
  } finally {
    saving.value = null
  }
}

function showSaveError(error) {
  if (!(error instanceof ApiError)) {
    notify.error('Something went wrong while saving the post.')
    throw error // a bug, not an API error: let it reach the console
  }
  if (error.status === 409) {
    errors.value = { slug: 'Another post already uses this slug' }
  } else if (error.status === 400) {
    // The only 400 on this endpoint: a selected tag was deleted meanwhile.
    errors.value = { tag_ids: error.message }
  } else if (error.status === 422 && Object.keys(error.fieldErrors).length) {
    errors.value = error.fieldErrors
  } else {
    notify.error(error.message)
    return
  }
  notify.error('Fix the highlighted fields and try again.')
}

// --- Don't lose unsaved work ---
onBeforeRouteLeave(() => {
  if (saved || !isDirty.value) return true
  return confirm.ask({
    title: 'Discard this post?',
    message: "You have changes that haven't been saved.",
    confirmText: 'Discard',
  })
})

// Closing the tab or reloading skips the router, so the browser asks instead.
function onBeforeUnload(event) {
  if (!saved && isDirty.value) event.preventDefault()
}
onMounted(() => window.addEventListener('beforeunload', onBeforeUnload))
onBeforeUnmount(() => window.removeEventListener('beforeunload', onBeforeUnload))
</script>

<template>
  <PostForm
    v-model="post"
    v-model:errors="errors"
    :saving="saving"
    @submit="save"
    @cancel="router.push({ name: 'posts' })"
  />
</template>
