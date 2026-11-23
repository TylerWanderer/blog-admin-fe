<template>
  <v-empty-state
    icon="mdi-file-document-edit-outline"
    title="The post list is coming soon"
    text="In the meantime, you can write a new post."
  >
    <template #actions>
      <v-btn color="primary" variant="flat" prepend-icon="mdi-plus" :to="{ name: 'post-create' }">
        New post
      </v-btn>
    </template>
  </v-empty-state>
</template>
