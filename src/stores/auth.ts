import { ref, computed, readonly } from 'vue'
import { auth } from '@/services'
import type { __common__ } from '@/services/types'
import { getToken, setToken, removeToken as removeStoredToken } from '@/utils/auth'

type User = __common__.InternalhandlerUserResponse

const USER_KEY = 'openpencil_user'

const token = ref<string | null>(getToken() ?? null)
const user = ref<User | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

const isLoggedIn = computed(() => !!token.value && !!user.value)

function loadUserFromStorage() {
  const stored = localStorage.getItem(USER_KEY)
  if (stored) {
    try {
      user.value = JSON.parse(stored)
    } catch {
      user.value = null
    }
  }
}

loadUserFromStorage()

async function login(email: string, password: string) {
  loading.value = true
  error.value = null
  try {
    const [err, data] = await auth.postLogin({ email, password })
    if (err) {
      error.value = err.message || '登录失败'
      return false
    }
    if (data?.token) {
      token.value = data.token
      user.value = data.user ?? null
      setToken(data.token)
      if (data.user) {
        localStorage.setItem(USER_KEY, JSON.stringify(data.user))
      }
      return true
    }
    error.value = '登录失败'
    return false
  } catch (e: any) {
    error.value = e.message || '登录失败'
    return false
  } finally {
    loading.value = false
  }
}

async function register(email: string, password: string, name?: string) {
  loading.value = true
  error.value = null
  try {
    const [err, data] = await auth.postRegister({ email, password, name })
    if (err) {
      error.value = err.message || '注册失败'
      return false
    }
    if (data) {
      user.value = data
      return true
    }
    error.value = '注册失败'
    return false
  } catch (e: any) {
    error.value = e.message || '注册失败'
    return false
  } finally {
    loading.value = false
  }
}

function logout() {
  token.value = null
  user.value = null
  removeStoredToken()
  localStorage.removeItem(USER_KEY)
}

function clearError() {
  error.value = null
}

export function useAuthStore() {
  return {
    token: readonly(token),
    user: readonly(user),
    loading: readonly(loading),
    error: readonly(error),
    isLoggedIn,
    login,
    register,
    logout,
    clearError
  }
}