import { http } from '@/utils/request'
import type { Tenant, PageParams, PageResult } from '@/types'

// 租户查询参数
export interface TenantQueryParams extends PageParams {
  keyword?: string
  status?: string
}

// 租户创建/更新参数
export interface TenantFormData {
  name: string
  contactPerson?: string
  phone?: string
  email?: string
  status?: string
}

/**
 * 获取租户列表
 */
export function getTenantList(params: TenantQueryParams) {
  return http.get<PageResult<Tenant>>('/tenants', { params })
}

/**
 * 根据ID获取租户信息
 */
export function getTenantById(id: number) {
  return http.get<Tenant>(`/tenants/${id}`)
}

/**
 * 创建租户
 */
export function createTenant(data: TenantFormData) {
  return http.post<Tenant>('/tenants', data)
}

/**
 * 更新租户
 */
export function updateTenant(id: number, data: TenantFormData) {
  return http.put<Tenant>(`/tenants/${id}`, data)
}

/**
 * 删除租户
 */
export function deleteTenant(id: number) {
  return http.delete<void>(`/tenants/${id}`)
}
