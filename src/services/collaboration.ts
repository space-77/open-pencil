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
import type { Collaboration as types, __common__ } from "./types";
/**
 * @name Collaboration
 * @description Collaboration
 */
export default class Collaboration extends ApiClient {
  /**
   * @summary 创建协作房间
   * @description 创建一个新的协作房间，用于多人实时协作编辑
   */
  postRooms(body: __common__.InternalhandlerCreateRoomRequest) {
    const config: DocReqConfig = { url: "/collab/rooms", body, method: "post" };
    return this.request<types.RPostRooms>(config);
  }

  /**
   * @summary 获取用户参与的房间列表
   * @description 获取当前用户创建或参与的所有活跃协作房间
   */
  getRoomsMy() {
    const config: DocReqConfig = { url: "/collab/rooms/my", method: "get" };
    return this.request<types.RGetRoomsMy>(config);
  }

  /**
   * @param { String } id 房间ID
   * @summary 获取房间信息
   * @description 获取指定协作房间的详细信息
   */
  getRoomsById(id: string) {
    const config: DocReqConfig = { url: `/collab/rooms/${id}`, method: "get" };
    return this.request<types.RGetRoomsById>(config);
  }

  /**
   * @param { String } id 房间ID
   * @summary 获取房间 Yjs 状态
   * @description 获取协作房间的 Yjs 文档状态，用于断线重连后同步
   */
  getRoomsByIdState(id: string) {
    const url = `/collab/rooms/${id}/state`;
    const config: DocReqConfig = { url, method: "get" };
    return this.request<types.RGetRoomsByIdState>(config);
  }

  /**
   * @summary 更新房间 Yjs 状态
   * @description 更新协作房间的 Yjs 文档状态
   */
  putRoomsByIdState(params: types.PutRoomsByIdStateParams1) {
    const { id, ...body } = params;
    const url = `/collab/rooms/${id}/state`;
    const config: DocReqConfig = { url, body, method: "put" };
    return this.request<types.RPutRoomsByIdState>(config);
  }

  /**
   * @param { String } id 房间ID
   * @summary 关闭协作房间
   * @description 关闭指定的协作房间，房间将不再可用
   */
  postRoomsByIdClose(id: string) {
    const url = `/collab/rooms/${id}/close`;
    const config: DocReqConfig = { url, method: "post" };
    return this.request<types.RPostRoomsByIdClose>(config);
  }
}
export const collaboration = new Collaboration();
