<template>
  <v-empty-state
    icon="mdi-map-marker-question-outline"
    headline="404"
    title="Page not found"
    text="The page you're looking for doesn't exist."
  >
    <template #actions>
      <v-btn color="primary" variant="flat" :to="{ name: 'dashboard' }">Go to dashboard</v-btn>
    </template>
  </v-empty-state>
</template>
