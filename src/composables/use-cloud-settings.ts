import { ref, watch } from 'vue'

import { settings } from '@/services'

const SETTING_KEYS = [
  'ai-provider',
  'ai-model',
  'ai-key:openrouter',
  'ai-key:anthropic',
  'ai-key:openai',
  'ai-key:google',
  'ai-key:openai-compatible',
  'ai-key:anthropic-compatible',
  'ai-base-url',
  'ai-custom-model',
  'ai-api-type',
  'ai-max-output-tokens',
  'collab-name'
] as const

type SettingKey = (typeof SETTING_KEYS)[number]

const settingsCache = new Map<SettingKey, string>()
let initialized = false
const pendingWrites = new Map<SettingKey, string>()
let writeTimer: ReturnType<typeof setTimeout> | null = null

async function initSettings(): Promise<void> {
  if (initialized) return

  const [err, result] = await settings.getSettings()

  if (err || !result?.settings) {
    loadFromLocalStorage()
    return
  }

  for (const item of result.settings) {
    if (item.key && item.value !== undefined) {
      settingsCache.set(item.key as SettingKey, item.value)
    }
  }

  initialized = true
}

function loadFromLocalStorage(): void {
  for (const key of SETTING_KEYS) {
    const value = localStorage.getItem(`open-pencil:${key}`)
    if (value !== null) {
      settingsCache.set(key, value)
    }
  }
  initialized = true
}

export function useCloudSetting<T extends string = string>(
  key: SettingKey,
  defaultValue: T = '' as T
) {
  const value = ref<T>(defaultValue)

  initSettings().then(() => {
    value.value = (settingsCache.get(key) ?? defaultValue) as T
  })

  watch(value, (newValue) => {
    settingsCache.set(key, newValue)
    pendingWrites.set(key, newValue)

    if (writeTimer) clearTimeout(writeTimer)
    writeTimer = setTimeout(() => {
      void flushPendingWrites()
    }, 1000)

    localStorage.setItem(`open-pencil:${key}`, newValue)
  })

  return value
}

async function flushPendingWrites(): Promise<void> {
  if (pendingWrites.size === 0) return

  const settingsToWrite = Array.from(pendingWrites.entries()).map(
    ([key, val]) => ({
      key,
      value: val
    })
  )

  pendingWrites.clear()

  const [err] = await settings.putSettingsBatch(settingsToWrite)

  if (err) {
    console.error('保存设置失败:', err)
  }
}

export async function getCloudSettings(
  keys: SettingKey[]
): Promise<Record<string, string>> {
  await initSettings()

  const result: Record<string, string> = {}
  for (const key of keys) {
    result[key] = settingsCache.get(key) ?? ''
  }
  return result
}

export async function setCloudSettings(
  items: Array<{ key: SettingKey; value: string }>
): Promise<boolean> {
  const [err] = await settings.putSettingsBatch(items)

  if (err) {
    console.error('批量设置失败:', err)
    return false
  }

  for (const item of items) {
    settingsCache.set(item.key, item.value)
    localStorage.setItem(`open-pencil:${item.key}`, item.value)
  }

  return true
}

export type { SettingKey }
export { SETTING_KEYS }