import { http } from '@/utils/request'
import type { Room, PageParams, PageResult } from '@/types'

// 房间查询参数
export interface RoomQueryParams extends PageParams {
  keyword?: string
  building?: string
  status?: string
}

// 房间创建/更新参数
export interface RoomFormData {
  roomNo: string
  building?: string
  floor?: number
  area?: number
  monthlyRent?: number
  status?: string
}

// 分配租户参数
export interface AssignTenantData {
  tenantId: number
}

/**
 * 获取房间列表
 */
export function getRoomList(params: RoomQueryParams) {
  return http.get<PageResult<Room>>('/rooms', { params })
}

/**
 * 根据ID获取房间信息
 */
export function getRoomById(id: number) {
  return http.get<Room>(`/rooms/${id}`)
}

/**
 * 创建房间
 */
export function createRoom(data: RoomFormData) {
  return http.post<Room>('/rooms', data)
}

/**
 * 更新房间
 */
export function updateRoom(id: number, data: RoomFormData) {
  return http.put<Room>(`/rooms/${id}`, data)
}

/**
 * 删除房间
 */
export function deleteRoom(id: number) {
  return http.delete<void>(`/rooms/${id}`)
}

/**
 * 分配租户到房间
 */
export function assignTenant(id: number, data: AssignTenantData) {
  return http.post<Room>(`/rooms/${id}/assign`, data)
}

/**
 * 释放房间（取消租户关联）
 */
export function unassignRoom(id: number) {
  return http.post<void>(`/rooms/${id}/unassign`)
}

/**
 * 获取楼栋列表
 */
export function getBuildings() {
  return http.get<string[]>('/rooms/buildings')
}
