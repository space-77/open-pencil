# OpenPencil 后端服务开发文档

## 概述

本文档定义了 OpenPencil 设计编辑器的后端服务接口规范，用于将本地存储（IndexedDB、localStorage、文件系统）改造为云端存储服务。

## 技术栈

- **语言**: Golang 1.21+
- **Web 框架**: Gin
- **数据库**: PostgreSQL 15+ (主数据存储) + Redis (缓存/会话)
- **对象存储**: MinIO / S3 (文件存储)
- **认证**: JWT

## 需要改造的存储功能

| 功能模块 | 当前存储方式 | 改造目标 |
|---------|------------|---------|
| 文档存储 | File System Access API / Tauri FS | 云端文档服务 |
| 协作房间 | IndexedDB (y-indexeddb) | 云端协作服务 |
| 用户配置 | localStorage | 用户设置服务 |

---

## 数据模型

### 1. 用户 (users)

```go
type User struct {
    ID        string    `json:"id" gorm:"primaryKey"`
    Email     string    `json:"email" gorm:"uniqueIndex;not null"`
    Name      string    `json:"name"`
    AvatarURL string    `json:"avatar_url"`
    CreatedAt time.Time `json:"created_at"`
    UpdatedAt time.Time `json:"updated_at"`
}
```

### 2. 文档 (documents)

```go
type Document struct {
    ID          string    `json:"id" gorm:"primaryKey"`
    Name        string    `json:"name" gorm:"not null"`
    OwnerID     string    `json:"owner_id" gorm:"index;not null"`
    Description string    `json:"description"`
    FileSize    int64     `json:"file_size"`
    FileHash    string    `json:"file_hash"`
    Version     int       `json:"version" gorm:"default:1"`
    IsPublic    bool      `json:"is_public" gorm:"default:false"`
    CreatedAt   time.Time `json:"created_at"`
    UpdatedAt   time.Time `json:"updated_at"`
}
```

### 3. 协作房间 (collab_rooms)

```go
type CollabRoom struct {
    ID          string    `json:"id" gorm:"primaryKey"`
    DocumentID  string    `json:"document_id" gorm:"index"`
    Name        string    `json:"name"`
    CreatorID   string    `json:"creator_id" gorm:"index"`
    IsActive    bool      `json:"is_active" gorm:"default:true"`
    ExpiresAt   *time.Time `json:"expires_at"`
    CreatedAt   time.Time `json:"created_at"`
    UpdatedAt   time.Time `json:"updated_at"`
}
```

### 4. 协作房间状态 (collab_room_states)

用于存储 Yjs 文档状态，支持断线重连后同步。

```go
type CollabRoomState struct {
    ID        string    `json:"id" gorm:"primaryKey"`
    RoomID    string    `json:"room_id" gorm:"uniqueIndex;not null"`
    State     []byte    `json:"state" gorm:"type:bytea"`     // Yjs encoded state
    StateVec  []byte    `json:"state_vec" gorm:"type:bytea"` // Yjs state vector
    Version   int64     `json:"version"`
    UpdatedAt time.Time `json:"updated_at"`
}
```

### 5. 用户设置 (user_settings)

```go
type UserSetting struct {
    ID        string    `json:"id" gorm:"primaryKey"`
    UserID    string    `json:"user_id" gorm:"uniqueIndex;not null"`
    Key       string    `json:"key" gorm:"uniqueIndex:idx_user_key;not null"`
    Value     string    `json:"value" gorm:"type:text"`
    CreatedAt time.Time `json:"created_at"`
    UpdatedAt time.Time `json:"updated_at"`
}
```

### 6. 文档版本历史 (document_versions)

```go
type DocumentVersion struct {
    ID          string    `json:"id" gorm:"primaryKey"`
    DocumentID  string    `json:"document_id" gorm:"index;not null"`
    Version     int       `json:"version"`
    FileSize    int64     `json:"file_size"`
    FileHash    string    `json:"file_hash"`
    CreatedBy   string    `json:"created_by"`
    Description string    `json:"description"`
    CreatedAt   time.Time `json:"created_at"`
}
```

---

## 统一响应格式

所有接口返回数据格式：

```json
{
    "code": 200,
    "data": {},
    "msg": "success"
}
```

### 错误码定义

| Code | 含义 |
|------|-----|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 409 | 资源冲突 |
| 422 | 业务逻辑错误 |
| 500 | 服务器内部错误 |

---

## API 接口文档

---

### 一、认证模块 (Authentication)

#### 1.1 用户注册

```
POST /api/v1/auth/register
```

**请求体:**

```json
{
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe"
}
```

**响应:**

```json
{
    "code": 200,
    "data": {
        "user": {
            "id": "usr_abc123",
            "email": "user@example.com",
            "name": "John Doe",
            "created_at": "2024-01-01T00:00:00Z"
        },
        "token": "eyJhbGciOiJIUzI1NiIs..."
    },
    "msg": "注册成功"
}
```

#### 1.2 用户登录

```
POST /api/v1/auth/login
```

**请求体:**

```json
{
    "email": "user@example.com",
    "password": "password123"
}
```

**响应:**

```json
{
    "code": 200,
    "data": {
        "user": {
            "id": "usr_abc123",
            "email": "user@example.com",
            "name": "John Doe"
        },
        "token": "eyJhbGciOiJIUzI1NiIs..."
    },
    "msg": "登录成功"
}
```

#### 1.3 刷新 Token

```
POST /api/v1/auth/refresh
```

**请求头:**

```
Authorization: Bearer <refresh_token>
```

**响应:**

```json
{
    "code": 200,
    "data": {
        "token": "eyJhbGciOiJIUzI1NiIs...",
        "expires_at": "2024-01-02T00:00:00Z"
    },
    "msg": "刷新成功"
}
```

---

### 二、文档模块 (Documents)

#### 2.1 获取文档列表

```
GET /api/v1/documents
```

**查询参数:**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|-----|------|
| page | int | 否 | 页码，默认 1 |
| page_size | int | 否 | 每页数量，默认 20，最大 100 |
| sort_by | string | 否 | 排序字段：name, created_at, updated_at |
| sort_order | string | 否 | 排序方向：asc, desc |
| search | string | 否 | 搜索关键词 |

**响应:**

```json
{
    "code": 200,
    "data": {
        "items": [
            {
                "id": "doc_abc123",
                "name": "My Design",
                "owner_id": "usr_abc123",
                "description": "",
                "file_size": 102400,
                "version": 1,
                "is_public": false,
                "created_at": "2024-01-01T00:00:00Z",
                "updated_at": "2024-01-01T00:00:00Z"
            }
        ],
        "total": 10,
        "page": 1,
        "page_size": 20
    },
    "msg": "获取成功"
}
```

#### 2.2 创建文档

```
POST /api/v1/documents
```

**请求体 (multipart/form-data):**

| 字段 | 类型 | 必填 | 说明 |
|-----|------|-----|------|
| name | string | 是 | 文档名称 |
| file | file | 否 | .fig 文件（可选，不传则创建空文档） |
| description | string | 否 | 文档描述 |
| is_public | bool | 否 | 是否公开，默认 false |

**响应:**

```json
{
    "code": 200,
    "data": {
        "id": "doc_abc123",
        "name": "My Design",
        "owner_id": "usr_abc123",
        "file_size": 1024,
        "version": 1,
        "created_at": "2024-01-01T00:00:00Z"
    },
    "msg": "创建成功"
}
```

#### 2.3 获取文档详情

```
GET /api/v1/documents/:id
```

**响应:**

```json
{
    "code": 200,
    "data": {
        "id": "doc_abc123",
        "name": "My Design",
        "owner_id": "usr_abc123",
        "description": "",
        "file_size": 102400,
        "file_hash": "sha256:abc123...",
        "version": 1,
        "is_public": false,
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z"
    },
    "msg": "获取成功"
}
```

#### 2.4 下载文档文件

```
GET /api/v1/documents/:id/download
```

**响应:**

- Content-Type: `application/octet-stream`
- Content-Disposition: `attachment; filename="My Design.fig"`
- Body: .fig 二进制文件内容

**错误响应:**

```json
{
    "code": 404,
    "data": null,
    "msg": "文档不存在"
}
```

#### 2.5 更新文档

```
PUT /api/v1/documents/:id
```

**请求体:**

```json
{
    "name": "New Name",
    "description": "Updated description",
    "is_public": true
}
```

**响应:**

```json
{
    "code": 200,
    "data": {
        "id": "doc_abc123",
        "name": "New Name",
        "updated_at": "2024-01-02T00:00:00Z"
    },
    "msg": "更新成功"
}
```

#### 2.6 保存文档内容

```
PUT /api/v1/documents/:id/content
```

**请求体 (multipart/form-data):**

| 字段 | 类型 | 必填 | 说明 |
|-----|------|-----|------|
| file | file | 是 | .fig 文件 |
| version | int | 否 | 客户端版本号，用于乐观锁 |

**响应:**

```json
{
    "code": 200,
    "data": {
        "id": "doc_abc123",
        "version": 2,
        "file_size": 204800,
        "file_hash": "sha256:def456...",
        "updated_at": "2024-01-02T00:00:00Z"
    },
    "msg": "保存成功"
}
```

**版本冲突响应 (409):**

```json
{
    "code": 409,
    "data": {
        "server_version": 5,
        "client_version": 3
    },
    "msg": "文档已被其他用户修改，请刷新后重试"
}
```

#### 2.7 删除文档

```
DELETE /api/v1/documents/:id
```

**响应:**

```json
{
    "code": 200,
    "data": null,
    "msg": "删除成功"
}
```

#### 2.8 复制文档

```
POST /api/v1/documents/:id/copy
```

**请求体:**

```json
{
    "name": "Copy of My Design"
}
```

**响应:**

```json
{
    "code": 200,
    "data": {
        "id": "doc_xyz789",
        "name": "Copy of My Design",
        "owner_id": "usr_abc123",
        "version": 1,
        "created_at": "2024-01-02T00:00:00Z"
    },
    "msg": "复制成功"
}
```

#### 2.9 获取文档版本历史

```
GET /api/v1/documents/:id/versions
```

**响应:**

```json
{
    "code": 200,
    "data": {
        "items": [
            {
                "id": "ver_abc123",
                "document_id": "doc_abc123",
                "version": 3,
                "file_size": 204800,
                "created_by": "usr_abc123",
                "description": "Auto save",
                "created_at": "2024-01-03T00:00:00Z"
            }
        ],
        "total": 10
    },
    "msg": "获取成功"
}
```

#### 2.10 恢复文档到指定版本

```
POST /api/v1/documents/:id/versions/:version/restore
```

**响应:**

```json
{
    "code": 200,
    "data": {
        "id": "doc_abc123",
        "version": 4,
        "restored_from": 2,
        "updated_at": "2024-01-04T00:00:00Z"
    },
    "msg": "恢复成功"
}
```

---

### 三、协作房间模块 (Collaboration Rooms)

#### 3.1 创建协作房间

```
POST /api/v1/collab/rooms
```

**请求体:**

```json
{
    "document_id": "doc_abc123",
    "name": "Design Review Session",
    "expires_in_hours": 24
}
```

**响应:**

```json
{
    "code": 200,
    "data": {
        "id": "room_xyz789",
        "document_id": "doc_abc123",
        "name": "Design Review Session",
        "creator_id": "usr_abc123",
        "is_active": true,
        "expires_at": "2024-01-02T00:00:00Z",
        "created_at": "2024-01-01T00:00:00Z"
    },
    "msg": "创建成功"
}
```

#### 3.2 获取房间信息

```
GET /api/v1/collab/rooms/:id
```

**响应:**

```json
{
    "code": 200,
    "data": {
        "id": "room_xyz789",
        "document_id": "doc_abc123",
        "name": "Design Review Session",
        "creator_id": "usr_abc123",
        "is_active": true,
        "expires_at": "2024-01-02T00:00:00Z",
        "created_at": "2024-01-01T00:00:00Z"
    },
    "msg": "获取成功"
}
```

#### 3.3 获取房间 Yjs 状态

用于客户端断线重连后同步状态。

```
GET /api/v1/collab/rooms/:id/state
```

**响应:**

```json
{
    "code": 200,
    "data": {
        "room_id": "room_xyz789",
        "state": "base64-encoded-yjs-state",
        "state_vec": "base64-encoded-yjs-state-vector",
        "version": 12345,
        "updated_at": "2024-01-01T00:30:00Z"
    },
    "msg": "获取成功"
}
```

#### 3.4 更新房间 Yjs 状态

```
PUT /api/v1/collab/rooms/:id/state
```

**请求体:**

```json
{
    "state": "base64-encoded-yjs-state",
    "state_vec": "base64-encoded-yjs-state-vector",
    "version": 12345
}
```

**响应:**

```json
{
    "code": 200,
    "data": {
        "version": 12346,
        "updated_at": "2024-01-01T00:31:00Z"
    },
    "msg": "更新成功"
}
```

#### 3.5 关闭协作房间

```
POST /api/v1/collab/rooms/:id/close
```

**响应:**

```json
{
    "code": 200,
    "data": null,
    "msg": "房间已关闭"
}
```

#### 3.6 获取用户参与的房间列表

```
GET /api/v1/collab/rooms/my
```

**响应:**

```json
{
    "code": 200,
    "data": {
        "items": [
            {
                "id": "room_xyz789",
                "document_id": "doc_abc123",
                "document_name": "My Design",
                "name": "Design Review Session",
                "is_active": true,
                "created_at": "2024-01-01T00:00:00Z"
            }
        ],
        "total": 2
    },
    "msg": "获取成功"
}
```

---

### 四、用户设置模块 (User Settings)

用于替代 localStorage 存储的用户配置，如 AI 设置等。

#### 4.1 获取用户所有设置

```
GET /api/v1/settings
```

**响应:**

```json
{
    "code": 200,
    "data": {
        "settings": [
            {
                "key": "ai-provider",
                "value": "openrouter"
            },
            {
                "key": "ai-model",
                "value": "anthropic/claude-3.5-sonnet"
            },
            {
                "key": "ai-key:openrouter",
                "value": "sk-or-..."
            },
            {
                "key": "ai-base-url",
                "value": ""
            },
            {
                "key": "ai-custom-model",
                "value": ""
            },
            {
                "key": "ai-api-type",
                "value": "completions"
            },
            {
                "key": "ai-max-output-tokens",
                "value": "16384"
            },
            {
                "key": "collab-name",
                "value": "John"
            }
        ]
    },
    "msg": "获取成功"
}
```

#### 4.2 获取单个设置

```
GET /api/v1/settings/:key
```

**响应:**

```json
{
    "code": 200,
    "data": {
        "key": "ai-provider",
        "value": "openrouter"
    },
    "msg": "获取成功"
}
```

#### 4.3 设置单个配置

```
PUT /api/v1/settings/:key
```

**请求体:**

```json
{
    "value": "anthropic"
}
```

**响应:**

```json
{
    "code": 200,
    "data": {
        "key": "ai-provider",
        "value": "anthropic",
        "updated_at": "2024-01-01T00:00:00Z"
    },
    "msg": "设置成功"
}
```

#### 4.4 批量设置

```
PUT /api/v1/settings/batch
```

**请求体:**

```json
{
    "settings": [
        {"key": "ai-provider", "value": "anthropic"},
        {"key": "ai-model", "value": "claude-3-sonnet"},
        {"key": "collab-name", "value": "John"}
    ]
}
```

**响应:**

```json
{
    "code": 200,
    "data": {
        "updated_count": 3
    },
    "msg": "设置成功"
}
```

#### 4.5 删除设置

```
DELETE /api/v1/settings/:key
```

**响应:**

```json
{
    "code": 200,
    "data": null,
    "msg": "删除成功"
}
```

---

### 五、图片资源模块 (Images)

用于存储文档中引用的图片资源。

#### 5.1 上传图片

```
POST /api/v1/images
```

**请求体 (multipart/form-data):**

| 字段 | 类型 | 必填 | 说明 |
|-----|------|-----|------|
| file | file | 是 | 图片文件 (png/jpg/webp/svg) |
| document_id | string | 否 | 关联的文档 ID |

**响应:**

```json
{
    "code": 200,
    "data": {
        "hash": "sha256:abc123...",
        "url": "/api/v1/images/sha256:abc123...",
        "size": 102400,
        "width": 800,
        "height": 600,
        "mime_type": "image/png"
    },
    "msg": "上传成功"
}
```

#### 5.2 获取图片

```
GET /api/v1/images/:hash
```

**响应:**

- Content-Type: `image/png` (或其他对应类型)
- Body: 图片二进制内容

#### 5.3 批量检查图片是否存在

```
POST /api/v1/images/check
```

**请求体:**

```json
{
    "hashes": ["sha256:abc123...", "sha256:def456..."]
}
```

**响应:**

```json
{
    "code": 200,
    "data": {
        "existing": ["sha256:abc123..."],
        "missing": ["sha256:def456..."]
    },
    "msg": "检查完成"
}
```

---

## 项目结构

```
open-pencil-server/
├── cmd/
│   └── server/
│       └── main.go
├── internal/
│   ├── config/
│   │   └── config.go
│   ├── middleware/
│   │   ├── auth.go
│   │   ├── cors.go
│   │   ├── logger.go
│   │   └── recover.go
│   ├── handler/
│   │   ├── auth.go
│   │   ├── document.go
│   │   ├── collab.go
│   │   ├── settings.go
│   │   └── image.go
│   ├── service/
│   │   ├── auth.go
│   │   ├── document.go
│   │   ├── collab.go
│   │   ├── settings.go
│   │   └── image.go
│   ├── repository/
│   │   ├── user.go
│   │   ├── document.go
│   │   ├── collab.go
│   │   └── settings.go
│   ├── model/
│   │   ├── user.go
│   │   ├── document.go
│   │   ├── collab.go
│   │   └── settings.go
│   └── pkg/
│       ├── response/
│       │   └── response.go
│       ├── storage/
│       │   ├── minio.go
│       │   └── local.go
│       └── yjs/
│           └── encoder.go
├── pkg/
│   └── openapi/
│       └── openapi.yaml
├── migrations/
│   ├── 001_init.up.sql
│   └── 001_init.down.sql
├── go.mod
├── go.sum
├── Makefile
└── Dockerfile
```

---

## 核心代码示例

### 统一响应结构

```go
// internal/pkg/response/response.go
package response

import (
    "net/http"
    "github.com/gin-gonic/gin"
)

type Response struct {
    Code int         `json:"code"`
    Data interface{} `json:"data"`
    Msg  string      `json:"msg"`
}

func Success(c *gin.Context, data interface{}) {
    c.JSON(http.StatusOK, Response{
        Code: 200,
        Data: data,
        Msg:  "success",
    })
}

func SuccessWithMsg(c *gin.Context, data interface{}, msg string) {
    c.JSON(http.StatusOK, Response{
        Code: 200,
        Data: data,
        Msg:  msg,
    })
}

func Error(c *gin.Context, code int, msg string) {
    c.JSON(http.StatusOK, Response{
        Code: code,
        Data: nil,
        Msg:  msg,
    })
}

func BadRequest(c *gin.Context, msg string) {
    Error(c, 400, msg)
}

func Unauthorized(c *gin.Context, msg string) {
    Error(c, 401, msg)
}

func Forbidden(c *gin.Context, msg string) {
    Error(c, 403, msg)
}

func NotFound(c *gin.Context, msg string) {
    Error(c, 404, msg)
}

func Conflict(c *gin.Context, msg string) {
    Error(c, 409, msg)
}

func InternalError(c *gin.Context, msg string) {
    Error(c, 500, msg)
}
```

### 文档处理器示例

```go
// internal/handler/document.go
package handler

import (
    "strconv"

    "github.com/gin-gonic/gin"

    "open-pencil-server/internal/pkg/response"
    "open-pencil-server/internal/service"
)

type DocumentHandler struct {
    svc *service.DocumentService
}

func NewDocumentHandler(svc *service.DocumentService) *DocumentHandler {
    return &DocumentHandler{svc: svc}
}

// List godoc
// @Summary 获取文档列表
// @Tags Documents
// @Accept json
// @Produce json
// @Param page query int false "页码"
// @Param page_size query int false "每页数量"
// @Param sort_by query string false "排序字段"
// @Param sort_order query string false "排序方向"
// @Param search query string false "搜索关键词"
// @Success 200 {object} response.Response
// @Router /api/v1/documents [get]
func (h *DocumentHandler) List(c *gin.Context) {
    userID := c.GetString("user_id")
    
    page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
    pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))
    sortBy := c.DefaultQuery("sort_by", "updated_at")
    sortOrder := c.DefaultQuery("sort_order", "desc")
    search := c.Query("search")
    
    result, err := h.svc.List(c.Request.Context(), userID, service.ListParams{
        Page:      page,
        PageSize:  pageSize,
        SortBy:    sortBy,
        SortOrder: sortOrder,
        Search:    search,
    })
    if err != nil {
        response.InternalError(c, err.Error())
        return
    }
    
    response.Success(c, result)
}

// Create godoc
// @Summary 创建文档
// @Tags Documents
// @Accept multipart/form-data
// @Produce json
// @Param name formData string true "文档名称"
// @Param file formData file false ".fig 文件"
// @Param description formData string false "文档描述"
// @Param is_public formData bool false "是否公开"
// @Success 200 {object} response.Response
// @Router /api/v1/documents [post]
func (h *DocumentHandler) Create(c *gin.Context) {
    userID := c.GetString("user_id")
    name := c.PostForm("name")
    description := c.PostForm("description")
    isPublic := c.PostForm("is_public") == "true"
    
    file, header, err := c.Request.FormFile("file")
    if err == nil {
        defer file.Close()
    }
    
    doc, err := h.svc.Create(c.Request.Context(), userID, service.CreateParams{
        Name:        name,
        Description: description,
        IsPublic:    isPublic,
        File:        file,
        FileName:    header.Filename,
    })
    if err != nil {
        response.BadRequest(c, err.Error())
        return
    }
    
    response.SuccessWithMsg(c, doc, "创建成功")
}

// Download godoc
// @Summary 下载文档
// @Tags Documents
// @Produce application/octet-stream
// @Param id path string true "文档ID"
// @Success 200 {file} binary
// @Router /api/v1/documents/{id}/download [get]
func (h *DocumentHandler) Download(c *gin.Context) {
    userID := c.GetString("user_id")
    docID := c.Param("id")
    
    reader, doc, err := h.svc.Download(c.Request.Context(), userID, docID)
    if err != nil {
        response.NotFound(c, "文档不存在")
        return
    }
    defer reader.Close()
    
    c.Header("Content-Disposition", "attachment; filename=\""+doc.Name+".fig\"")
    c.DataFromReader(200, doc.FileSize, "application/octet-stream", reader, nil)
}
```

### 文档服务示例

```go
// internal/service/document.go
package service

import (
    "context"
    "io"
    "time"

    "open-pencil-server/internal/model"
    "open-pencil-server/internal/repository"
    "open-pencil-server/internal/pkg/storage"
)

type DocumentService struct {
    repo    *repository.DocumentRepository
    storage storage.Storage
}

type ListParams struct {
    Page      int
    PageSize  int
    SortBy    string
    SortOrder string
    Search    string
}

type ListResult struct {
    Items    []model.Document `json:"items"`
    Total    int64            `json:"total"`
    Page     int              `json:"page"`
    PageSize int              `json:"page_size"`
}

type CreateParams struct {
    Name        string
    Description string
    IsPublic    bool
    File        io.Reader
    FileName    string
}

func NewDocumentService(repo *repository.DocumentRepository, storage storage.Storage) *DocumentService {
    return &DocumentService{repo: repo, storage: storage}
}

func (s *DocumentService) List(ctx context.Context, userID string, params ListParams) (*ListResult, error) {
    items, total, err := s.repo.ListByOwner(ctx, userID, params.Page, params.PageSize, params.SortBy, params.SortOrder, params.Search)
    if err != nil {
        return nil, err
    }
    
    return &ListResult{
        Items:    items,
        Total:    total,
        Page:     params.Page,
        PageSize: params.PageSize,
    }, nil
}

func (s *DocumentService) Create(ctx context.Context, userID string, params CreateParams) (*model.Document, error) {
    doc := &model.Document{
        ID:          generateID(),
        Name:        params.Name,
        OwnerID:     userID,
        Description: params.Description,
        IsPublic:    params.IsPublic,
        Version:     1,
        CreatedAt:   time.Now(),
        UpdatedAt:   time.Now(),
    }
    
    if params.File != nil {
        hash, size, err := s.storage.Upload(ctx, params.File, "documents/"+doc.ID)
        if err != nil {
            return nil, err
        }
        doc.FileHash = hash
        doc.FileSize = size
    }
    
    if err := s.repo.Create(ctx, doc); err != nil {
        return nil, err
    }
    
    return doc, nil
}

func (s *DocumentService) Download(ctx context.Context, userID, docID string) (io.ReadCloser, *model.Document, error) {
    doc, err := s.repo.GetByID(ctx, docID)
    if err != nil || doc == nil {
        return nil, nil, ErrNotFound
    }
    
    if doc.OwnerID != userID && !doc.IsPublic {
        return nil, nil, ErrForbidden
    }
    
    reader, err := s.storage.Download(ctx, "documents/"+docID)
    if err != nil {
        return nil, nil, err
    }
    
    return reader, doc, nil
}
```

---

## 数据库迁移

```sql
-- migrations/001_init.up.sql

CREATE TABLE users (
    id VARCHAR(32) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255),
    avatar_url TEXT,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE documents (
    id VARCHAR(32) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    owner_id VARCHAR(32) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    description TEXT,
    file_size BIGINT DEFAULT 0,
    file_hash VARCHAR(128),
    version INT DEFAULT 1,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_documents_owner ON documents(owner_id);
CREATE INDEX idx_documents_updated ON documents(updated_at DESC);

CREATE TABLE document_versions (
    id VARCHAR(32) PRIMARY KEY,
    document_id VARCHAR(32) NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    version INT NOT NULL,
    file_size BIGINT DEFAULT 0,
    file_hash VARCHAR(128),
    created_by VARCHAR(32) REFERENCES users(id),
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(document_id, version)
);

CREATE INDEX idx_doc_versions_document ON document_versions(document_id);

CREATE TABLE collab_rooms (
    id VARCHAR(32) PRIMARY KEY,
    document_id VARCHAR(32) REFERENCES documents(id) ON DELETE SET NULL,
    name VARCHAR(255),
    creator_id VARCHAR(32) NOT NULL REFERENCES users(id),
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_collab_rooms_creator ON collab_rooms(creator_id);
CREATE INDEX idx_collab_rooms_document ON collab_rooms(document_id);

CREATE TABLE collab_room_states (
    id VARCHAR(32) PRIMARY KEY,
    room_id VARCHAR(32) NOT NULL UNIQUE REFERENCES collab_rooms(id) ON DELETE CASCADE,
    state BYTEA,
    state_vec BYTEA,
    version BIGINT DEFAULT 0,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_settings (
    id VARCHAR(32) PRIMARY KEY,
    user_id VARCHAR(32) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    key VARCHAR(255) NOT NULL,
    value TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, key)
);

CREATE INDEX idx_user_settings_user ON user_settings(user_id);

CREATE TABLE images (
    hash VARCHAR(128) PRIMARY KEY,
    document_id VARCHAR(32) REFERENCES documents(id) ON DELETE SET NULL,
    size BIGINT NOT NULL,
    width INT,
    height INT,
    mime_type VARCHAR(64),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_images_document ON images(document_id);
```

---

## OpenAPI 3.0 规范

```yaml
openapi: 3.0.3
info:
  title: OpenPencil API
  description: OpenPencil 设计编辑器后端服务 API
  version: 1.0.0
  contact:
    name: OpenPencil Team
    url: https://github.com/open-pencil/open-pencil

servers:
  - url: https://api.openpencil.dev/v1
    description: Production
  - url: http://localhost:8080/v1
    description: Development

tags:
  - name: Auth
    description: 认证相关接口
  - name: Documents
    description: 文档管理
  - name: Collaboration
    description: 协作房间
  - name: Settings
    description: 用户设置
  - name: Images
    description: 图片资源

paths:
  /auth/register:
    post:
      tags: [Auth]
      summary: 用户注册
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/RegisterRequest'
      responses:
        '200':
          description: 注册成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AuthResponse'

  /auth/login:
    post:
      tags: [Auth]
      summary: 用户登录
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/LoginRequest'
      responses:
        '200':
          description: 登录成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AuthResponse'

  /auth/refresh:
    post:
      tags: [Auth]
      summary: 刷新 Token
      security:
        - bearerAuth: []
      responses:
        '200':
          description: 刷新成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/RefreshResponse'

  /documents:
    get:
      tags: [Documents]
      summary: 获取文档列表
      security:
        - bearerAuth: []
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: page_size
          in: query
          schema:
            type: integer
            default: 20
            maximum: 100
        - name: sort_by
          in: query
          schema:
            type: string
            enum: [name, created_at, updated_at]
            default: updated_at
        - name: sort_order
          in: query
          schema:
            type: string
            enum: [asc, desc]
            default: desc
        - name: search
          in: query
          schema:
            type: string
      responses:
        '200':
          description: 成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/DocumentListResponse'
    post:
      tags: [Documents]
      summary: 创建文档
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              $ref: '#/components/schemas/CreateDocumentRequest'
      responses:
        '200':
          description: 创建成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/DocumentResponse'

  /documents/{id}:
    get:
      tags: [Documents]
      summary: 获取文档详情
      security:
        - bearerAuth: []
      parameters:
        - $ref: '#/components/parameters/documentId'
      responses:
        '200':
          description: 成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/DocumentResponse'
    put:
      tags: [Documents]
      summary: 更新文档信息
      security:
        - bearerAuth: []
      parameters:
        - $ref: '#/components/parameters/documentId'
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UpdateDocumentRequest'
      responses:
        '200':
          description: 更新成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/DocumentResponse'
    delete:
      tags: [Documents]
      summary: 删除文档
      security:
        - bearerAuth: []
      parameters:
        - $ref: '#/components/parameters/documentId'
      responses:
        '200':
          description: 删除成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/EmptyResponse'

  /documents/{id}/download:
    get:
      tags: [Documents]
      summary: 下载文档文件
      security:
        - bearerAuth: []
      parameters:
        - $ref: '#/components/parameters/documentId'
      responses:
        '200':
          description: 文件内容
          content:
            application/octet-stream:
              schema:
                type: string
                format: binary

  /documents/{id}/content:
    put:
      tags: [Documents]
      summary: 保存文档内容
      security:
        - bearerAuth: []
      parameters:
        - $ref: '#/components/parameters/documentId'
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              $ref: '#/components/schemas/SaveDocumentContentRequest'
      responses:
        '200':
          description: 保存成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/DocumentResponse'
        '409':
          description: 版本冲突
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/VersionConflictResponse'

  /documents/{id}/copy:
    post:
      tags: [Documents]
      summary: 复制文档
      security:
        - bearerAuth: []
      parameters:
        - $ref: '#/components/parameters/documentId'
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                name:
                  type: string
                  description: 新文档名称
      responses:
        '200':
          description: 复制成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/DocumentResponse'

  /documents/{id}/versions:
    get:
      tags: [Documents]
      summary: 获取文档版本历史
      security:
        - bearerAuth: []
      parameters:
        - $ref: '#/components/parameters/documentId'
      responses:
        '200':
          description: 成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/VersionListResponse'

  /documents/{id}/versions/{version}/restore:
    post:
      tags: [Documents]
      summary: 恢复文档到指定版本
      security:
        - bearerAuth: []
      parameters:
        - $ref: '#/components/parameters/documentId'
        - name: version
          in: path
          required: true
          schema:
            type: integer
      responses:
        '200':
          description: 恢复成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/RestoreResponse'

  /collab/rooms:
    post:
      tags: [Collaboration]
      summary: 创建协作房间
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateRoomRequest'
      responses:
        '200':
          description: 创建成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/RoomResponse'

  /collab/rooms/my:
    get:
      tags: [Collaboration]
      summary: 获取用户参与的房间列表
      security:
        - bearerAuth: []
      responses:
        '200':
          description: 成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/RoomListResponse'

  /collab/rooms/{id}:
    get:
      tags: [Collaboration]
      summary: 获取房间信息
      security:
        - bearerAuth: []
      parameters:
        - $ref: '#/components/parameters/roomId'
      responses:
        '200':
          description: 成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/RoomResponse'

  /collab/rooms/{id}/state:
    get:
      tags: [Collaboration]
      summary: 获取房间 Yjs 状态
      security:
        - bearerAuth: []
      parameters:
        - $ref: '#/components/parameters/roomId'
      responses:
        '200':
          description: 成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/RoomStateResponse'
    put:
      tags: [Collaboration]
      summary: 更新房间 Yjs 状态
      security:
        - bearerAuth: []
      parameters:
        - $ref: '#/components/parameters/roomId'
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UpdateRoomStateRequest'
      responses:
        '200':
          description: 更新成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UpdateRoomStateResponse'

  /collab/rooms/{id}/close:
    post:
      tags: [Collaboration]
      summary: 关闭协作房间
      security:
        - bearerAuth: []
      parameters:
        - $ref: '#/components/parameters/roomId'
      responses:
        '200':
          description: 房间已关闭
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/EmptyResponse'

  /settings:
    get:
      tags: [Settings]
      summary: 获取用户所有设置
      security:
        - bearerAuth: []
      responses:
        '200':
          description: 成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SettingsResponse'

  /settings/{key}:
    get:
      tags: [Settings]
      summary: 获取单个设置
      security:
        - bearerAuth: []
      parameters:
        - name: key
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: 成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SettingItemResponse'
    put:
      tags: [Settings]
      summary: 设置单个配置
      security:
        - bearerAuth: []
      parameters:
        - name: key
          in: path
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [value]
              properties:
                value:
                  type: string
      responses:
        '200':
          description: 设置成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SettingItemResponse'
    delete:
      tags: [Settings]
      summary: 删除设置
      security:
        - bearerAuth: []
      parameters:
        - name: key
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: 删除成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/EmptyResponse'

  /settings/batch:
    put:
      tags: [Settings]
      summary: 批量设置
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/BatchSettingsRequest'
      responses:
        '200':
          description: 设置成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/BatchSettingsResponse'

  /images:
    post:
      tags: [Images]
      summary: 上传图片
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              $ref: '#/components/schemas/UploadImageRequest'
      responses:
        '200':
          description: 上传成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ImageResponse'

  /images/{hash}:
    get:
      tags: [Images]
      summary: 获取图片
      parameters:
        - name: hash
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: 图片内容
          content:
            image/png:
              schema:
                type: string
                format: binary
            image/jpeg:
              schema:
                type: string
                format: binary
            image/webp:
              schema:
                type: string
                format: binary
            image/svg+xml:
              schema:
                type: string

  /images/check:
    post:
      tags: [Images]
      summary: 批量检查图片是否存在
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [hashes]
              properties:
                hashes:
                  type: array
                  items:
                    type: string
      responses:
        '200':
          description: 检查完成
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/CheckImagesResponse'

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  parameters:
    documentId:
      name: id
      in: path
      required: true
      schema:
        type: string
      description: 文档 ID
    roomId:
      name: id
      in: path
      required: true
      schema:
        type: string
      description: 房间 ID

  schemas:
    Response:
      type: object
      required: [code, data, msg]
      properties:
        code:
          type: integer
        data:
          oneOf:
            - type: object
            - type: array
            - type: 'null'
        msg:
          type: string

    EmptyResponse:
      allOf:
        - $ref: '#/components/schemas/Response'
        - type: object
          properties:
            data:
              type: 'null'

    User:
      type: object
      properties:
        id:
          type: string
        email:
          type: string
          format: email
        name:
          type: string
        avatar_url:
          type: string
        created_at:
          type: string
          format: date-time

    RegisterRequest:
      type: object
      required: [email, password]
      properties:
        email:
          type: string
          format: email
        password:
          type: string
          minLength: 8
        name:
          type: string

    LoginRequest:
      type: object
      required: [email, password]
      properties:
        email:
          type: string
          format: email
        password:
          type: string

    AuthResponse:
      allOf:
        - $ref: '#/components/schemas/Response'
        - type: object
          properties:
            data:
              type: object
              properties:
                user:
                  $ref: '#/components/schemas/User'
                token:
                  type: string

    RefreshResponse:
      allOf:
        - $ref: '#/components/schemas/Response'
        - type: object
          properties:
            data:
              type: object
              properties:
                token:
                  type: string
                expires_at:
                  type: string
                  format: date-time

    Document:
      type: object
      properties:
        id:
          type: string
        name:
          type: string
        owner_id:
          type: string
        description:
          type: string
        file_size:
          type: integer
          format: int64
        file_hash:
          type: string
        version:
          type: integer
        is_public:
          type: boolean
        created_at:
          type: string
          format: date-time
        updated_at:
          type: string
          format: date-time

    DocumentListResponse:
      allOf:
        - $ref: '#/components/schemas/Response'
        - type: object
          properties:
            data:
              type: object
              properties:
                items:
                  type: array
                  items:
                    $ref: '#/components/schemas/Document'
                total:
                  type: integer
                page:
                  type: integer
                page_size:
                  type: integer

    DocumentResponse:
      allOf:
        - $ref: '#/components/schemas/Response'
        - type: object
          properties:
            data:
              $ref: '#/components/schemas/Document'

    CreateDocumentRequest:
      type: object
      required: [name]
      properties:
        name:
          type: string
        file:
          type: string
          format: binary
          description: .fig 文件
        description:
          type: string
        is_public:
          type: boolean

    UpdateDocumentRequest:
      type: object
      properties:
        name:
          type: string
        description:
          type: string
        is_public:
          type: boolean

    SaveDocumentContentRequest:
      type: object
      required: [file]
      properties:
        file:
          type: string
          format: binary
        version:
          type: integer

    VersionConflictResponse:
      allOf:
        - $ref: '#/components/schemas/Response'
        - type: object
          properties:
            data:
              type: object
              properties:
                server_version:
                  type: integer
                client_version:
                  type: integer

    DocumentVersion:
      type: object
      properties:
        id:
          type: string
        document_id:
          type: string
        version:
          type: integer
        file_size:
          type: integer
          format: int64
        created_by:
          type: string
        description:
          type: string
        created_at:
          type: string
          format: date-time

    VersionListResponse:
      allOf:
        - $ref: '#/components/schemas/Response'
        - type: object
          properties:
            data:
              type: object
              properties:
                items:
                  type: array
                  items:
                    $ref: '#/components/schemas/DocumentVersion'
                total:
                  type: integer

    RestoreResponse:
      allOf:
        - $ref: '#/components/schemas/Response'
        - type: object
          properties:
            data:
              type: object
              properties:
                id:
                  type: string
                version:
                  type: integer
                restored_from:
                  type: integer
                updated_at:
                  type: string
                  format: date-time

    CollabRoom:
      type: object
      properties:
        id:
          type: string
        document_id:
          type: string
        name:
          type: string
        creator_id:
          type: string
        is_active:
          type: boolean
        expires_at:
          type: string
          format: date-time
          nullable: true
        created_at:
          type: string
          format: date-time

    CreateRoomRequest:
      type: object
      properties:
        document_id:
          type: string
        name:
          type: string
        expires_in_hours:
          type: integer
          default: 24

    RoomResponse:
      allOf:
        - $ref: '#/components/schemas/Response'
        - type: object
          properties:
            data:
              $ref: '#/components/schemas/CollabRoom'

    RoomListResponse:
      allOf:
        - $ref: '#/components/schemas/Response'
        - type: object
          properties:
            data:
              type: object
              properties:
                items:
                  type: array
                  items:
                    type: object
                    properties:
                      id:
                        type: string
                      document_id:
                        type: string
                      document_name:
                        type: string
                      name:
                        type: string
                      is_active:
                        type: boolean
                      created_at:
                        type: string
                        format: date-time
                total:
                  type: integer

    RoomStateResponse:
      allOf:
        - $ref: '#/components/schemas/Response'
        - type: object
          properties:
            data:
              type: object
              properties:
                room_id:
                  type: string
                state:
                  type: string
                  description: Base64 encoded Yjs state
                state_vec:
                  type: string
                  description: Base64 encoded Yjs state vector
                version:
                  type: integer
                  format: int64
                updated_at:
                  type: string
                  format: date-time

    UpdateRoomStateRequest:
      type: object
      properties:
        state:
          type: string
          description: Base64 encoded Yjs state
        state_vec:
          type: string
          description: Base64 encoded Yjs state vector
        version:
          type: integer
          format: int64

    UpdateRoomStateResponse:
      allOf:
        - $ref: '#/components/schemas/Response'
        - type: object
          properties:
            data:
              type: object
              properties:
                version:
                  type: integer
                  format: int64
                updated_at:
                  type: string
                  format: date-time

    SettingItem:
      type: object
      properties:
        key:
          type: string
        value:
          type: string

    SettingsResponse:
      allOf:
        - $ref: '#/components/schemas/Response'
        - type: object
          properties:
            data:
              type: object
              properties:
                settings:
                  type: array
                  items:
                    $ref: '#/components/schemas/SettingItem'

    SettingItemResponse:
      allOf:
        - $ref: '#/components/schemas/Response'
        - type: object
          properties:
            data:
              $ref: '#/components/schemas/SettingItem'

    BatchSettingsRequest:
      type: object
      required: [settings]
      properties:
        settings:
          type: array
          items:
            $ref: '#/components/schemas/SettingItem'

    BatchSettingsResponse:
      allOf:
        - $ref: '#/components/schemas/Response'
        - type: object
          properties:
            data:
              type: object
              properties:
                updated_count:
                  type: integer

    UploadImageRequest:
      type: object
      required: [file]
      properties:
        file:
          type: string
          format: binary
        document_id:
          type: string

    ImageResponse:
      allOf:
        - $ref: '#/components/schemas/Response'
        - type: object
          properties:
            data:
              type: object
              properties:
                hash:
                  type: string
                url:
                  type: string
                size:
                  type: integer
                  format: int64
                width:
                  type: integer
                height:
                  type: integer
                mime_type:
                  type: string

    CheckImagesResponse:
      allOf:
        - $ref: '#/components/schemas/Response'
        - type: object
          properties:
            data:
              type: object
              properties:
                existing:
                  type: array
                  items:
                    type: string
                missing:
                  type: array
                  items:
                    type: string
```

---

## 前端改造建议

### 1. 文档存储改造

将 `src/stores/editor.ts` 中的文件保存逻辑改为调用后端 API：

```typescript
// 原逻辑
async function writeFile(data: Uint8Array) {
    if (filePath && IS_TAURI) {
        const { writeFile: tauriWrite } = await import('@tauri-apps/plugin-fs')
        await tauriWrite(filePath, data)
    }
    if (fileHandle) {
        const writable = await fileHandle.createWritable()
        await writable.write(new Uint8Array(data))
        await writable.close()
    }
}

// 改造后
async function saveToCloud(data: Uint8Array) {
    const formData = new FormData()
    formData.append('file', new Blob([data]), documentName + '.fig')
    formData.append('version', String(state.version))
    
    const response = await fetch(`/api/v1/documents/${documentId}/content`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
    })
    
    const result = await response.json()
    if (result.code === 409) {
        // 版本冲突处理
        toast.error('文档已被其他用户修改，请刷新后重试')
        return
    }
    
    state.version = result.data.version
}
```

### 2. 协作房间改造

将 `src/composables/use-collab.ts` 中的 IndexedDB 持久化改为云端存储：

```typescript
// 原逻辑
persistence = new IndexeddbPersistence(`op-room-${roomId}`, ydoc)

// 改造后 - 断线重连时从服务器同步
async function syncStateFromServer(roomId: string) {
    const response = await fetch(`/api/v1/collab/rooms/${roomId}/state`, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    const result = await response.json()
    if (result.data.state) {
        const state = Uint8Array.from(atob(result.data.state), c => c.charCodeAt(0))
        Y.applyUpdate(ydoc, state)
    }
}

// 定期保存状态到服务器
async function saveStateToServer(roomId: string) {
    const state = Y.encodeStateAsUpdate(ydoc)
    const stateVec = Y.encodeStateVector(ydoc)
    
    await fetch(`/api/v1/collab/rooms/${roomId}/state`, {
        method: 'PUT',
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            state: btoa(String.fromCharCode(...state)),
            state_vec: btoa(String.fromCharCode(...stateVec)),
            version: currentVersion
        })
    })
}
```

### 3. 用户设置改造

将 `src/composables/use-chat.ts` 中的 localStorage 改为云端存储：

```typescript
// 原逻辑
const providerID = useLocalStorage<AIProviderID>('open-pencil:ai-provider', DEFAULT_AI_PROVIDER)
const apiKey = useLocalStorage('open-pencil:ai-key:openrouter', '')

// 改造后 - 创建 useCloudStorage composable
export function useCloudStorage() {
    async function getSetting(key: string): Promise<string | null> {
        const response = await fetch(`/api/v1/settings/${key}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        const result = await response.json()
        return result.data?.value ?? null
    }
    
    async function setSetting(key: string, value: string): Promise<void> {
        await fetch(`/api/v1/settings/${key}`, {
            method: 'PUT',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ value })
        })
    }
    
    return { getSetting, setSetting }
}
```

---

## 部署建议

### Docker Compose

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: openpencil
      POSTGRES_USER: openpencil
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U openpencil"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

  minio:
    image: minio/minio
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: ${MINIO_ACCESS_KEY}
      MINIO_ROOT_PASSWORD: ${MINIO_SECRET_KEY}
    volumes:
      - minio_data:/data
    ports:
      - "9001:9001"

  api:
    build: .
    ports:
      - "8080:8080"
    environment:
      DATABASE_URL: postgres://openpencil:${DB_PASSWORD}@postgres:5432/openpencil?sslmode=disable
      REDIS_URL: redis://redis:6379
      MINIO_ENDPOINT: minio:9000
      MINIO_ACCESS_KEY: ${MINIO_ACCESS_KEY}
      MINIO_SECRET_KEY: ${MINIO_SECRET_KEY}
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
      minio:
        condition: service_started

volumes:
  postgres_data:
  redis_data:
  minio_data:
```

### 环境变量

```bash
# .env
DATABASE_URL=postgres://openpencil:password@localhost:5432/openpencil?sslmode=disable
REDIS_URL=redis://localhost:6379
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=openpencil
MINIO_USE_SSL=false
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRES_IN=86400
PORT=8080
```

---

## 测试建议

### 单元测试

```go
// internal/service/document_test.go
package service_test

import (
    "bytes"
    "context"
    "testing"
    
    "github.com/stretchr/testify/assert"
    "github.com/stretchr/testify/mock"
    
    "open-pencil-server/internal/service"
)

type MockDocumentRepo struct {
    mock.Mock
}

func (m *MockDocumentRepo) Create(ctx context.Context, doc *model.Document) error {
    args := m.Called(ctx, doc)
    return args.Error(0)
}

type MockStorage struct {
    mock.Mock
}

func (m *MockStorage) Upload(ctx context.Context, reader io.Reader, path string) (string, int64, error) {
    args := m.Called(ctx, reader, path)
    return args.String(0), args.Get(1).(int64), args.Error(2)
}

func TestDocumentService_Create(t *testing.T) {
    repo := new(MockDocumentRepo)
    storage := new(MockStorage)
    svc := service.NewDocumentService(repo, storage)
    
    fileContent := []byte("test fig content")
    reader := bytes.NewReader(fileContent)
    
    storage.On("Upload", mock.Anything, mock.Anything, mock.Anything).
        Return("sha256:abc123", int64(len(fileContent)), nil)
    repo.On("Create", mock.Anything, mock.Anything).Return(nil)
    
    doc, err := svc.Create(context.Background(), "user123", service.CreateParams{
        Name:   "Test Doc",
        File:   reader,
    })
    
    assert.NoError(t, err)
    assert.Equal(t, "Test Doc", doc.Name)
    assert.Equal(t, int64(len(fileContent)), doc.FileSize)
    storage.AssertExpectations(t)
    repo.AssertExpectations(t)
}
```

### API 测试

```go
// internal/handler/document_test.go
package handler_test

import (
    "bytes"
    "mime/multipart"
    "net/http/httptest"
    "testing"
    
    "github.com/gin-gonic/gin"
    "github.com/stretchr/testify/assert"
    
    "open-pencil-server/internal/handler"
)

func TestDocumentHandler_Create(t *testing.T) {
    gin.SetMode(gin.TestMode)
    
    // Setup
    svc := &MockDocumentService{}
    h := handler.NewDocumentHandler(svc)
    
    router := gin.New()
    router.Use(func(c *gin.Context) {
        c.Set("user_id", "user123")
        c.Next()
    })
    router.POST("/documents", h.Create)
    
    // Create multipart form
    body := &bytes.Buffer{}
    writer := multipart.NewWriter(body)
    writer.WriteField("name", "Test Document")
    file, _ := writer.CreateFormFile("file", "test.fig")
    file.Write([]byte("fig content"))
    writer.Close()
    
    // Request
    req := httptest.NewRequest("POST", "/documents", body)
    req.Header.Set("Content-Type", writer.FormDataContentType())
    
    w := httptest.NewRecorder()
    router.ServeHTTP(w, req)
    
    // Assert
    assert.Equal(t, 200, w.Code)
}
```

---

## 总结

本文档定义了 OpenPencil 后端服务的完整 API 规范，包括：

1. **文档存储服务** - 替代本地文件系统存储
2. **协作房间服务** - 替代 IndexedDB 持久化
3. **用户设置服务** - 替代 localStorage 存储
4. **图片资源服务** - 文档中图片的云端存储

所有接口遵循统一的 `{"code": 200, "data": {}, "msg": ""}` 响应格式，并提供了完整的 OpenAPI 3.0 规范。