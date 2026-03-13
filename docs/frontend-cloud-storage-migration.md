# OpenPencil 前端存储改造开发文档

## 概述

本文档描述如何将 OpenPencil 前端的本地存储功能改造为使用后端服务存储。

## 接口调用规范

所有接口返回 `Promise<[err, data, res]>` 格式，取值方式：

```typescript
const [err, data, res] = await documents.getDocuments({ page: 1 })
if (err) {
    console.error('请求失败:', err)
    return
}
// 使用 data
console.log(data.items)
```

## 服务模块

| 模块 | 导入路径 | 用途 |
|-----|---------|------|
| auth | `src/services/auth` | 用户认证 |
| documents | `src/services/documents` | 文档管理 |
| collaboration | `src/services/collaboration` | 协作房间 |
| settings | `src/services/settings` | 用户设置 |
| images | `src/services/images` | 图片资源 |

---

## 一、文档存储改造

### 涉及文件

- `src/stores/editor.ts` - 编辑器核心逻辑
- `src/stores/tabs.ts` - 标签页管理
- `src/composables/use-menu.ts` - 文件菜单

### 1.1 Editor Store 改造

在 `src/stores/editor.ts` 中新增云端文档相关状态和方法：

```typescript
import { documents } from '@/services'

export function createEditorStore() {
    // 新增状态
    let cloudDocumentId: string | null = null
    let cloudVersion = 0
    let cloudSyncEnabled = false

    const state = shallowReactive({
        // ... 现有状态
        cloudDocumentId: null as string | null,
        cloudVersion: 0,
        cloudSyncEnabled: false,
        cloudSaving: false,
        cloudLoading: false,
    })

    // ========== 云端文档操作 ==========

    /**
     * 从云端打开文档
     */
    async function openCloudDocument(docId: string): Promise<boolean> {
        try {
            state.loading = true
            state.cloudLoading = true
            
            // 1. 获取文档详情
            const [err1, docInfo] = await documents.getDocumentsById(docId)
            if (err1 || !docInfo) {
                toast.error('获取文档信息失败')
                return false
            }
            
            // 2. 下载文档内容
            const [err2, blob] = await documents.getDocumentsByIdDownload(docId)
            if (err2 || !blob) {
                toast.error('下载文档失败')
                return false
            }
            
            // 3. 解析文档
            const file = new File([blob], docInfo.name + '.fig')
            const imported = await readFigFile(file)
            graph = imported
            subscribeToGraph()
            computeAllLayouts(graph)
            undo.clear()
            pageViewports.clear()
            
            // 4. 更新状态
            cloudDocumentId = docId
            state.cloudDocumentId = docId
            cloudVersion = docInfo.version ?? 1
            state.cloudVersion = cloudVersion
            state.cloudSyncEnabled = true
            state.documentName = docInfo.name ?? 'Untitled'
            state.selectedIds = new Set()
            
            const firstPage = graph.getPages()[0] as SceneNode | undefined
            state.currentPageId = firstPage?.id ?? graph.rootId
            state.panX = 0
            state.panY = 0
            state.zoom = 1
            
            await loadFontsForNodes(graph.getChildren(state.currentPageId).map(n => n.id))
            requestRender()
            
            return true
        } catch (e) {
            console.error('打开云端文档失败:', e)
            return false
        } finally {
            state.loading = false
            state.cloudLoading = false
        }
    }

    /**
     * 保存文档到云端
     */
    async function saveToCloud(): Promise<boolean> {
        if (!cloudDocumentId) return false
        
        try {
            state.cloudSaving = true
            
            const figData = await buildFigFile()
            const file = new File([figData], state.documentName + '.fig')
            
            const [err, result] = await documents.putDocumentsByIdContent({
                id: cloudDocumentId,
                file,
                version: cloudVersion
            })
            
            if (err) {
                // 检查是否版本冲突
                if (err.code === 409) {
                    toast.error('文档已被其他用户修改，请刷新后重试')
                } else {
                    toast.error('保存失败: ' + (err.msg || '未知错误'))
                }
                return false
            }
            
            // 更新本地版本
            cloudVersion = result?.version ?? cloudVersion + 1
            state.cloudVersion = cloudVersion
            savedVersion = state.sceneVersion
            
            return true
        } catch (e) {
            console.error('保存到云端失败:', e)
            return false
        } finally {
            state.cloudSaving = false
        }
    }

    /**
     * 创建新云端文档
     */
    async function createCloudDocument(name?: string): Promise<string | null> {
        try {
            const figData = await buildFigFile()
            const file = new File([figData], (name || state.documentName) + '.fig')
            
            const [err, result] = await documents.postDocuments({
                name: name || state.documentName,
                file,
                is_public: false
            })
            
            if (err || !result) {
                toast.error('创建文档失败')
                return null
            }
            
            cloudDocumentId = result.id ?? null
            state.cloudDocumentId = cloudDocumentId
            cloudVersion = result.version ?? 1
            state.cloudVersion = cloudVersion
            state.cloudSyncEnabled = true
            state.documentName = result.name ?? state.documentName
            
            return cloudDocumentId
        } catch (e) {
            console.error('创建云端文档失败:', e)
            return null
        }
    }

    /**
     * 自动保存到云端
     */
    const CLOUD_AUTOSAVE_DELAY = 5000
    
    watch(
        () => state.sceneVersion,
        (version) => {
            if (version === savedVersion) return
            if (!state.cloudSyncEnabled) return
            if (!cloudDocumentId) return
            
            clearTimeout(autosaveTimer)
            autosaveTimer = setTimeout(async () => {
                if (state.sceneVersion === savedVersion) return
                await saveToCloud()
            }, CLOUD_AUTOSAVE_DELAY)
        }
    )

    // ... 导出新增方法
    return {
        state,
        // ... 现有导出
        openCloudDocument,
        saveToCloud,
        createCloudDocument,
    }
}
```

### 1.2 Tabs Store 改造

在 `src/stores/tabs.ts` 中新增云端文档标签支持：

```typescript
import { documents } from '@/services'

export interface Tab {
    id: string
    store: EditorStore
    cloudDocumentId?: string  // 新增
}

/**
 * 打开云端文档
 */
export async function openCloudDocumentInNewTab(docId: string): Promise<void> {
    const current = activeTab.value
    const isUntouched =
        current?.store.state.documentName === 'Untitled' && 
        !current.store.undo.canUndo &&
        !current.store.state.cloudDocumentId
    
    if (isUntouched) {
        await current.store.openCloudDocument(docId)
        current.cloudDocumentId = docId
    } else {
        const store = createEditorStore()
        const tab = createTab(store)
        tab.cloudDocumentId = docId
        await store.openCloudDocument(docId)
    }
}
```

### 1.3 文件菜单改造

在 `src/composables/use-menu.ts` 中添加云端文档操作：

```typescript
import { documents } from '@/services'
import { openCloudDocumentInNewTab } from '@/stores/tabs'

export function useMenuActions() {
    async function openFromCloud() {
        // 打开文档选择器（需实现 UI 组件）
        // 选择后调用 openCloudDocumentInNewTab(docId)
    }

    async function saveToCloud() {
        const store = getActiveStore()
        if (store.state.cloudDocumentId) {
            await store.saveToCloud()
            toast.success('保存成功')
        } else {
            // 首次保存，创建新云端文档
            const docId = await store.createCloudDocument()
            if (docId) {
                toast.success('已保存到云端')
            }
        }
    }

    async function saveAsCloud(name: string) {
        const store = getActiveStore()
        const docId = await store.createCloudDocument(name)
        if (docId) {
            toast.success('另存为成功')
        }
    }

    return {
        openFromCloud,
        saveToCloud,
        saveAsCloud,
    }
}
```

---

## 二、协作房间改造

### 涉及文件

- `src/composables/use-collab.ts` - 协作逻辑

### 2.1 替换 IndexedDB 持久化

```typescript
import { collaboration } from '@/services'
import * as Y from 'yjs'

export function useCollab(store: EditorStore) {
    // 移除: import { IndexeddbPersistence } from 'y-indexeddb'
    
    let cloudRoomId: string | null = null
    let stateSyncTimer: ReturnType<typeof setInterval> | null = null
    
    // ========== 云端状态同步 ==========

    /**
     * 从服务器同步 Yjs 状态
     */
    async function syncStateFromServer(roomId: string): Promise<boolean> {
        const [err, result] = await collaboration.getRoomsByIdState(roomId)
        if (err || !result?.state) return false
        
        try {
            const stateBytes = Uint8Array.from(atob(result.state), c => c.charCodeAt(0))
            Y.applyUpdate(ydoc!, stateBytes, 'server')
            return true
        } catch (e) {
            console.error('同步状态失败:', e)
            return false
        }
    }

    /**
     * 保存 Yjs 状态到服务器
     */
    async function saveStateToServer(): Promise<void> {
        if (!ydoc || !cloudRoomId) return
        
        const state = Y.encodeStateAsUpdate(ydoc)
        const stateVec = Y.encodeStateVector(ydoc)
        
        const stateBase64 = btoa(String.fromCharCode(...state))
        const stateVecBase64 = btoa(String.fromCharCode(...stateVec))
        
        await collaboration.putRoomsByIdState({
            id: cloudRoomId,
            state: stateBase64,
            state_vec: stateVecBase64
        })
    }

    /**
     * 创建云端协作房间
     */
    async function createCloudRoom(documentId?: string): Promise<string | null> {
        const [err, result] = await collaboration.postRooms({
            document_id: documentId,
            name: `Room ${Date.now()}`,
            expires_in_hours: 24
        })
        
        if (err || !result) {
            console.error('创建房间失败:', err)
            return null
        }
        
        return result.id ?? null
    }

    /**
     * 连接到协作房间
     */
    async function connectToCloudRoom(roomId: string): Promise<boolean> {
        if (room) disconnect()
        
        state.value.roomId = roomId
        ydoc = new Y.Doc()
        awareness = new awarenessProtocol.Awareness(ydoc)
        ynodes = ydoc.getMap('nodes')
        yimages = ydoc.getMap('images')
        cloudRoomId = roomId
        
        // 从服务器同步初始状态
        await syncStateFromServer(roomId)
        
        // 设置状态同步定时器
        stateSyncTimer = setInterval(() => {
            void saveStateToServer()
        }, 30000) // 每30秒同步一次
        
        // ... 其余 WebRTC 连接逻辑保持不变
        
        return true
    }

    /**
     * 断开连接
     */
    function disconnect() {
        // 保存最终状态到服务器
        if (cloudRoomId && ydoc) {
            void saveStateToServer()
        }
        
        if (stateSyncTimer) {
            clearInterval(stateSyncTimer)
            stateSyncTimer = null
        }
        
        // ... 原有清理逻辑
        cloudRoomId = null
    }

    /**
     * 分享当前文档
     */
    async function shareCurrentDoc(): Promise<string | null> {
        const documentId = store.state.cloudDocumentId
        const roomId = await createCloudRoom(documentId ?? undefined)
        
        if (!roomId) return null
        
        await connectToCloudRoom(roomId)
        syncAllNodesToYjs()
        
        return roomId
    }

    return {
        state,
        remotePeers,
        followingPeer,
        connect: connectToCloudRoom,
        disconnect,
        shareCurrentDoc,
        updateCursor,
        updateSelection,
        setLocalName,
        followPeer,
        tickFollow
    }
}
```

### 2.2 断线重连处理

```typescript
/**
 * 处理断线重连
 */
async function handleReconnect(roomId: string): Promise<void> {
    // 1. 从服务器获取最新状态
    const [err, result] = await collaboration.getRoomsByIdState(roomId)
    
    if (err || !result) {
        console.error('获取房间状态失败')
        return
    }
    
    // 2. 比较版本，决定是否需要同步
    const serverVersion = result.version ?? 0
    
    if (result.state) {
        const stateBytes = Uint8Array.from(atob(result.state), c => c.charCodeAt(0))
        const sv = Y.encodeStateVector(ydoc!)
        const diff = Y.encodeStateAsUpdate(ydoc!, sv)
        
        // 如果有差异，应用服务器状态
        if (diff.length > 2) {
            Y.applyUpdate(ydoc!, stateBytes, 'server-reconnect')
        }
    }
}
```

---

## 三、用户设置改造

### 涉及文件

- `src/composables/use-chat.ts` - AI 配置
- `src/composables/use-collab.ts` - 协作用户名

### 3.1 创建云存储设置 Composable

新建 `src/composables/use-cloud-settings.ts`：

```typescript
import { ref, watch } from 'vue'
import { settings } from '@/services'

const SETTINGS_CACHE_KEY = 'open-pencil:settings-cache'
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

type SettingKey = typeof SETTING_KEYS[number]

// 内存缓存
const settingsCache = new Map<SettingKey, string>()
let initialized = false
let pendingWrites = new Map<SettingKey, string>()
let writeTimer: ReturnType<typeof setTimeout> | null = null

/**
 * 初始化设置（从服务器加载）
 */
async function initSettings(): Promise<void> {
    if (initialized) return
    
    const [err, result] = await settings.getSettings()
    
    if (err || !result?.settings) {
        // 加载失败，使用本地缓存
        loadFromLocalStorage()
        return
    }
    
    // 更新内存缓存
    for (const item of result.settings) {
        if (item.key && item.value !== undefined) {
            settingsCache.set(item.key as SettingKey, item.value)
        }
    }
    
    initialized = true
}

/**
 * 从 localStorage 加载（降级方案）
 */
function loadFromLocalStorage(): void {
    for (const key of SETTING_KEYS) {
        const value = localStorage.getItem(`open-pencil:${key}`)
        if (value !== null) {
            settingsCache.set(key, value)
        }
    }
}

/**
 * 获取设置值
 */
export function useCloudSetting<T extends string = string>(
    key: SettingKey,
    defaultValue: T = '' as T
) {
    const value = ref<T>(defaultValue)
    
    // 初始化时加载
    initSettings().then(() => {
        value.value = (settingsCache.get(key) ?? defaultValue) as T
    })
    
    // 监听变化，延迟写入服务器
    watch(value, (newValue) => {
        settingsCache.set(key, newValue)
        pendingWrites.set(key, newValue)
        
        // 防抖写入
        if (writeTimer) clearTimeout(writeTimer)
        writeTimer = setTimeout(() => {
            flushPendingWrites()
        }, 1000)
        
        // 同时写入 localStorage 作为备份
        localStorage.setItem(`open-pencil:${key}`, newValue)
    })
    
    return value
}

/**
 * 批量写入待处理的设置
 */
async function flushPendingWrites(): Promise<void> {
    if (pendingWrites.size === 0) return
    
    const settingsToWrite = Array.from(pendingWrites.entries()).map(([key, value]) => ({
        key,
        value
    }))
    
    pendingWrites.clear()
    
    const [err] = await settings.putSettingsBatch(settingsToWrite)
    
    if (err) {
        console.error('保存设置失败:', err)
    }
}

/**
 * 批量获取设置
 */
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

/**
 * 批量设置
 */
export async function setCloudSettings(
    items: Array<{ key: SettingKey; value: string }>
): Promise<boolean> {
    const [err] = await settings.putSettingsBatch(items)
    
    if (err) {
        console.error('批量设置失败:', err)
        return false
    }
    
    // 更新内存缓存
    for (const item of items) {
        settingsCache.set(item.key, item.value)
        localStorage.setItem(`open-pencil:${item.key}`, item.value)
    }
    
    return true
}
```

### 3.2 改造 use-chat.ts

```typescript
// 原代码
import { useLocalStorage } from '@vueuse/core'

const providerID = useLocalStorage<AIProviderID>('open-pencil:ai-provider', DEFAULT_AI_PROVIDER)
const apiKey = useLocalStorage('open-pencil:ai-key:openrouter', '')
const modelID = useLocalStorage('open-pencil:ai-model', DEFAULT_AI_MODEL)
// ...

// 改造后
import { useCloudSetting } from './use-cloud-settings'

const providerID = useCloudSetting<AIProviderID>('ai-provider', DEFAULT_AI_PROVIDER)
const apiKey = useCloudSetting('ai-key:openrouter', '')
const modelID = useCloudSetting('ai-model', DEFAULT_AI_MODEL)
const customBaseURL = useCloudSetting('ai-base-url', '')
const customModelID = useCloudSetting('ai-custom-model', '')
const customAPIType = useCloudSetting<'completions' | 'responses'>('ai-api-type', 'completions')
const maxOutputTokens = useCloudSetting('ai-max-output-tokens', '16384')
```

### 3.3 改造 use-collab.ts

```typescript
// 原代码
import { useLocalStorage } from '@vueuse/core'
const storedName = useLocalStorage('op-collab-name', '')

// 改造后
import { useCloudSetting } from './use-cloud-settings'
const storedName = useCloudSetting('collab-name', '')
```

---

## 四、图片资源改造

### 涉及文件

- `src/stores/editor.ts` - 图片放置逻辑
- `packages/core/src/scene-graph.ts` - 图片存储

### 4.1 图片上传辅助函数

在 `src/stores/editor.ts` 中添加：

```typescript
import { images } from '@/services'

/**
 * 上传图片到云端
 */
async function uploadImageToCloud(
    bytes: Uint8Array,
    documentId?: string
): Promise<string | null> {
    const file = new File([bytes], 'image.png', { type: 'image/png' })
    
    const [err, result] = await images.postImages({
        file,
        document_id: documentId ?? state.cloudDocumentId ?? undefined
    })
    
    if (err || !result?.hash) {
        console.error('上传图片失败:', err)
        return null
    }
    
    return result.hash
}

/**
 * 批量检查并上传缺失的图片
 */
async function syncImagesToCloud(): Promise<void> {
    const localHashes = Array.from(graph.images.keys())
    
    if (localHashes.length === 0) return
    
    const [err, result] = await images.postImagesCheck(localHashes)
    
    if (err || !result?.missing) return
    
    // 上传缺失的图片
    for (const hash of result.missing) {
        const data = graph.images.get(hash)
        if (data) {
            await uploadImageToCloud(data)
        }
    }
}

/**
 * 放置图片文件（改造版）
 */
async function placeImageFiles(files: File[], cx: number, cy: number) {
    if (!_ck) return
    
    const prepared: Array<{ bytes: Uint8Array; name: string; w: number; h: number }> = []
    for (const file of files) {
        const bytes = new Uint8Array(await file.arrayBuffer())
        const dims = decodeImageDimensions(bytes)
        if (dims) prepared.push({ bytes, name: file.name, ...dims })
    }
    if (!prepared.length) return
    
    // 如果开启了云端同步，先上传图片
    if (state.cloudSyncEnabled) {
        for (const p of prepared) {
            await uploadImageToCloud(p.bytes)
        }
    }
    
    // ... 原有的图片放置逻辑
}
```

### 4.2 打开文档时同步图片

```typescript
async function openCloudDocument(docId: string): Promise<boolean> {
    // ... 打开文档逻辑
    
    // 下载缺失的图片
    const imageHashes = Array.from(graph.images.keys())
    if (imageHashes.length > 0) {
        const [err, result] = await images.postImagesCheck(imageHashes)
        
        if (result?.missing?.length) {
            // 注：实际需要根据业务逻辑处理
            // 这里假设图片已随文档一起下载
        }
    }
    
    return true
}
```

---

## 五、认证集成

### 新建 `src/composables/use-auth.ts`

```typescript
import { ref, computed } from 'vue'
import { auth } from '@/services'

interface User {
    id: string
    email: string
    name: string
    avatar_url?: string
}

const token = ref<string | null>(localStorage.getItem('open-pencil:token'))
const user = ref<User | null>(null)

export function useAuth() {
    const isAuthenticated = computed(() => !!token.value)
    
    async function login(email: string, password: string): Promise<boolean> {
        const [err, data] = await auth.postLogin({ email, password })
        
        if (err || !data?.token) {
            return false
        }
        
        token.value = data.token
        user.value = data.user ?? null
        localStorage.setItem('open-pencil:token', data.token)
        
        return true
    }
    
    async function register(
        email: string, 
        password: string, 
        name?: string
    ): Promise<boolean> {
        const [err, data] = await auth.postRegister({ email, password, name })
        
        if (err || !data) {
            return false
        }
        
        // 注册成功后自动登录
        return login(email, password)
    }
    
    function logout() {
        token.value = null
        user.value = null
        localStorage.removeItem('open-pencil:token')
    }
    
    function getToken(): string | null {
        return token.value
    }
    
    return {
        token,
        user,
        isAuthenticated,
        login,
        register,
        logout,
        getToken
    }
}
```

### 改造 ApiClient 添加认证头

修改 `src/services/client.ts`：

```typescript
import { useAuth } from '@/composables/use-auth'

export default class ApiClient implements IApiClient {
    protected getHeaders(): Record<string, string> {
        const headers: Record<string, string> = {}
        const token = localStorage.getItem('open-pencil:token')
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`
        }
        
        return headers
    }

    async request<T = any>(config: DocReqConfig): Promise<T> {
        const url = this.getBaseUrl() + config.url
        const headers = {
            'Content-Type': 'application/json',
            ...this.getHeaders(),
            ...config.headers
        }
        
        const options: RequestInit = {
            method: config.method,
            headers
        }
        
        if (config.body && ['post', 'put', 'patch'].includes(config.method)) {
            options.body = JSON.stringify(config.body)
        }
        
        if (config.formData) {
            options.body = config.formData
            delete headers['Content-Type'] // 让浏览器自动设置
        }
        
        try {
            const response = await fetch(url, options)
            const json = await response.json()
            
            // 统一返回格式 [err, data, res]
            if (json.code === 200) {
                return [null, json.data, json] as T
            }
            
            return [json, null, json] as T
        } catch (e) {
            return [e, null, null] as T
        }
    }

    protected getBaseUrl(): string {
        return import.meta.env.VITE_API_BASE_URL || '/api/v1'
    }
}
```

---

## 六、接口速查表

### Auth 服务 (`auth`)

| 方法 | 参数 | 返回 data |
|-----|------|----------|
| `postLogin({ email, password })` | 登录参数 | `{ token, user }` |
| `postRegister({ email, password, name? })` | 注册参数 | `{ id, email, name }` |

### Documents 服务 (`documents`)

| 方法 | 参数 | 返回 data |
|-----|------|----------|
| `getDocuments({ page?, page_size?, sort_by?, sort_order?, search? })` | 查询参数 | `{ items, total, page, page_size }` |
| `postDocuments({ name, file?, description?, is_public? })` | 创建参数 | `{ id, name, version, ... }` |
| `getDocumentsById(id)` | 文档ID | `{ id, name, version, file_size, ... }` |
| `putDocumentsById({ id, name?, description?, is_public? })` | 更新参数 | `{ id, name, version, ... }` |
| `deleteDocumentsById(id)` | 文档ID | `null` |
| `putDocumentsByIdContent({ id, file, version? })` | 内容参数 | `{ id, version, file_hash, ... }` |
| `getDocumentsByIdDownload(id)` | 文档ID | `Blob` |
| `postDocumentsByIdCopy({ id, name? })` | 复制参数 | `{ id, name, version, ... }` |
| `getDocumentsByIdVersions(id)` | 文档ID | `{ items, total }` |
| `postDocumentsByIdVersionsByVersionRestore({ id, version })` | 恢复参数 | `{ id, version, restored_from }` |

### Collaboration 服务 (`collaboration`)

| 方法 | 参数 | 返回 data |
|-----|------|----------|
| `postRooms({ document_id?, name?, expires_in_hours? })` | 创建参数 | `{ id, document_id, is_active, ... }` |
| `getRoomsMy()` | - | `{ items, total }` |
| `getRoomsById(id)` | 房间ID | `{ id, document_id, is_active, ... }` |
| `getRoomsByIdState(id)` | 房间ID | `{ room_id, state, state_vec, version }` |
| `putRoomsByIdState({ id, state?, state_vec?, version? })` | 状态参数 | `{ version, updated_at }` |
| `postRoomsByIdClose(id)` | 房间ID | `null` |

### Settings 服务 (`settings`)

| 方法 | 参数 | 返回 data |
|-----|------|----------|
| `getSettings()` | - | `{ settings: [{ key, value }] }` |
| `getSettingsByKey(key)` | 设置键名 | `{ key, value }` |
| `putSettingsByKey({ key, value })` | 设置参数 | `{ key, value, updated_at }` |
| `deleteSettingsByKey(key)` | 设置键名 | `null` |
| `putSettingsBatch([{ key, value }])` | 批量参数 | `{ updated_count }` |

### Images 服务 (`images`)

| 方法 | 参数 | 返回 data |
|-----|------|----------|
| `postImages({ file, document_id? })` | 图片文件 | `{ hash, url, size, width, height, mime_type }` |
| `postImagesCheck([hashes])` | 哈希数组 | `{ existing: [], missing: [] }` |
| `getImagesByHash(hash)` | 图片哈希 | `Blob` |

---

## 七、实施步骤

### 阶段一：基础设施

1. 完善 `src/services/client.ts` 的请求实现
2. 创建 `use-auth.ts` 认证模块
3. 测试所有 API 调用

### 阶段二：文档存储

1. 改造 `editor.ts` 添加云端方法
2. 改造 `tabs.ts` 支持云端标签
3. 添加云端文档列表 UI
4. 实现自动保存逻辑

### 阶段三：协作房间

1. 改造 `use-collab.ts` 替换 IndexedDB
2. 实现状态同步逻辑
3. 测试断线重连

### 阶段四：用户设置

1. 创建 `use-cloud-settings.ts`
2. 改造 `use-chat.ts`
3. 改造 `use-collab.ts` 用户名

### 阶段五：图片资源

1. 添加图片上传逻辑
2. 实现图片同步

---

## 八、注意事项

1. **降级策略**：所有云存储功能应保留 localStorage/IndexedDB 作为离线备份
2. **冲突处理**：文档保存时注意版本冲突 (code 409)
3. **错误处理**：统一使用 `[err, data, res]` 解构，检查 err
4. **Token 刷新**：需实现 token 过期自动刷新机制
5. **并发控制**：自动保存需要防抖，避免频繁请求