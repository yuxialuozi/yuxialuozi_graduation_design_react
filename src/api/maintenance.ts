import { http } from '@/utils/request'
import type { Maintenance, PageParams, PageResult } from '@/types'

// 维修查询参数
export interface MaintenanceQueryParams extends PageParams {
  keyword?: string
  type?: string
  status?: string
  priority?: string
}

// 维修创建/更新参数
export interface MaintenanceFormData {
  tenantId: number
  roomNo?: string
  type?: string
  description?: string
  priority?: string
  status?: string
  assignee?: string
}

// 分配维修人员参数
export interface AssignMaintenanceData {
  assignee: string
}

// 完成维修参数
export interface CompleteMaintenanceData {
  completedAt?: string
}

/**
 * 获取维修工单列表
 */
export function getMaintenanceList(params: MaintenanceQueryParams) {
  return http.get<PageResult<Maintenance>>('/maintenance', { params })
}

/**
 * 根据ID获取维修工单信息
 */
export function getMaintenanceById(id: number) {
  return http.get<Maintenance>(`/maintenance/${id}`)
}

/**
 * 创建维修工单
 */
export function createMaintenance(data: MaintenanceFormData) {
  return http.post<Maintenance>('/maintenance', data)
}

/**
 * 更新维修工单
 */
export function updateMaintenance(id: number, data: MaintenanceFormData) {
  return http.put<Maintenance>(`/maintenance/${id}`, data)
}

/**
 * 删除维修工单
 */
export function deleteMaintenance(id: number) {
  return http.delete<void>(`/maintenance/${id}`)
}

/**
 * 分配维修人员
 */
export function assignMaintenance(id: number, data: AssignMaintenanceData) {
  return http.post<Maintenance>(`/maintenance/${id}/assign`, data)
}

/**
 * 完成维修
 */
export function completeMaintenance(id: number, data?: CompleteMaintenanceData) {
  return http.post<Maintenance>(`/maintenance/${id}/complete`, data)
}
