/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA DOC2TS                        ##
 * ##                                                           ##
 * ## AUTHOR: space-77                                          ##
 * ## SOURCE: https://github.com/space-77/doc2ts                ##
 * ---------------------------------------------------------------
 */

import type { DocReqConfig } from "doc2ts";
import ApiClient from "./client";
import type { Settings as types, __common__ } from "./types";
/**
 * @name Settings
 * @description Settings
 */
export default class Settings extends ApiClient {
  /**
   * @summary 获取用户所有设置
   * @description 获取当前用户的所有配置设置项
   */
  getSettings() {
    const config: DocReqConfig = { url: "/settings", method: "get" };
    return this.request<types.RGetSettings>(config);
  }

  /**
   * @summary 批量设置
   * @description 批量设置多个配置项
   */
  putSettingsBatch(
    settings: __common__.InternalhandlerBatchSetRequest["settings"]
  ) {
    const body = { settings };
    const config: DocReqConfig = {
      url: "/settings/batch",
      body,
      method: "put",
    };
    return this.request<types.RPutSettingsBatch>(config);
  }

  /**
   * @param { String } key 设置项的键名
   * @summary 获取单个设置
   * @description 根据key获取指定的配置项
   */
  getSettingsByKey(key: string) {
    const config: DocReqConfig = { url: `/settings/${key}`, method: "get" };
    return this.request<types.RGetSettingsByKey>(config);
  }

  /**
   * @summary 设置单个配置
   * @description 设置或更新指定配置项的值
   */
  putSettingsByKey(params: types.PutSettingsByKeyParams1) {
    const { key, ...body } = params;
    const config: DocReqConfig = {
      url: `/settings/${key}`,
      body,
      method: "put",
    };
    return this.request<types.RPutSettingsByKey>(config);
  }

  /**
   * @param { String } key 设置项的键名
   * @summary 删除设置
   * @description 删除指定的配置项
   */
  deleteSettingsByKey(key: string) {
    const config: DocReqConfig = { url: `/settings/${key}`, method: "delete" };
    return this.request<types.RDeleteSettingsByKey>(config);
  }
}
export const settings = new Settings();
