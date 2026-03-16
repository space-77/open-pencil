import { computed, ref } from 'vue'

import { auth } from '@/services'
import { getToken, setToken as storeToken, removeToken } from '@/utils/auth'

export interface User {
  id: string
  email: string
  name: string
  avatar_url?: string
}

const user = ref<User | null>(null)

export function useAuth() {
  const tokenRef = computed(() => getToken() ?? null)
  const isAuthenticated = computed(() => !!tokenRef.value)

  async function login(email: string, password: string): Promise<boolean> {
    const [err, data] = await auth.postLogin({ email, password })

    if (err || !data?.token) {
      return false
    }

    storeToken(data.token)
    user.value = data.user
      ? {
          id: data.user.id ?? '',
          email: data.user.email ?? '',
          name: data.user.name ?? '',
          avatar_url: data.user.avatar_url
        }
      : null

    return true
  }

  async function register(
    email: string,
    password: string,
    name?: string
  ): Promise<boolean> {
    const [err] = await auth.postRegister({ email, password, name })

    if (err) {
      return false
    }

    return login(email, password)
  }

  function logout() {
    removeToken()
    user.value = null
  }

  function setUser(u: User | null) {
    user.value = u
  }

  return {
    token: tokenRef,
    user,
    isAuthenticated,
    login,
    register,
    logout,
    getToken,
    setUser
  }
}