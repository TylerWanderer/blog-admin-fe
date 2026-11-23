import { ref } from 'vue'
import { defineStore } from 'pinia'

// App-wide feedback messages ("Tag saved", "Could not delete post").
// Any component or store calls notify.success(...) / notify.error(...);
// the single <v-snackbar-queue> in App.vue shows them one after another.
export const useNotificationsStore = defineStore('notifications', () => {
  const queue = ref([])

  function push(text, color, timeout) {
    queue.value.push({ text, color, timeout })
  }

  return {
    queue,
    success: (text) => push(text, 'success', 4000),
    info: (text) => push(text, 'info', 4000),
    // Errors stay longer, so the user has time to read them.
    error: (text) => push(text, 'error', 8000),
  }
})
