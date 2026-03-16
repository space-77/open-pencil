import { createRouter, createWebHistory } from 'vue-router'

import EditorView from './views/EditorView.vue'
import LoginView from './views/LoginView.vue'
import DocumentsView from './views/DocumentsView.vue'
import { useAuthStore } from './stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', component: LoginView, meta: { public: true } },
    { path: '/documents', component: DocumentsView },
    { path: '/:docId?', component: EditorView },
    { path: '/demo', component: EditorView, meta: { demo: true, public: true } },
    { path: '/share/:roomId', component: EditorView, meta: { public: true } }
  ]
})

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()

  if (to.meta.public) {
    next()
    return
  }

  if (!authStore.isLoggedIn.value) {
    next('/login')
    return
  }

  next()
})

export default router