<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { TabsList, TabsRoot, TabsTrigger } from 'reka-ui'

import { useAuthStore } from '@/stores/auth'
import { uiInput } from '@/components/ui/input'
import { uiButton } from '@/components/ui/button'

onMounted(() => {
  const loader = document.getElementById('loader')
  if (loader) {
    loader.classList.add('fade-out')
    setTimeout(() => loader.remove(), 300)
  }
})

const router = useRouter()
const authStore = useAuthStore()

const mode = ref<'login' | 'register'>('login')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const name = ref('')

const isLogin = computed(() => mode.value === 'login')
const canSubmit = computed(() => {
  if (!email.value || !password.value) return false
  if (!isLogin.value && password.value !== confirmPassword.value) return false
  if (!isLogin.value && password.value.length < 6) return false
  return true
})

async function handleSubmit() {
  if (!canSubmit.value || authStore.loading.value) return

  let success: boolean
  if (isLogin.value) {
    success = await authStore.login(email.value, password.value)
  } else {
    success = await authStore.register(email.value, password.value, name.value || undefined)
    if (success) {
      mode.value = 'login'
      return
    }
  }

  if (success) {
    router.push('/documents')
  }
}

function switchMode(newMode: 'login' | 'register') {
  mode.value = newMode
  authStore.clearError()
}
</script>

<template>
  <div class="flex h-full w-full items-center justify-center bg-canvas">
    <div class="w-full max-w-sm space-y-6 p-6">
      <div class="flex flex-col items-center space-y-2">
        <img src="/favicon-32.png" class="size-12" alt="OpenPencil" />
        <h1 class="text-xl font-semibold text-surface">OpenPencil</h1>
      </div>

      <TabsRoot v-model="mode" class="w-full">
        <TabsList class="mb-4 flex w-full rounded-lg bg-panel p-1">
          <TabsTrigger
            value="login"
            class="flex-1 rounded-md px-3 py-1.5 text-sm text-muted transition-colors data-[state=active]:bg-hover data-[state=active]:text-surface"
          >
            登录
          </TabsTrigger>
          <TabsTrigger
            value="register"
            class="flex-1 rounded-md px-3 py-1.5 text-sm text-muted transition-colors data-[state=active]:bg-hover data-[state=active]:text-surface"
          >
            注册
          </TabsTrigger>
        </TabsList>
      </TabsRoot>

      <form class="space-y-4" @submit.prevent="handleSubmit">
        <div v-if="!isLogin" class="space-y-1">
          <label class="text-xs text-muted">昵称 (可选)</label>
          <input
            v-model="name"
            type="text"
            placeholder="输入昵称"
            :class="uiInput()"
          />
        </div>

        <div class="space-y-1">
          <label class="text-xs text-muted">邮箱</label>
          <input
            v-model="email"
            type="email"
            placeholder="输入邮箱地址"
            :class="uiInput()"
          />
        </div>

        <div class="space-y-1">
          <label class="text-xs text-muted">密码</label>
          <input
            v-model="password"
            type="password"
            placeholder="输入密码"
            :class="uiInput()"
          />
        </div>

        <div v-if="!isLogin" class="space-y-1">
          <label class="text-xs text-muted">确认密码</label>
          <input
            v-model="confirmPassword"
            type="password"
            placeholder="再次输入密码"
            :class="uiInput()"
          />
          <p
            v-if="confirmPassword && password !== confirmPassword"
            class="text-xs text-red-400"
          >
            密码不一致
          </p>
        </div>

        <div v-if="authStore.error.value" class="rounded bg-red-500/10 px-3 py-2 text-xs text-red-400">
          {{ authStore.error.value }}
        </div>

        <button
          type="submit"
          :disabled="!canSubmit || authStore.loading.value"
          :class="uiButton({ tone: 'accent', size: 'md', shape: 'rounded', class: 'w-full' })"
        >
          <icon-lucide-loader-2 v-if="authStore.loading.value" class="size-4 animate-spin" />
          <span v-else>{{ isLogin ? '登录' : '注册' }}</span>
        </button>
      </form>

      <p class="text-center text-xs text-muted">
        {{ isLogin ? '没有账号？' : '已有账号？' }}
        <button
          class="text-accent hover:underline"
          @click="switchMode(isLogin ? 'register' : 'login')"
        >
          {{ isLogin ? '立即注册' : '立即登录' }}
        </button>
      </p>
    </div>
  </div>
</template>