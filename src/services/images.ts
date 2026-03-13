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
import type { Images as types, __common__ } from "./types";
/**
 * @name Images
 * @description Images
 */
export default class Images extends ApiClient {
  /**
   * @summary 上传图片
   * @description 上传图片资源到服务器，返回图片URL
   */
  postImages(body: __common__.MundefinedBody2) {
    const contentType = "multipart/form-data";
    const formData = this.formData(body, contentType);
    const url = "/images";
    const config: DocReqConfig = {
      url,
      formData,
      headers: { "Content-Type": contentType },
      method: "post",
    };
    return this.request<types.RPostImages>(config);
  }

  /**
   * @summary 批量检查图片是否存在
   * @description 检查指定hash列表中哪些图片已存在服务器
   */
  postImagesCheck(
    hashes: __common__.InternalhandlerCheckImagesRequest["hashes"]
  ) {
    const body = { hashes };
    const config: DocReqConfig = { url: "/images/check", body, method: "post" };
    return this.request<types.RPostImagesCheck>(config);
  }

  /**
   * @param { String } hash 图片的hash值
   * @summary 获取图片
   * @description 根据hash获取图片内容
   */
  getImagesByHash(hash: string) {
    const config: DocReqConfig = { url: `/images/${hash}`, method: "get" };
    return this.request<types.RGetImagesByHash>(config);
  }
}
export const images = new Images();
