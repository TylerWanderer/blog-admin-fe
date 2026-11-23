import { ref } from 'vue'
import { defineStore } from 'pinia'

// A promise-based confirm dialog, so a page can write:
//
//   if (await confirm.ask({ title: 'Delete tag?', message: '...', confirmText: 'Delete' })) { ... }
//
// The single <ConfirmDialog> in App.vue renders whatever is in `request`.
export const useConfirmStore = defineStore('confirm', () => {
  const request = ref(null)
  let resolveRequest = null

  function ask({ title, message, confirmText = 'Confirm', danger = true }) {
    // A new question cancels any unanswered one.
    resolveRequest?.(false)
    request.value = { title, message, confirmText, danger }
    return new Promise((resolve) => {
      resolveRequest = resolve
    })
  }

  function answer(confirmed) {
    resolveRequest?.(confirmed)
    resolveRequest = null
    request.value = null
  }

  return { request, ask, answer }
})
