<script setup>
import { computed } from 'vue'
import { useConfirmStore } from '@/stores/confirm'

const confirm = useConfirmStore()

// Clicking outside or pressing Esc closes the dialog, which counts as "Cancel".
const open = computed({
  get: () => confirm.request !== null,
  set: (value) => {
    if (!value) confirm.answer(false)
  },
})
</script>

<template>
  <v-dialog v-model="open" max-width="420">
    <v-card v-if="confirm.request" :title="confirm.request.title" :text="confirm.request.message">
      <v-card-actions>
        <v-spacer />
        <v-btn @click="confirm.answer(false)">Cancel</v-btn>
        <v-btn
          :color="confirm.request.danger ? 'error' : 'primary'"
          variant="flat"
          @click="confirm.answer(true)"
        >
          {{ confirm.request.confirmText }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
