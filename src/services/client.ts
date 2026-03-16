import qs from 'qs'

import request from '@/api/base'

import type { IApiClient, DocReqConfig } from 'doc2ts'

export default class ApiClient implements IApiClient {
  request<T = any>(reqConfig: DocReqConfig): Promise<T> {
    const { config = {}, url: path, method, body, formData, headers } = reqConfig

    return request({ url: path, method, headers, data: body || formData, ...(config || {}) })
  }

  async download<T = Blob>(config: DocReqConfig): Promise<T> {
    const { url: path, method, headers } = config

    try {
      const response = await request({
        url: path,
        method,
        headers,
        responseType: 'blob'
      })

      // 响应拦截器对 blob 类型直接返回 axios response
      const axiosRes = response as any

      // 检查是否是错误响应（拦截器返回的 [err, data, res] 格式）
      if (Array.isArray(response)) {
        const [err, data, res] = response
        if (err) {
          return [err, null, null] as T
        }
        return [null, data, res] as T
      }

      // 正常的 blob 响应
      const blob = axiosRes.data as Blob
      return [null, blob, axiosRes] as T
    } catch (error) {
      return [error, null, null] as T
    }
  }

  /**
   * @description 拼接参数
   */
  protected serialize(query: Record<string, any>) {
    return qs.stringify(query, { skipNulls: true })
  }

  /**
   * @description 创建 formdata
   */
  protected formData(formData: Record<string, any>, type: string) {
    if (!(formData instanceof Object) || Array.isArray(formData)) return
    const dataList = Object.entries(formData)

    if (type.startsWith('multipart/form-data')) {
      const fd = new FormData()
      dataList.forEach(([k, v]) => {
        if (v === undefined) return
        if (Array.isArray(v)) {
          v.forEach((item: any) => fd.append(k, item))
        } else {
          fd.append(k, v)
        }
      })
      return fd
    } else if (type.startsWith('application/x-www-form-urlencoded')) {
      const fd = new URLSearchParams()
      dataList.forEach(([k, v]) => {
        if (v === undefined) return
        if (Array.isArray(v)) {
          v.forEach((item: any) => fd.set(k, item))
        } else {
          fd.set(k, v)
        }
      })
      return fd
    }
  }
}
