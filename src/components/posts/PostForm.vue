<script setup>
// The post editor's fields and client-side validation. It doesn't call the
// API to save: the page that uses it decides what "submit" means (create now,
// update later for an edit page), so both pages can share this form.
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import { POST_LIMITS, PostStatus } from '@/api/posts'
import { listTags } from '@/api/tags'
import { slugify } from '@/utils/slugify'

// The post being edited: { title, slug, excerpt, content, tag_ids }. Owned by the parent page.
const post = defineModel({ type: Object, required: true })
// Server-side errors by field, e.g. { slug: 'Slug already exists' }.
const errors = defineModel('errors', { type: Object, default: () => ({}) })

defineProps({
  // The status currently being saved ('draft' | 'published'), or null.
  saving: { type: String, default: null },
})
const emit = defineEmits(['submit', 'cancel'])

// --- Slug follows the title until the user edits it themselves ---
const slugEdited = ref(Boolean(post.value.slug))
watch(
  () => post.value.title,
  (title) => {
    if (!slugEdited.value) post.value.slug = slugify(title, POST_LIMITS.slugMax)
  },
)
function onSlugInput(value) {
  // Clearing the slug hands control back to the title.
  slugEdited.value = value !== ''
  clearError('slug')
}

function clearError(field) {
  if (errors.value[field]) {
    const { [field]: _removed, ...rest } = errors.value
    errors.value = rest
  }
}

// --- Validation rules: each returns true or an error message ---
const contentBytes = computed(() => new TextEncoder().encode(post.value.content).length)

const rules = {
  title: [
    (v) => v.trim().length > 0 || 'Title is required',
    (v) => v.trim().length <= POST_LIMITS.titleMax || `At most ${POST_LIMITS.titleMax} characters`,
  ],
  slug: [
    (v) => v.length > 0 || 'Slug is required',
    (v) => v.length <= POST_LIMITS.slugMax || `At most ${POST_LIMITS.slugMax} characters`,
    (v) =>
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v) ||
      'Use lowercase letters and numbers, separated by single hyphens',
  ],
  excerpt: [
    (v) =>
      v.trim().length <= POST_LIMITS.excerptMax || `At most ${POST_LIMITS.excerptMax} characters`,
  ],
  content: [
    (v) => v.trim().length > 0 || 'Content is required',
    () => contentBytes.value <= POST_LIMITS.contentMaxBytes || 'Content is too long',
  ],
  tags: [(v) => v.length <= POST_LIMITS.tagsMax || `At most ${POST_LIMITS.tagsMax} tags`],
}

// --- Tags for the picker ---
const tags = ref([])
const tagsLoading = ref(false)
const tagsError = ref('')
const tagsRequest = new AbortController()

onMounted(async () => {
  tagsLoading.value = true
  try {
    // 100 is the API's page size limit. Enough for a personal blog; switch to
    // server-side search in the picker if the tag list ever outgrows it.
    const page = await listTags({ limit: 100, signal: tagsRequest.signal })
    tags.value = page.items
  } catch (error) {
    if (error.name !== 'AbortError') tagsError.value = 'Could not load tags'
  } finally {
    tagsLoading.value = false
  }
})
// Don't update state after the user has left the page.
onBeforeUnmount(() => tagsRequest.abort())

// --- Submit ---
const form = ref(null)

async function submit(status) {
  const { valid } = await form.value.validate()
  if (valid) emit('submit', status)
}
</script>

<template>
  <v-form ref="form" @submit.prevent="submit(PostStatus.DRAFT)">
    <v-row>
      <!-- Main column: what the reader sees -->
      <v-col cols="12" md="8">
        <v-card>
          <v-card-text class="d-flex flex-column ga-2">
            <v-text-field
              v-model="post.title"
              label="Title"
              :rules="rules.title"
              :error-messages="errors.title"
              :counter="POST_LIMITS.titleMax"
              autofocus
              @update:model-value="clearError('title')"
            />
            <v-text-field
              v-model="post.slug"
              label="Slug"
              prefix="/posts/"
              :rules="rules.slug"
              :error-messages="errors.slug"
              :hint="
                slugEdited
                  ? 'Edited by hand. Clear it to follow the title again.'
                  : 'Generated from the title'
              "
              persistent-hint
              @update:model-value="onSlugInput"
            />
            <v-textarea
              v-model="post.content"
              label="Content"
              class="content-field"
              :rules="rules.content"
              :error-messages="errors.content"
              :hint="`${contentBytes.toLocaleString()} / ${POST_LIMITS.contentMaxBytes.toLocaleString()} bytes`"
              persistent-hint
              rows="18"
              auto-grow
              @update:model-value="clearError('content')"
            />
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Side column: publishing and metadata -->
      <v-col cols="12" md="4">
        <v-card title="Publish" class="mb-4">
          <v-card-text class="text-medium-emphasis">
            Save a draft to keep working on it, or publish to make it public.
          </v-card-text>
          <v-card-actions class="flex-wrap">
            <v-btn :disabled="!!saving" @click="emit('cancel')">Cancel</v-btn>
            <v-spacer />
            <v-btn
              type="submit"
              variant="tonal"
              :loading="saving === PostStatus.DRAFT"
              :disabled="!!saving"
            >
              Save draft
            </v-btn>
            <v-btn
              color="primary"
              variant="flat"
              :loading="saving === PostStatus.PUBLISHED"
              :disabled="!!saving"
              @click="submit(PostStatus.PUBLISHED)"
            >
              Publish
            </v-btn>
          </v-card-actions>
        </v-card>

        <v-card title="Details">
          <v-card-text class="d-flex flex-column ga-2">
            <v-autocomplete
              v-model="post.tag_ids"
              :items="tags"
              item-title="name"
              item-value="id"
              label="Tags"
              :rules="rules.tags"
              :error-messages="errors.tag_ids || tagsError"
              :loading="tagsLoading"
              multiple
              chips
              closable-chips
              clear-on-select
              @update:model-value="clearError('tag_ids')"
            />
            <v-textarea
              v-model="post.excerpt"
              label="Excerpt (optional)"
              hint="A short summary for post lists and search results"
              :rules="rules.excerpt"
              :error-messages="errors.excerpt"
              :counter="POST_LIMITS.excerptMax"
              rows="3"
              auto-grow
              @update:model-value="clearError('excerpt')"
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-form>
</template>

<style scoped>
.content-field :deep(textarea) {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  line-height: 1.6;
}
</style>
