<script setup>
import { useConfirmStore } from '@/stores/confirm'
import { useNotificationsStore } from '@/stores/notifications'

const confirm = useConfirmStore()
const notify = useNotificationsStore()

// Temporary: exercises the shared dialog and snackbar until real pages use them.
async function tryConfirm() {
  const ok = await confirm.ask({
    title: 'Delete example?',
    message: 'This is only a demo of the shared confirm dialog.',
    confirmText: 'Delete',
  })
  if (ok) notify.success('Confirmed')
  else notify.info('Cancelled')
}
</script>

<template>
  <h1 class="text-h5 mb-4">Welcome</h1>
  <v-card title="Shell check" text="Try the shared confirm dialog and notifications." class="mb-4">
    <v-card-actions>
      <v-btn color="primary" variant="tonal" @click="tryConfirm">Open confirm dialog</v-btn>
      <v-btn color="error" variant="tonal" @click="notify.error('Example error message')">
        Show error
      </v-btn>
    </v-card-actions>
  </v-card>
</template>
