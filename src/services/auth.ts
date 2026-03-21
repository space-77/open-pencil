/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA DOC2TS                        ##
 * ##                                                           ##
 * ## AUTHOR: space-77                                          ##
 * ## SOURCE: https://github.com/space-77/doc2ts                ##
 * ---------------------------------------------------------------
 */

import ApiClient from './client'

import type { Auth as types, __common__ } from './types'
import type { DocReqConfig } from 'doc2ts'
/**
 * @name Auth
 * @description Auth
 */
export default class Auth extends ApiClient {
  /**
   * @summary 用户登录
   * @description 用户登录获取认证令牌
   */
  postLogin(body: __common__.InternalhandlerLoginRequest) {
    const config: DocReqConfig = { url: '/auth/login', body, method: 'post' }
    return this.request<types.RPostLogin>(config)
  }

  /**
   * @summary 用户注册
   * @description 注册新用户账号
   */
  postRegister(body: __common__.InternalhandlerRegisterRequest) {
    const config: DocReqConfig = {
      url: '/auth/register',
      body,
      method: 'post'
    }
    return this.request<types.RPostRegister>(config)
  }
}
export const auth = new Auth()
