<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuTrigger
} from 'reka-ui'

import { useAuthStore } from '@/stores/auth'
import { documents } from '@/services'
import type { __common__ } from '@/services/types'
import { uiInput } from '@/components/ui/input'
import { uiButton } from '@/components/ui/button'
import { panelSurface } from '@/components/ui/surface'
import { menuContent, menuItem, menuSeparator } from '@/components/ui/menu'
import { toast } from '@/composables/use-toast'

type Document = __common__.InternalhandlerDocumentResponse

const router = useRouter()
const authStore = useAuthStore()

onMounted(() => {
  const loader = document.getElementById('loader')
  if (loader) {
    loader.classList.add('fade-out')
    setTimeout(() => loader.remove(), 300)
  }
  fetchDocuments()
})

const docs = ref<Document[]>([])
const loading = ref(true)
const searchQuery = ref('')
const creating = ref(false)
const sortBy = ref<'updated_at' | 'created_at' | 'name'>('updated_at')
const sortOrder = ref<'asc' | 'desc'>('desc')

const filteredDocs = computed(() => {
  let result = [...docs.value]
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter((d) => d.name?.toLowerCase().includes(query))
  }
  result.sort((a, b) => {
    const aVal = a[sortBy.value] || ''
    const bVal = b[sortBy.value] || ''
    const cmp = typeof aVal === 'string' && typeof bVal === 'string' ? aVal.localeCompare(bVal) : 0
    return sortOrder.value === 'asc' ? cmp : -cmp
  })
  return result
})

async function fetchDocuments() {
  loading.value = true
  try {
    const [err, data] = await documents.getDocuments({ sort_by: sortBy.value, sort_order: sortOrder.value })
    if (err) {
      toast.error('加载文档失败')
      return
    }
    docs.value = data?.items ?? []
  } catch {
    toast.error('加载文档失败')
  } finally {
    loading.value = false
  }
}

async function createDocument() {
  creating.value = true
  try {
    const [err, data] = await documents.postDocuments({ name: '未命名设计' })
    if (err) {
      toast.error('创建文档失败')
      return
    }
    if (data?.id) {
      router.push(`/?doc=${data.id}`)
    }
  } catch {
    toast.error('创建文档失败')
  } finally {
    creating.value = false
  }
}

async function deleteDocument(id: string) {
  try {
    const [err] = await documents.deleteDocumentsById(id)
    if (err) {
      toast.error('删除文档失败')
      return
    }
    docs.value = docs.value.filter((d) => d.id !== id)
    toast.success('文档已删除')
  } catch {
    toast.error('删除文档失败')
  }
}

function openDocument(id: string) {
  router.push(`/?doc=${id}`)
}

function formatDate(dateStr?: string) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  if (days < 7) return `${days} 天前`
  return date.toLocaleDateString('zh-CN')
}

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="flex h-full flex-col bg-canvas">
    <header class="shrink-0 border-b border-border bg-panel">
      <div class="flex h-12 items-center justify-between px-4">
        <div class="flex items-center gap-3">
          <img src="/favicon-32.png" class="size-6" alt="OpenPencil" />
          <span class="text-sm font-medium text-surface">OpenPencil</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs text-muted">{{ authStore.user.value?.email }}</span>
          <button :class="uiButton({ tone: 'ghost', size: 'sm' })" @click="handleLogout">
            <icon-lucide-log-out class="size-4" />
          </button>
        </div>
      </div>
    </header>

    <main class="flex-1 overflow-auto p-6">
      <div class="mx-auto max-w-6xl">
        <div class="mb-6 flex items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="relative">
              <icon-lucide-search class="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="搜索文档..."
                :class="uiInput({ class: 'pl-8 w-64' })"
              />
            </div>
            <DropdownMenuRoot>
              <DropdownMenuTrigger :class="uiButton({ tone: 'ghost', size: 'sm' })">
                <icon-lucide-arrow-up-down class="size-4" />
                <span class="ml-1">{{ sortBy === 'updated_at' ? '最近修改' : sortBy === 'created_at' ? '创建时间' : '名称' }}</span>
              </DropdownMenuTrigger>
              <DropdownMenuPortal>
                <DropdownMenuContent :class="menuContent()" align="start">
                  <DropdownMenuItem :class="menuItem()" @select="sortBy = 'updated_at'">
                    最近修改
                    <icon-lucide-check v-if="sortBy === 'updated_at'" class="ml-auto size-4" />
                  </DropdownMenuItem>
                  <DropdownMenuItem :class="menuItem()" @select="sortBy = 'created_at'">
                    创建时间
                    <icon-lucide-check v-if="sortBy === 'created_at'" class="ml-auto size-4" />
                  </DropdownMenuItem>
                  <DropdownMenuItem :class="menuItem()" @select="sortBy = 'name'">
                    名称
                    <icon-lucide-check v-if="sortBy === 'name'" class="ml-auto size-4" />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenuPortal>
            </DropdownMenuRoot>
          </div>
          <button
            :class="uiButton({ tone: 'accent', size: 'md' })"
            :disabled="creating"
            @click="createDocument"
          >
            <icon-lucide-plus class="size-4" />
            <span class="ml-1">新建设计</span>
          </button>
        </div>

        <div v-if="loading" class="flex items-center justify-center py-12">
          <icon-lucide-loader-2 class="size-6 animate-spin text-muted" />
        </div>

        <div v-else-if="filteredDocs.length === 0" class="flex flex-col items-center justify-center py-12 text-muted">
          <icon-lucide-file-x class="mb-2 size-12" />
          <p class="text-sm">{{ searchQuery ? '未找到匹配的文档' : '暂无文档' }}</p>
          <button
            v-if="!searchQuery"
            :class="uiButton({ tone: 'accent', size: 'sm', class: 'mt-4' })"
            @click="createDocument"
          >
            创建第一个设计
          </button>
        </div>

        <div v-else class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          <div
            v-for="doc in filteredDocs"
            :key="doc.id"
            :class="panelSurface({ elevation: 'md', padding: 'none', class: 'group cursor-pointer transition-shadow hover:shadow-lg' })"
            @click="openDocument(doc.id!)"
          >
            <div class="aspect-[4/3] bg-input/50">
              <div class="flex h-full items-center justify-center">
                <icon-lucide-file class="size-10 text-muted/50" />
              </div>
            </div>
            <div class="p-3">
              <div class="flex items-start justify-between gap-2">
                <h3 class="truncate text-sm font-medium text-surface">{{ doc.name || '未命名' }}</h3>
                <DropdownMenuRoot>
                  <DropdownMenuTrigger
                    :class="uiButton({ tone: 'ghost', size: 'iconSm', class: 'opacity-0 group-hover:opacity-100' })"
                    @click.stop
                  >
                    <icon-lucide-more-horizontal class="size-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuContent :class="menuContent()" align="end">
                      <DropdownMenuItem :class="menuItem()" @select="openDocument(doc.id!)">
                        <icon-lucide-external-link class="mr-2 size-4" />
                        打开
                      </DropdownMenuItem>
                      <div :class="menuSeparator()" />
                      <DropdownMenuItem
                        :class="menuItem({ class: 'text-red-400 focus:text-red-400' })"
                        @select="deleteDocument(doc.id!)"
                      >
                        <icon-lucide-trash-2 class="mr-2 size-4" />
                        删除
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenuPortal>
                </DropdownMenuRoot>
              </div>
              <p class="mt-1 text-xs text-muted">{{ formatDate(doc.updated_at) }}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>