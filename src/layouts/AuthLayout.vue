<!-- A centred card with no sidebar, for pages shown before (or instead of) the admin shell. -->
<template>
  <v-main>
    <v-container class="py-12" max-width="440">
      <div class="d-flex align-center justify-center ga-2 mb-6 text-h6">
        <v-icon icon="mdi-feather" color="primary" />
        Blog Engine Admin
      </div>
      <RouterView />
    </v-container>
  </v-main>
</template>
