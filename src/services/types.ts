/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA DOC2TS                        ##
 * ##                                                           ##
 * ## AUTHOR: space-77                                          ##
 * ## SOURCE: https://github.com/space-77/doc2ts                ##
 * ---------------------------------------------------------------
 */

export namespace EnumLists {
  export enum Sort_by {
    name = "name",
    created_at = "created_at",
    updated_at = "updated_at",
  }
  export enum Sort_order {
    asc = "asc",
    desc = "desc",
  }
}

export namespace __common__ {
  export interface MundefinedBody {
    /**
     * @description 文档名称
     */
    name: any;
    /**
     * @description .fig 文件（可选）
     */
    file?: any;
    /**
     * @description 文档描述
     */
    description?: any;
    /**
     * @description 是否公开
     */
    is_public?: any;
  }

  export interface MundefinedBody1 {
    /**
     * @description .fig 文件
     */
    file: any;
    /**
     * @description 客户端版本号，用于乐观锁
     */
    version?: any;
  }

  export interface MundefinedBody2 {
    /**
     * @description 图片文件 (png/jpg/webp/svg)
     */
    file: any;
    /**
     * @description 关联的文档ID
     */
    document_id?: any;
  }

  export interface InternalhandlerLoginRequest {
    /**
     * @example user@example.com
     * @description 邮箱地址
     */
    email: string;
    /**
     * @example password123
     * @description 密码
     */
    password: string;
  }

  export interface InternalhandlerLoginResponse {
    /**
     * @example 200
     * @description 状态码
     */
    code?: number;
    /**
     * @description 认证数据
     */
    data?: {
      /**
       * @example usr_abc123_xxxxxxxxxxxxxxxx
       * @description 认证令牌
       */
      token?: string;
      /**
       * @description 用户信息
       */
      user?: {
        /**
         * @example https://example.com/avatar.png
         * @description 头像URL
         */
        avatar_url?: string;
        /**
         * @example 2024-01-01T00:00:00Z
         * @description 创建时间
         */
        created_at?: string;
        /**
         * @example user@example.com
         * @description 邮箱地址
         */
        email?: string;
        /**
         * @example usr_abc123
         * @description 用户ID
         */
        id?: string;
        /**
         * @example John Doe
         * @description 用户昵称
         */
        name?: string;
      };
    };
    /**
     * @example success
     * @description 提示消息
     */
    msg?: string;
  }

  export interface PkgresponseResponse {
    code?: number;
    data?: any;
    msg?: string;
  }

  export interface InternalhandlerRegisterRequest {
    /**
     * @example user@example.com
     * @description 邮箱地址
     */
    email: string;
    /**
     * @example John Doe
     * @description 用户昵称
     */
    name?: string;
    /**
     * @example password123
     * @description 密码，最少6位
     */
    password: string;
  }

  export interface InternalhandlerRegisterResponse {
    /**
     * @example 200
     * @description 状态码
     */
    code?: number;
    /**
     * @description 用户数据
     */
    data?: {
      /**
       * @example https://example.com/avatar.png
       * @description 头像URL
       */
      avatar_url?: string;
      /**
       * @example 2024-01-01T00:00:00Z
       * @description 创建时间
       */
      created_at?: string;
      /**
       * @example user@example.com
       * @description 邮箱地址
       */
      email?: string;
      /**
       * @example usr_abc123
       * @description 用户ID
       */
      id?: string;
      /**
       * @example John Doe
       * @description 用户昵称
       */
      name?: string;
    };
    /**
     * @example 注册成功
     * @description 提示消息
     */
    msg?: string;
  }

  export interface InternalhandlerCreateRoomRequest {
    /**
     * @example doc_abc123
     * @description 关联的文档ID
     */
    document_id?: string;
    /**
     * @example 24
     * @description 过期时间（小时）
     */
    expires_in_hours?: number;
    /**
     * @example Design Review Session
     * @description 房间名称
     */
    name?: string;
  }

  export interface InternalhandlerCreateRoomResponse {
    /**
     * @example 200
     * @description 状态码
     */
    code?: number;
    /**
     * @description 房间数据
     */
    data?: {
      /**
       * @example 2024-01-01T00:00:00Z
       * @description 创建时间
       */
      created_at?: string;
      /**
       * @example usr_abc123
       * @description 创建者ID
       */
      creator_id?: string;
      /**
       * @example doc_abc123
       * @description 关联的文档ID
       */
      document_id?: string;
      /**
       * @example 2024-01-02T00:00:00Z
       * @description 过期时间
       */
      expires_at?: string;
      /**
       * @example room_xyz789
       * @description 房间ID
       */
      id?: string;
      /**
       * @example true
       * @description 是否活跃
       */
      is_active?: boolean;
      /**
       * @example Design Review Session
       * @description 房间名称
       */
      name?: string;
      /**
       * @example 2024-01-01T00:00:00Z
       * @description 更新时间
       */
      updated_at?: string;
    };
    /**
     * @example 创建成功
     * @description 提示消息
     */
    msg?: string;
  }

  export interface InternalhandlerUserRoomListResponse {
    /**
     * @example 200
     * @description 状态码
     */
    code?: number;
    /**
     * @description 房间列表数据
     */
    data?: {
      /**
       * @description 房间列表
       */
      items?: Array<__common__.InternalhandlerUserRoomItem>;
      /**
       * @example 2
       * @description 总数量
       */
      total?: number;
    };
    /**
     * @example 获取成功
     * @description 提示消息
     */
    msg?: string;
  }

  export interface InternalhandlerGetRoomResponse {
    /**
     * @example 200
     * @description 状态码
     */
    code?: number;
    /**
     * @description 房间数据
     */
    data?: {
      /**
       * @example 2024-01-01T00:00:00Z
       * @description 创建时间
       */
      created_at?: string;
      /**
       * @example usr_abc123
       * @description 创建者ID
       */
      creator_id?: string;
      /**
       * @example doc_abc123
       * @description 关联的文档ID
       */
      document_id?: string;
      /**
       * @example 2024-01-02T00:00:00Z
       * @description 过期时间
       */
      expires_at?: string;
      /**
       * @example room_xyz789
       * @description 房间ID
       */
      id?: string;
      /**
       * @example true
       * @description 是否活跃
       */
      is_active?: boolean;
      /**
       * @example Design Review Session
       * @description 房间名称
       */
      name?: string;
      /**
       * @example 2024-01-01T00:00:00Z
       * @description 更新时间
       */
      updated_at?: string;
    };
    /**
     * @example 获取成功
     * @description 提示消息
     */
    msg?: string;
  }

  export interface InternalhandlerRoomStateResponse {
    /**
     * @example 200
     * @description 状态码
     */
    code?: number;
    /**
     * @description 房间状态数据
     */
    data?: {
      /**
       * @example room_xyz789
       * @description 房间ID
       */
      room_id?: string;
      /**
       * @example base64-encoded-yjs-state
       * @description Yjs编码状态（Base64）
       */
      state?: string;
      /**
       * @example base64-encoded-yjs-state-vector
       * @description Yjs状态向量（Base64）
       */
      state_vec?: string;
      /**
       * @example 2024-01-01T00:30:00Z
       * @description 更新时间
       */
      updated_at?: string;
      /**
       * @example 12345
       * @description 版本号
       */
      version?: number;
    };
    /**
     * @example 获取成功
     * @description 提示消息
     */
    msg?: string;
  }

  export interface InternalhandlerUpdateRoomStateRequest {
    /**
     * @example base64-encoded-yjs-state
     * @description Yjs编码状态（Base64）
     */
    state?: string;
    /**
     * @example base64-encoded-yjs-state-vector
     * @description Yjs状态向量（Base64）
     */
    state_vec?: string;
    /**
     * @example 12345
     * @description 版本号
     */
    version?: number;
  }

  export interface InternalhandlerUpdateRoomStateResponse {
    /**
     * @example 200
     * @description 状态码
     */
    code?: number;
    /**
     * @description 更新状态数据
     */
    data?: {
      /**
       * @example 2024-01-01T00:31:00Z
       * @description 更新时间
       */
      updated_at?: string;
      /**
       * @example 12346
       * @description 版本号
       */
      version?: number;
    };
    /**
     * @example 更新成功
     * @description 提示消息
     */
    msg?: string;
  }

  export interface InternalhandlerDocumentListResponse {
    /**
     * @example 200
     * @description 状态码
     */
    code?: number;
    /**
     * @description 文档列表数据
     */
    data?: {
      /**
       * @description 文档列表
       */
      items?: Array<__common__.InternalhandlerDocumentResponse>;
      /**
       * @example 1
       * @description 当前页码
       */
      page?: number;
      /**
       * @example 20
       * @description 每页数量
       */
      page_size?: number;
      /**
       * @example 10
       * @description 总数量
       */
      total?: number;
    };
    /**
     * @example success
     * @description 提示消息
     */
    msg?: string;
  }

  export interface InternalhandlerCreateDocumentResponse {
    /**
     * @example 200
     * @description 状态码
     */
    code?: number;
    /**
     * @description 文档数据
     */
    data?: {
      /**
       * @example 2024-01-01T00:00:00Z
       * @description 创建时间
       */
      created_at?: string;
      /**
       * @example A sample design document
       * @description 文档描述
       */
      description?: string;
      /**
       * @example sha256:abc123...
       * @description 文件哈希值
       */
      file_hash?: string;
      /**
       * @example 102400
       * @description 文件大小（字节）
       */
      file_size?: number;
      /**
       * @example doc_abc123
       * @description 文档ID
       */
      id?: string;
      /**
       * @description 是否公开
       */
      is_public?: boolean;
      /**
       * @example My Design
       * @description 文档名称
       */
      name?: string;
      /**
       * @example usr_abc123
       * @description 所有者ID
       */
      owner_id?: string;
      /**
       * @example thumbnails/doc_abc123
       * @description 缩略图路径
       */
      thumbnail_path?: string;
      /**
       * @example 2024-01-01T00:00:00Z
       * @description 更新时间
       */
      updated_at?: string;
      /**
       * @example 1
       * @description 文档版本号
       */
      version?: number;
    };
    /**
     * @example 创建成功
     * @description 提示消息
     */
    msg?: string;
  }

  export interface InternalhandlerGetDocumentResponse {
    /**
     * @example 200
     * @description 状态码
     */
    code?: number;
    /**
     * @description 文档数据
     */
    data?: {
      /**
       * @example 2024-01-01T00:00:00Z
       * @description 创建时间
       */
      created_at?: string;
      /**
       * @example A sample design document
       * @description 文档描述
       */
      description?: string;
      /**
       * @example sha256:abc123...
       * @description 文件哈希值
       */
      file_hash?: string;
      /**
       * @example 102400
       * @description 文件大小（字节）
       */
      file_size?: number;
      /**
       * @example doc_abc123
       * @description 文档ID
       */
      id?: string;
      /**
       * @description 是否公开
       */
      is_public?: boolean;
      /**
       * @example My Design
       * @description 文档名称
       */
      name?: string;
      /**
       * @example usr_abc123
       * @description 所有者ID
       */
      owner_id?: string;
      /**
       * @example thumbnails/doc_abc123
       * @description 缩略图路径
       */
      thumbnail_path?: string;
      /**
       * @example 2024-01-01T00:00:00Z
       * @description 更新时间
       */
      updated_at?: string;
      /**
       * @example 1
       * @description 文档版本号
       */
      version?: number;
    };
    /**
     * @example 获取成功
     * @description 提示消息
     */
    msg?: string;
  }

  export interface InternalhandlerUpdateDocumentRequest {
    /**
     * @example Updated description
     * @description 文档描述
     */
    description?: string;
    /**
     * @example true
     * @description 是否公开
     */
    is_public?: boolean;
    /**
     * @example New Name
     * @description 文档名称
     */
    name?: string;
  }

  export interface InternalhandlerUpdateDocumentResponse {
    /**
     * @example 200
     * @description 状态码
     */
    code?: number;
    /**
     * @description 文档数据
     */
    data?: {
      /**
       * @example 2024-01-01T00:00:00Z
       * @description 创建时间
       */
      created_at?: string;
      /**
       * @example A sample design document
       * @description 文档描述
       */
      description?: string;
      /**
       * @example sha256:abc123...
       * @description 文件哈希值
       */
      file_hash?: string;
      /**
       * @example 102400
       * @description 文件大小（字节）
       */
      file_size?: number;
      /**
       * @example doc_abc123
       * @description 文档ID
       */
      id?: string;
      /**
       * @description 是否公开
       */
      is_public?: boolean;
      /**
       * @example My Design
       * @description 文档名称
       */
      name?: string;
      /**
       * @example usr_abc123
       * @description 所有者ID
       */
      owner_id?: string;
      /**
       * @example thumbnails/doc_abc123
       * @description 缩略图路径
       */
      thumbnail_path?: string;
      /**
       * @example 2024-01-01T00:00:00Z
       * @description 更新时间
       */
      updated_at?: string;
      /**
       * @example 1
       * @description 文档版本号
       */
      version?: number;
    };
    /**
     * @example 更新成功
     * @description 提示消息
     */
    msg?: string;
  }

  export interface InternalhandlerSaveContentResponse {
    /**
     * @example 200
     * @description 状态码
     */
    code?: number;
    /**
     * @description 文档数据
     */
    data?: {
      /**
       * @example 2024-01-01T00:00:00Z
       * @description 创建时间
       */
      created_at?: string;
      /**
       * @example A sample design document
       * @description 文档描述
       */
      description?: string;
      /**
       * @example sha256:abc123...
       * @description 文件哈希值
       */
      file_hash?: string;
      /**
       * @example 102400
       * @description 文件大小（字节）
       */
      file_size?: number;
      /**
       * @example doc_abc123
       * @description 文档ID
       */
      id?: string;
      /**
       * @description 是否公开
       */
      is_public?: boolean;
      /**
       * @example My Design
       * @description 文档名称
       */
      name?: string;
      /**
       * @example usr_abc123
       * @description 所有者ID
       */
      owner_id?: string;
      /**
       * @example thumbnails/doc_abc123
       * @description 缩略图路径
       */
      thumbnail_path?: string;
      /**
       * @example 2024-01-01T00:00:00Z
       * @description 更新时间
       */
      updated_at?: string;
      /**
       * @example 1
       * @description 文档版本号
       */
      version?: number;
    };
    /**
     * @example 保存成功
     * @description 提示消息
     */
    msg?: string;
  }

  export interface InternalhandlerVersionConflictResponse {
    /**
     * @example 409
     * @description 状态码
     */
    code?: number;
    /**
     * @description 版本冲突数据
     */
    data?: {
      /**
       * @example 3
       * @description 客户端版本号
       */
      client_version?: number;
      /**
       * @example 5
       * @description 服务器版本号
       */
      server_version?: number;
    };
    /**
     * @example 文档已被其他用户修改，请刷新后重试
     * @description 提示消息
     */
    msg?: string;
  }

  export interface InternalhandlerCopyDocumentRequest {
    /**
     * @example Copy of My Design
     * @description 新文档名称
     */
    name?: string;
  }

  export interface InternalhandlerCopyDocumentResponse {
    /**
     * @example 200
     * @description 状态码
     */
    code?: number;
    /**
     * @description 文档数据
     */
    data?: {
      /**
       * @example 2024-01-01T00:00:00Z
       * @description 创建时间
       */
      created_at?: string;
      /**
       * @example A sample design document
       * @description 文档描述
       */
      description?: string;
      /**
       * @example sha256:abc123...
       * @description 文件哈希值
       */
      file_hash?: string;
      /**
       * @example 102400
       * @description 文件大小（字节）
       */
      file_size?: number;
      /**
       * @example doc_abc123
       * @description 文档ID
       */
      id?: string;
      /**
       * @description 是否公开
       */
      is_public?: boolean;
      /**
       * @example My Design
       * @description 文档名称
       */
      name?: string;
      /**
       * @example usr_abc123
       * @description 所有者ID
       */
      owner_id?: string;
      /**
       * @example thumbnails/doc_abc123
       * @description 缩略图路径
       */
      thumbnail_path?: string;
      /**
       * @example 2024-01-01T00:00:00Z
       * @description 更新时间
       */
      updated_at?: string;
      /**
       * @example 1
       * @description 文档版本号
       */
      version?: number;
    };
    /**
     * @example 复制成功
     * @description 提示消息
     */
    msg?: string;
  }

  export interface InternalhandlerRenameDocumentRequest {
    /**
     * @example New Name
     * @description 新名称
     */
    name?: string;
  }

  export interface InternalhandlerRenameDocumentResponse {
    /**
     * @example 200
     * @description 状态码
     */
    code?: number;
    /**
     * @description 文档数据
     */
    data?: {
      /**
       * @example 2024-01-01T00:00:00Z
       * @description 创建时间
       */
      created_at?: string;
      /**
       * @example A sample design document
       * @description 文档描述
       */
      description?: string;
      /**
       * @example sha256:abc123...
       * @description 文件哈希值
       */
      file_hash?: string;
      /**
       * @example 102400
       * @description 文件大小（字节）
       */
      file_size?: number;
      /**
       * @example doc_abc123
       * @description 文档ID
       */
      id?: string;
      /**
       * @description 是否公开
       */
      is_public?: boolean;
      /**
       * @example My Design
       * @description 文档名称
       */
      name?: string;
      /**
       * @example usr_abc123
       * @description 所有者ID
       */
      owner_id?: string;
      /**
       * @example thumbnails/doc_abc123
       * @description 缩略图路径
       */
      thumbnail_path?: string;
      /**
       * @example 2024-01-01T00:00:00Z
       * @description 更新时间
       */
      updated_at?: string;
      /**
       * @example 1
       * @description 文档版本号
       */
      version?: number;
    };
    /**
     * @example 改名成功
     * @description 提示消息
     */
    msg?: string;
  }

  export interface InternalhandlerSetThumbnailResponse {
    /**
     * @example 200
     * @description 状态码
     */
    code?: number;
    /**
     * @description 文档数据
     */
    data?: {
      /**
       * @example 2024-01-01T00:00:00Z
       * @description 创建时间
       */
      created_at?: string;
      /**
       * @example A sample design document
       * @description 文档描述
       */
      description?: string;
      /**
       * @example sha256:abc123...
       * @description 文件哈希值
       */
      file_hash?: string;
      /**
       * @example 102400
       * @description 文件大小（字节）
       */
      file_size?: number;
      /**
       * @example doc_abc123
       * @description 文档ID
       */
      id?: string;
      /**
       * @description 是否公开
       */
      is_public?: boolean;
      /**
       * @example My Design
       * @description 文档名称
       */
      name?: string;
      /**
       * @example usr_abc123
       * @description 所有者ID
       */
      owner_id?: string;
      /**
       * @example thumbnails/doc_abc123
       * @description 缩略图路径
       */
      thumbnail_path?: string;
      /**
       * @example 2024-01-01T00:00:00Z
       * @description 更新时间
       */
      updated_at?: string;
      /**
       * @example 1
       * @description 文档版本号
       */
      version?: number;
    };
    /**
     * @example 设置成功
     * @description 提示消息
     */
    msg?: string;
  }

  export interface InternalhandlerVersionListResponse {
    /**
     * @example 200
     * @description 状态码
     */
    code?: number;
    /**
     * @description 版本列表数据
     */
    data?: {
      /**
       * @description 版本列表
       */
      items?: Array<__common__.InternalhandlerDocumentVersionResponse>;
      /**
       * @example 10
       * @description 总数量
       */
      total?: number;
    };
    /**
     * @example 获取成功
     * @description 提示消息
     */
    msg?: string;
  }

  export interface InternalhandlerRestoreVersionResponse {
    /**
     * @example 200
     * @description 状态码
     */
    code?: number;
    /**
     * @description 恢复版本数据
     */
    data?: {
      /**
       * @example doc_abc123
       * @description 文档ID
       */
      id?: string;
      /**
       * @example 2
       * @description 恢复来源版本号
       */
      restored_from?: number;
      /**
       * @example 2024-01-04T00:00:00Z
       * @description 更新时间
       */
      updated_at?: string;
      /**
       * @example 4
       * @description 当前版本号
       */
      version?: number;
    };
    /**
     * @example 恢复成功
     * @description 提示消息
     */
    msg?: string;
  }

  export interface InternalhandlerUploadImageResponse {
    /**
     * @example 200
     * @description 状态码
     */
    code?: number;
    /**
     * @description 上传图片数据
     */
    data?: {
      /**
       * @example sha256:abc123...
       * @description 图片哈希值
       */
      hash?: string;
      /**
       * @example 600
       * @description 图片高度（像素）
       */
      height?: number;
      /**
       * @example image/png
       * @description MIME类型
       */
      mime_type?: string;
      /**
       * @example 102400
       * @description 文件大小（字节）
       */
      size?: number;
      /**
       * @example /api/v1/images/sha256:abc123...
       * @description 图片访问URL
       */
      url?: string;
      /**
       * @example 800
       * @description 图片宽度（像素）
       */
      width?: number;
    };
    /**
     * @example 上传成功
     * @description 提示消息
     */
    msg?: string;
  }

  export interface InternalhandlerCheckImagesRequest {
    /**
     * @description 图片哈希值列表
     */
    hashes?: Array<string>;
  }

  export interface InternalhandlerCheckImagesResponse {
    /**
     * @example 200
     * @description 状态码
     */
    code?: number;
    /**
     * @description 检查结果数据
     */
    data?: {
      /**
       * @example sha256:abc123...
       * @description 已存在的图片哈希列表
       */
      existing?: Array<string>;
      /**
       * @example sha256:def456...
       * @description 不存在的图片哈希列表
       */
      missing?: Array<string>;
    };
    /**
     * @example 检查完成
     * @description 提示消息
     */
    msg?: string;
  }

  export interface InternalhandlerGetAllSettingsResponse {
    /**
     * @example 200
     * @description 状态码
     */
    code?: number;
    /**
     * @description 设置数据
     */
    data?: {
      /**
       * @description 设置项列表
       */
      settings?: Array<__common__.InternalhandlerSettingItem>;
    };
    /**
     * @example 获取成功
     * @description 提示消息
     */
    msg?: string;
  }

  export interface InternalhandlerBatchSetRequest {
    /**
     * @description 批量设置项列表
     */
    settings?: Array<__common__.InternalhandlerBatchSettingItem>;
  }

  export interface InternalhandlerBatchSetResponse {
    /**
     * @example 200
     * @description 状态码
     */
    code?: number;
    /**
     * @description 批量设置数据
     */
    data?: {
      /**
       * @example 3
       * @description 更新的设置项数量
       */
      updated_count?: number;
    };
    /**
     * @example 设置成功
     * @description 提示消息
     */
    msg?: string;
  }

  export interface InternalhandlerGetSettingResponse {
    /**
     * @example 200
     * @description 状态码
     */
    code?: number;
    /**
     * @description 设置数据
     */
    data?: {
      /**
       * @example ai-provider
       * @description 设置项键名
       */
      key?: string;
      /**
       * @example openrouter
       * @description 设置项值
       */
      value?: string;
    };
    /**
     * @example 获取成功
     * @description 提示消息
     */
    msg?: string;
  }

  export interface InternalhandlerSetSettingRequest {
    /**
     * @example anthropic
     * @description 设置项值
     */
    value?: string;
  }

  export interface InternalhandlerSetSettingResponse {
    /**
     * @example 200
     * @description 状态码
     */
    code?: number;
    /**
     * @description 设置数据
     */
    data?: {
      /**
       * @example ai-provider
       * @description 设置项键名
       */
      key?: string;
      /**
       * @example 2024-01-01T00:00:00Z
       * @description 更新时间
       */
      updated_at?: string;
      /**
       * @example anthropic
       * @description 设置项值
       */
      value?: string;
    };
    /**
     * @example 设置成功
     * @description 提示消息
     */
    msg?: string;
  }

  export interface InternalhandlerUserResponse {
    /**
     * @example https://example.com/avatar.png
     * @description 头像URL
     */
    avatar_url?: string;
    /**
     * @example 2024-01-01T00:00:00Z
     * @description 创建时间
     */
    created_at?: string;
    /**
     * @example user@example.com
     * @description 邮箱地址
     */
    email?: string;
    /**
     * @example usr_abc123
     * @description 用户ID
     */
    id?: string;
    /**
     * @example John Doe
     * @description 用户昵称
     */
    name?: string;
  }

  export interface InternalhandlerBatchSettingItem {
    /**
     * @example ai-provider
     * @description 设置项键名
     */
    key?: string;
    /**
     * @example anthropic
     * @description 设置项值
     */
    value?: string;
  }

  export interface InternalhandlerBatchSetData {
    /**
     * @example 3
     * @description 更新的设置项数量
     */
    updated_count?: number;
  }

  export interface InternalhandlerCheckImagesData {
    /**
     * @example sha256:abc123...
     * @description 已存在的图片哈希列表
     */
    existing?: Array<string>;
    /**
     * @example sha256:def456...
     * @description 不存在的图片哈希列表
     */
    missing?: Array<string>;
  }

  export interface InternalhandlerDocumentResponse {
    /**
     * @example 2024-01-01T00:00:00Z
     * @description 创建时间
     */
    created_at?: string;
    /**
     * @example A sample design document
     * @description 文档描述
     */
    description?: string;
    /**
     * @example sha256:abc123...
     * @description 文件哈希值
     */
    file_hash?: string;
    /**
     * @example 102400
     * @description 文件大小（字节）
     */
    file_size?: number;
    /**
     * @example doc_abc123
     * @description 文档ID
     */
    id?: string;
    /**
     * @description 是否公开
     */
    is_public?: boolean;
    /**
     * @example My Design
     * @description 文档名称
     */
    name?: string;
    /**
     * @example usr_abc123
     * @description 所有者ID
     */
    owner_id?: string;
    /**
     * @example thumbnails/doc_abc123
     * @description 缩略图路径
     */
    thumbnail_path?: string;
    /**
     * @example 2024-01-01T00:00:00Z
     * @description 更新时间
     */
    updated_at?: string;
    /**
     * @example 1
     * @description 文档版本号
     */
    version?: number;
  }

  export interface InternalhandlerCollabRoomResponse {
    /**
     * @example 2024-01-01T00:00:00Z
     * @description 创建时间
     */
    created_at?: string;
    /**
     * @example usr_abc123
     * @description 创建者ID
     */
    creator_id?: string;
    /**
     * @example doc_abc123
     * @description 关联的文档ID
     */
    document_id?: string;
    /**
     * @example 2024-01-02T00:00:00Z
     * @description 过期时间
     */
    expires_at?: string;
    /**
     * @example room_xyz789
     * @description 房间ID
     */
    id?: string;
    /**
     * @example true
     * @description 是否活跃
     */
    is_active?: boolean;
    /**
     * @example Design Review Session
     * @description 房间名称
     */
    name?: string;
    /**
     * @example 2024-01-01T00:00:00Z
     * @description 更新时间
     */
    updated_at?: string;
  }

  export interface InternalhandlerDocumentListData {
    /**
     * @description 文档列表
     */
    items?: Array<__common__.InternalhandlerDocumentResponse>;
    /**
     * @example 1
     * @description 当前页码
     */
    page?: number;
    /**
     * @example 20
     * @description 每页数量
     */
    page_size?: number;
    /**
     * @example 10
     * @description 总数量
     */
    total?: number;
  }

  export interface InternalhandlerSettingItem {
    /**
     * @example ai-provider
     * @description 设置项键名
     */
    key?: string;
    /**
     * @example openrouter
     * @description 设置项值
     */
    value?: string;
  }

  export interface InternalhandlerGetAllSettingsData {
    /**
     * @description 设置项列表
     */
    settings?: Array<__common__.InternalhandlerSettingItem>;
  }

  export interface InternalhandlerGetSettingData {
    /**
     * @example ai-provider
     * @description 设置项键名
     */
    key?: string;
    /**
     * @example openrouter
     * @description 设置项值
     */
    value?: string;
  }

  export interface InternalhandlerAuthData {
    /**
     * @example usr_abc123_xxxxxxxxxxxxxxxx
     * @description 认证令牌
     */
    token?: string;
    /**
     * @description 用户信息
     */
    user?: {
      /**
       * @example https://example.com/avatar.png
       * @description 头像URL
       */
      avatar_url?: string;
      /**
       * @example 2024-01-01T00:00:00Z
       * @description 创建时间
       */
      created_at?: string;
      /**
       * @example user@example.com
       * @description 邮箱地址
       */
      email?: string;
      /**
       * @example usr_abc123
       * @description 用户ID
       */
      id?: string;
      /**
       * @example John Doe
       * @description 用户昵称
       */
      name?: string;
      /**
       * @example https://example.com/avatar.png
       * @description 头像URL
       */
      avatar_url?: string;
      /**
       * @example 2024-01-01T00:00:00Z
       * @description 创建时间
       */
      created_at?: string;
      /**
       * @example user@example.com
       * @description 邮箱地址
       */
      email?: string;
      /**
       * @example usr_abc123
       * @description 用户ID
       */
      id?: string;
      /**
       * @example John Doe
       * @description 用户昵称
       */
      name?: string;
    };
  }

  export interface InternalhandlerRestoreVersionData {
    /**
     * @example doc_abc123
     * @description 文档ID
     */
    id?: string;
    /**
     * @example 2
     * @description 恢复来源版本号
     */
    restored_from?: number;
    /**
     * @example 2024-01-04T00:00:00Z
     * @description 更新时间
     */
    updated_at?: string;
    /**
     * @example 4
     * @description 当前版本号
     */
    version?: number;
  }

  export interface InternalhandlerRoomStateData {
    /**
     * @example room_xyz789
     * @description 房间ID
     */
    room_id?: string;
    /**
     * @example base64-encoded-yjs-state
     * @description Yjs编码状态（Base64）
     */
    state?: string;
    /**
     * @example base64-encoded-yjs-state-vector
     * @description Yjs状态向量（Base64）
     */
    state_vec?: string;
    /**
     * @example 2024-01-01T00:30:00Z
     * @description 更新时间
     */
    updated_at?: string;
    /**
     * @example 12345
     * @description 版本号
     */
    version?: number;
  }

  export interface InternalhandlerSetSettingData {
    /**
     * @example ai-provider
     * @description 设置项键名
     */
    key?: string;
    /**
     * @example 2024-01-01T00:00:00Z
     * @description 更新时间
     */
    updated_at?: string;
    /**
     * @example anthropic
     * @description 设置项值
     */
    value?: string;
  }

  export interface InternalhandlerUpdateRoomStateData {
    /**
     * @example 2024-01-01T00:31:00Z
     * @description 更新时间
     */
    updated_at?: string;
    /**
     * @example 12346
     * @description 版本号
     */
    version?: number;
  }

  export interface InternalhandlerUploadImageData {
    /**
     * @example sha256:abc123...
     * @description 图片哈希值
     */
    hash?: string;
    /**
     * @example 600
     * @description 图片高度（像素）
     */
    height?: number;
    /**
     * @example image/png
     * @description MIME类型
     */
    mime_type?: string;
    /**
     * @example 102400
     * @description 文件大小（字节）
     */
    size?: number;
    /**
     * @example /api/v1/images/sha256:abc123...
     * @description 图片访问URL
     */
    url?: string;
    /**
     * @example 800
     * @description 图片宽度（像素）
     */
    width?: number;
  }

  export interface InternalhandlerUserRoomItem {
    /**
     * @example 2024-01-01T00:00:00Z
     * @description 创建时间
     */
    created_at?: string;
    /**
     * @example doc_abc123
     * @description 关联的文档ID
     */
    document_id?: string;
    /**
     * @example My Design
     * @description 文档名称
     */
    document_name?: string;
    /**
     * @example room_xyz789
     * @description 房间ID
     */
    id?: string;
    /**
     * @example true
     * @description 是否活跃
     */
    is_active?: boolean;
    /**
     * @example Design Review Session
     * @description 房间名称
     */
    name?: string;
  }

  export interface InternalhandlerUserRoomListData {
    /**
     * @description 房间列表
     */
    items?: Array<__common__.InternalhandlerUserRoomItem>;
    /**
     * @example 2
     * @description 总数量
     */
    total?: number;
  }

  export interface InternalhandlerVersionConflictData {
    /**
     * @example 3
     * @description 客户端版本号
     */
    client_version?: number;
    /**
     * @example 5
     * @description 服务器版本号
     */
    server_version?: number;
  }

  export interface InternalhandlerDocumentVersionResponse {
    /**
     * @example 2024-01-03T00:00:00Z
     * @description 创建时间
     */
    created_at?: string;
    /**
     * @example usr_abc123
     * @description 创建者ID
     */
    created_by?: string;
    /**
     * @example Auto save
     * @description 版本描述
     */
    description?: string;
    /**
     * @example doc_abc123
     * @description 文档ID
     */
    document_id?: string;
    /**
     * @example sha256:ghi789...
     * @description 文件哈希值
     */
    file_hash?: string;
    /**
     * @example 204800
     * @description 文件大小（字节）
     */
    file_size?: number;
    /**
     * @example ver_abc123
     * @description 版本ID
     */
    id?: string;
    /**
     * @example 3
     * @description 版本号
     */
    version?: number;
  }

  export interface InternalhandlerVersionListData {
    /**
     * @description 版本列表
     */
    items?: Array<__common__.InternalhandlerDocumentVersionResponse>;
    /**
     * @example 10
     * @description 总数量
     */
    total?: number;
  }
}

export namespace Auth {
  export interface PostLoginRes
    extends __common__.InternalhandlerLoginResponse {}

  /**
   * @description 登录请求参数
   */
  export interface PostLoginBody
    extends __common__.InternalhandlerLoginRequest {}

  export interface PostRegisterRes
    extends __common__.InternalhandlerRegisterResponse {}

  /**
   * @description 注册请求参数
   */
  export interface PostRegisterBody
    extends __common__.InternalhandlerRegisterRequest {}

  export type RPostLogin = Promise<
    [
      any,
      __common__.InternalhandlerLoginResponse["data"],
      __common__.InternalhandlerLoginResponse
    ]
  >;
  export type RPostRegister = Promise<
    [
      any,
      __common__.InternalhandlerRegisterResponse["data"],
      __common__.InternalhandlerRegisterResponse
    ]
  >;
}

export namespace Collaboration {
  export interface PostRoomsRes
    extends __common__.InternalhandlerCreateRoomResponse {}

  /**
   * @description 创建房间请求参数
   */
  export interface PostRoomsBody
    extends __common__.InternalhandlerCreateRoomRequest {}

  export interface GetRoomsMyRes
    extends __common__.InternalhandlerUserRoomListResponse {}

  export interface GetRoomsByIdRes
    extends __common__.InternalhandlerGetRoomResponse {}

  export interface GetRoomsByIdParams {
    /**
     * @example "room_xyz789"
     * @description 房间ID
     */
    id: string;
  }

  export interface PostRoomsByIdCloseRes
    extends __common__.PkgresponseResponse {}

  export interface PostRoomsByIdCloseParams {
    /**
     * @example "room_xyz789"
     * @description 房间ID
     */
    id: string;
  }

  export interface GetRoomsByIdStateRes
    extends __common__.InternalhandlerRoomStateResponse {}

  export interface GetRoomsByIdStateParams {
    /**
     * @example "room_xyz789"
     * @description 房间ID
     */
    id: string;
  }

  export interface PutRoomsByIdStateRes
    extends __common__.InternalhandlerUpdateRoomStateResponse {}

  export interface PutRoomsByIdStateParams {
    /**
     * @example "room_xyz789"
     * @description 房间ID
     */
    id: string;
  }

  /**
   * @description 更新状态请求参数
   */
  export interface PutRoomsByIdStateBody
    extends __common__.InternalhandlerUpdateRoomStateRequest {}

  export type RPostRooms = Promise<
    [
      any,
      __common__.InternalhandlerCreateRoomResponse["data"],
      __common__.InternalhandlerCreateRoomResponse
    ]
  >;
  export type RGetRoomsMy = Promise<
    [
      any,
      __common__.InternalhandlerUserRoomListResponse["data"],
      __common__.InternalhandlerUserRoomListResponse
    ]
  >;
  export type RGetRoomsById = Promise<
    [
      any,
      __common__.InternalhandlerGetRoomResponse["data"],
      __common__.InternalhandlerGetRoomResponse
    ]
  >;
  export type RGetRoomsByIdState = Promise<
    [
      any,
      __common__.InternalhandlerRoomStateResponse["data"],
      __common__.InternalhandlerRoomStateResponse
    ]
  >;
  export type PutRoomsByIdStateParams1 = PutRoomsByIdStateParams &
    __common__.InternalhandlerUpdateRoomStateRequest;

  export type RPutRoomsByIdState = Promise<
    [
      any,
      __common__.InternalhandlerUpdateRoomStateResponse["data"],
      __common__.InternalhandlerUpdateRoomStateResponse
    ]
  >;
  export type RPostRoomsByIdClose = Promise<
    [
      any,
      __common__.PkgresponseResponse["data"],
      __common__.PkgresponseResponse
    ]
  >;
}

export namespace Documents {
  export interface GetDocumentsRes
    extends __common__.InternalhandlerDocumentListResponse {}

  export interface GetDocumentsParams {
    /**
     * @description 页码，从1开始
     */
    page?: number;
    /**
     * @description 每页数量，最大100
     */
    page_size?: number;
    /**
     * @description 排序字段
     */
    sort_by?: EnumLists.Sort_by;
    /**
     * @description 排序方向
     */
    sort_order?: EnumLists.Sort_order;
    /**
     * @description 搜索关键词
     */
    search?: string;
  }

  export interface PostDocumentsRes
    extends __common__.InternalhandlerCreateDocumentResponse {}

  /**
   * @description MundefinedBody
   */
  export interface PostDocumentsBody extends __common__.MundefinedBody {}

  export interface GetDocumentsByIdRes
    extends __common__.InternalhandlerGetDocumentResponse {}

  export interface GetDocumentsByIdParams {
    /**
     * @example "doc_abc123"
     * @description 文档ID
     */
    id: string;
  }

  export interface PutDocumentsByIdRes
    extends __common__.InternalhandlerUpdateDocumentResponse {}

  export interface PutDocumentsByIdParams {
    /**
     * @example "doc_abc123"
     * @description 文档ID
     */
    id: string;
  }

  /**
   * @description 更新请求参数
   */
  export interface PutDocumentsByIdBody
    extends __common__.InternalhandlerUpdateDocumentRequest {}

  export interface DeleteDocumentsByIdRes
    extends __common__.PkgresponseResponse {}

  export interface DeleteDocumentsByIdParams {
    /**
     * @example "doc_abc123"
     * @description 文档ID
     */
    id: string;
  }

  export interface PutDocumentsByIdContentRes
    extends __common__.InternalhandlerSaveContentResponse {}

  export interface PutDocumentsByIdContentParams {
    /**
     * @example "doc_abc123"
     * @description 文档ID
     */
    id: string;
  }

  /**
   * @description MundefinedBody1
   */
  export interface PutDocumentsByIdContentBody
    extends __common__.MundefinedBody1 {}

  export interface PostDocumentsByIdCopyRes
    extends __common__.InternalhandlerCopyDocumentResponse {}

  export interface PostDocumentsByIdCopyParams {
    /**
     * @example "doc_abc123"
     * @description 文档ID
     */
    id: string;
  }

  /**
   * @description 复制请求参数
   */
  export interface PostDocumentsByIdCopyBody
    extends __common__.InternalhandlerCopyDocumentRequest {}

  export interface GetDocumentsByIdDownloadRes {}

  export interface GetDocumentsByIdDownloadParams {
    /**
     * @example "doc_abc123"
     * @description 文档ID
     */
    id: string;
  }

  export interface PutDocumentsByIdRenameRes
    extends __common__.InternalhandlerRenameDocumentResponse {}

  export interface PutDocumentsByIdRenameParams {
    /**
     * @example "doc_abc123"
     * @description 文档ID
     */
    id: string;
  }

  /**
   * @description 改名请求参数
   */
  export interface PutDocumentsByIdRenameBody
    extends __common__.InternalhandlerRenameDocumentRequest {}

  export interface PutDocumentsByIdThumbnailRes
    extends __common__.InternalhandlerSetThumbnailResponse {}

  export interface PutDocumentsByIdThumbnailParams {
    /**
     * @example "doc_abc123"
     * @description 文档ID
     */
    id: string;
  }

  /**
   * @description 缩略图文件
   */
  export interface PutDocumentsByIdThumbnailBody {}

  export interface GetDocumentsByIdVersionsRes
    extends __common__.InternalhandlerVersionListResponse {}

  export interface GetDocumentsByIdVersionsParams {
    /**
     * @example "doc_abc123"
     * @description 文档ID
     */
    id: string;
  }

  export interface PostDocumentsByIdVersionsByVersionRestoreRes
    extends __common__.InternalhandlerRestoreVersionResponse {}

  export interface PostDocumentsByIdVersionsByVersionRestoreParams {
    /**
     * @example "doc_abc123"
     * @description 文档ID
     */
    id: string;
    /**
     * @example 2
     * @description 版本号
     */
    version: number;
  }

  export type RGetDocuments = Promise<
    [
      any,
      __common__.InternalhandlerDocumentListResponse["data"],
      __common__.InternalhandlerDocumentListResponse
    ]
  >;
  export type RPostDocuments = Promise<
    [
      any,
      __common__.InternalhandlerCreateDocumentResponse["data"],
      __common__.InternalhandlerCreateDocumentResponse
    ]
  >;
  export type RGetDocumentsById = Promise<
    [
      any,
      __common__.InternalhandlerGetDocumentResponse["data"],
      __common__.InternalhandlerGetDocumentResponse
    ]
  >;
  export type PutDocumentsByIdParams1 = PutDocumentsByIdParams &
    __common__.InternalhandlerUpdateDocumentRequest;

  export type RPutDocumentsById = Promise<
    [
      any,
      __common__.InternalhandlerUpdateDocumentResponse["data"],
      __common__.InternalhandlerUpdateDocumentResponse
    ]
  >;
  export type RDeleteDocumentsById = Promise<
    [
      any,
      __common__.PkgresponseResponse["data"],
      __common__.PkgresponseResponse
    ]
  >;
  export type PostDocumentsByIdCopyParams1 = PostDocumentsByIdCopyParams &
    __common__.InternalhandlerCopyDocumentRequest;

  export type RPostDocumentsByIdCopy = Promise<
    [
      any,
      __common__.InternalhandlerCopyDocumentResponse["data"],
      __common__.InternalhandlerCopyDocumentResponse
    ]
  >;
  export type PutDocumentsByIdRenameParams1 = PutDocumentsByIdRenameParams &
    __common__.InternalhandlerRenameDocumentRequest;

  export type RPutDocumentsByIdRename = Promise<
    [
      any,
      __common__.InternalhandlerRenameDocumentResponse["data"],
      __common__.InternalhandlerRenameDocumentResponse
    ]
  >;
  export type PutDocumentsByIdContentParams1 = PutDocumentsByIdContentParams &
    __common__.MundefinedBody1;

  export type RPutDocumentsByIdContent = Promise<
    [
      any,
      __common__.InternalhandlerSaveContentResponse["data"],
      __common__.InternalhandlerSaveContentResponse
    ]
  >;
  export type RGetDocumentsByIdVersions = Promise<
    [
      any,
      __common__.InternalhandlerVersionListResponse["data"],
      __common__.InternalhandlerVersionListResponse
    ]
  >;
  export type RPutDocumentsByIdThumbnail = Promise<
    [
      any,
      __common__.InternalhandlerSetThumbnailResponse["data"],
      __common__.InternalhandlerSetThumbnailResponse
    ]
  >;
  export type RPostDocumentsByIdVersionsByVersionRestore = Promise<
    [
      any,
      __common__.InternalhandlerRestoreVersionResponse["data"],
      __common__.InternalhandlerRestoreVersionResponse
    ]
  >;
}

export namespace Images {
  export interface PostImagesRes
    extends __common__.InternalhandlerUploadImageResponse {}

  /**
   * @description MundefinedBody2
   */
  export interface PostImagesBody extends __common__.MundefinedBody2 {}

  export interface PostImagesCheckRes
    extends __common__.InternalhandlerCheckImagesResponse {}

  /**
   * @description 检查图片请求参数
   */
  export interface PostImagesCheckBody
    extends __common__.InternalhandlerCheckImagesRequest {}

  export interface GetImagesByHashRes {}

  export interface GetImagesByHashParams {
    /**
     * @example "sha256:abc123..."
     * @description 图片的hash值
     */
    hash: string;
  }

  export type RPostImages = Promise<
    [
      any,
      __common__.InternalhandlerUploadImageResponse["data"],
      __common__.InternalhandlerUploadImageResponse
    ]
  >;
  export type RPostImagesCheck = Promise<
    [
      any,
      __common__.InternalhandlerCheckImagesResponse["data"],
      __common__.InternalhandlerCheckImagesResponse
    ]
  >;
  export type RGetImagesByHash = Promise<
    [any, unknown, Images.GetImagesByHashRes]
  >;
}

export namespace Settings {
  export interface GetSettingsRes
    extends __common__.InternalhandlerGetAllSettingsResponse {}

  export interface PutSettingsBatchRes
    extends __common__.InternalhandlerBatchSetResponse {}

  /**
   * @description 批量设置请求参数
   */
  export interface PutSettingsBatchBody
    extends __common__.InternalhandlerBatchSetRequest {}

  export interface GetSettingsByKeyRes
    extends __common__.InternalhandlerGetSettingResponse {}

  export interface GetSettingsByKeyParams {
    /**
     * @example "ai-provider"
     * @description 设置项的键名
     */
    key: string;
  }

  export interface PutSettingsByKeyRes
    extends __common__.InternalhandlerSetSettingResponse {}

  export interface PutSettingsByKeyParams {
    /**
     * @example "ai-provider"
     * @description 设置项的键名
     */
    key: string;
  }

  /**
   * @description 设置值请求参数
   */
  export interface PutSettingsByKeyBody
    extends __common__.InternalhandlerSetSettingRequest {}

  export interface DeleteSettingsByKeyRes
    extends __common__.PkgresponseResponse {}

  export interface DeleteSettingsByKeyParams {
    /**
     * @example "ai-provider"
     * @description 设置项的键名
     */
    key: string;
  }

  export type RGetSettings = Promise<
    [
      any,
      __common__.InternalhandlerGetAllSettingsResponse["data"],
      __common__.InternalhandlerGetAllSettingsResponse
    ]
  >;
  export type RPutSettingsBatch = Promise<
    [
      any,
      __common__.InternalhandlerBatchSetResponse["data"],
      __common__.InternalhandlerBatchSetResponse
    ]
  >;
  export type RGetSettingsByKey = Promise<
    [
      any,
      __common__.InternalhandlerGetSettingResponse["data"],
      __common__.InternalhandlerGetSettingResponse
    ]
  >;
  export type PutSettingsByKeyParams1 = PutSettingsByKeyParams &
    __common__.InternalhandlerSetSettingRequest;

  export type RPutSettingsByKey = Promise<
    [
      any,
      __common__.InternalhandlerSetSettingResponse["data"],
      __common__.InternalhandlerSetSettingResponse
    ]
  >;
  export type RDeleteSettingsByKey = Promise<
    [
      any,
      __common__.PkgresponseResponse["data"],
      __common__.PkgresponseResponse
    ]
  >;
}
