/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA DOC2TS                        ##
 * ##                                                           ##
 * ## AUTHOR: space-77                                          ##
 * ## SOURCE: https://github.com/space-77/doc2ts                ##
 * ---------------------------------------------------------------
 */

import ApiClient from './client'

import type { AIConfig as types, __common__ } from './types'
import type { DocReqConfig } from 'doc2ts'
/**
 * @name AIConfig
 * @description AIConfig
 */
export default class AIConfig extends ApiClient {
  /**
   * @summary 获取用户所有AI配置
   * @description 获取当前用户的所有AI模型配置
   */
  getAiConfigs() {
    const config: DocReqConfig = { url: '/ai-configs', method: 'get' }
    return this.request<types.RGetAiConfigs>(config)
  }

  /**
   * @summary 创建AI配置
   * @description 创建新的AI模型配置
   */
  postAiConfigs(body: __common__.InternalhandlerCreateAIConfigRequest) {
    const config: DocReqConfig = { url: '/ai-configs', body, method: 'post' }
    return this.request<types.RPostAiConfigs>(config)
  }

  /**
   * @param { String } id 配置ID
   * @summary 获取单个AI配置
   * @description 根据ID获取指定的AI配置
   */
  getAiConfigsById(id: string) {
    const config: DocReqConfig = { url: `/ai-configs/${id}`, method: 'get' }
    return this.request<types.RGetAiConfigsById>(config)
  }

  /**
   * @summary 更新AI配置
   * @description 更新指定的AI模型配置
   */
  putAiConfigsById(params: types.PutAiConfigsByIdParams1) {
    const { id, ...body } = params
    const config: DocReqConfig = {
      url: `/ai-configs/${id}`,
      body,
      method: 'put'
    }
    return this.request<types.RPutAiConfigsById>(config)
  }

  /**
   * @param { String } id 配置ID
   * @summary 删除AI配置
   * @description 删除指定的AI模型配置
   */
  deleteAiConfigsById(id: string) {
    const config: DocReqConfig = { url: `/ai-configs/${id}`, method: 'delete' }
    return this.request<types.RDeleteAiConfigsById>(config)
  }
}
export const aIConfig = new AIConfig()
