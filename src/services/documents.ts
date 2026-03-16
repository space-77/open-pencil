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
import type { Documents as types, __common__ } from "./types";
/**
 * @name Documents
 * @description Documents
 */
export default class Documents extends ApiClient {
  /**
   * @summary 获取文档列表
   * @description 获取当前用户的所有文档列表，支持分页、排序和搜索
   */
  getDocuments(query: types.GetDocumentsParams) {
    const url = `/documents?${this.serialize(query)}`;
    const config: DocReqConfig = { url, method: "get" };
    return this.request<types.RGetDocuments>(config);
  }

  /**
   * @summary 创建文档
   * @description 创建新文档，可选择上传.fig文件或创建空文档
   */
  postDocuments(body: __common__.MundefinedBody) {
    const contentType = "multipart/form-data";
    const formData = this.formData(body, contentType);
    const url = "/documents";
    const config: DocReqConfig = {
      url,
      formData,
      headers: { "Content-Type": contentType },
      method: "post",
    };
    return this.request<types.RPostDocuments>(config);
  }

  /**
   * @param { String } id 文档ID
   * @summary 获取文档详情
   * @description 根据ID获取文档详细信息
   */
  getDocumentsById(id: string) {
    const config: DocReqConfig = { url: `/documents/${id}`, method: "get" };
    return this.request<types.RGetDocumentsById>(config);
  }

  /**
   * @summary 更新文档信息
   * @description 更新文档的基本信息（名称、描述、公开状态）
   */
  putDocumentsById(params: types.PutDocumentsByIdParams1) {
    const { id, ...body } = params;
    const config: DocReqConfig = {
      url: `/documents/${id}`,
      body,
      method: "put",
    };
    return this.request<types.RPutDocumentsById>(config);
  }

  /**
   * @param { String } id 文档ID
   * @summary 删除文档
   * @description 删除指定文档及其所有版本历史
   */
  deleteDocumentsById(id: string) {
    const config: DocReqConfig = { url: `/documents/${id}`, method: "delete" };
    return this.request<types.RDeleteDocumentsById>(config);
  }

  /**
   * @summary 复制文档
   * @description 复制文档创建新文档副本
   */
  postDocumentsByIdCopy(params: types.PostDocumentsByIdCopyParams1) {
    const { id, ...body } = params;
    const url = `/documents/${id}/copy`;
    const config: DocReqConfig = { url, body, method: "post" };
    return this.request<types.RPostDocumentsByIdCopy>(config);
  }

  /**
   * @summary 文档改名
   * @description 修改文档名称
   */
  putDocumentsByIdRename(params: types.PutDocumentsByIdRenameParams1) {
    const { id, ...body } = params;
    const url = `/documents/${id}/rename`;
    const config: DocReqConfig = { url, body, method: "put" };
    return this.request<types.RPutDocumentsByIdRename>(config);
  }

  /**
   * @summary 保存文档内容
   * @description 上传并保存文档的.fig文件内容，支持乐观锁版本控制
   */
  putDocumentsByIdContent(params: types.PutDocumentsByIdContentParams1) {
    const { id, ...body } = params;
    const contentType = "multipart/form-data";
    const formData = this.formData(body, contentType);
    const url = `/documents/${id}/content`;
    const config: DocReqConfig = {
      url,
      formData,
      headers: { "Content-Type": contentType },
      method: "put",
    };
    return this.request<types.RPutDocumentsByIdContent>(config);
  }

  /**
   * @param { String } id 文档ID
   * @summary 下载文档文件
   * @description 下载文档的.fig文件内容
   */
  getDocumentsByIdDownload(id: string) {
    const url = `/documents/${id}/download`;
    const config: DocReqConfig = { url, method: "get" };
    return this.download(config);
  }

  /**
   * @param { String } id 文档ID
   * @summary 获取文档版本历史
   * @description 获取文档的所有历史版本记录
   */
  getDocumentsByIdVersions(id: string) {
    const url = `/documents/${id}/versions`;
    const config: DocReqConfig = { url, method: "get" };
    return this.request<types.RGetDocumentsByIdVersions>(config);
  }

  /**
   * @summary 恢复文档到指定版本
   * @description 将文档恢复到指定的历史版本
   */
  postDocumentsByIdVersionsByVersionRestore({
    id,
    version,
  }: types.PostDocumentsByIdVersionsByVersionRestoreParams) {
    const url = `/documents/${id}/versions/${version}/restore`;
    const config: DocReqConfig = { url, method: "post" };
    return this.request<types.RPostDocumentsByIdVersionsByVersionRestore>(
      config
    );
  }
}
export const documents = new Documents();
