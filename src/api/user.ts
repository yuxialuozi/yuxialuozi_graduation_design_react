import { http } from '@/utils/request'
import type { PageParams, PageResult, TenantProfile, TenantDashboard, Fee, Contract, Room, Maintenance, MaintenanceRequest, PayFeeRequest, SystemUser, UserInfo } from '@/types'

// ========== 租户端 API ==========

// 获取租户个人信息
export function getTenantProfile(): Promise<TenantProfile> {
  return http.get<TenantProfile>('/tenant/profile')
}

// 获取租户合同列表
export function getTenantContracts(params?: { page?: number; pageSize?: number }): Promise<PageResult<Contract>> {
  return http.get<PageResult<Contract>>('/tenant/contracts', { params })
}

// 获取租户房间列表
export function getTenantRooms(params?: { page?: number; pageSize?: number }): Promise<PageResult<Room>> {
  return http.get<PageResult<Room>>('/tenant/rooms', { params })
}

// 获取租户账单列表
export function getTenantFees(params?: {
  page?: number
  pageSize?: number
  status?: string
  feeType?: string
  period?: string
}): Promise<PageResult<Fee>> {
  return http.get<PageResult<Fee>>('/tenant/fees', { params })
}

// 缴纳账单
export function payTenantFee(id: number, data?: PayFeeRequest): Promise<void> {
  return http.post<void>(`/tenant/fees/${id}/pay`, data)
}

// 获取租户维修工单列表
export function getTenantMaintenance(params?: {
  page?: number
  pageSize?: number
  status?: string
}): Promise<PageResult<Maintenance>> {
  return http.get<PageResult<Maintenance>>('/tenant/maintenance', { params })
}

// 提交维修工单
export function createTenantMaintenance(data: MaintenanceRequest): Promise<void> {
  return http.post<void>('/tenant/maintenance', data)
}

// 获取租户仪表盘数据
export function getTenantDashboard(): Promise<TenantDashboard> {
  return http.get<TenantDashboard>('/tenant/dashboard')
}

// 修改密码
export function changePassword(data: { oldPassword: string; newPassword: string }): Promise<void> {
  return http.post<void>('/auth/change-password', data)
}

// ========== 管理端用户管理 API ==========

// 用户查询参数
export interface SystemUserQueryParams extends PageParams {
  keyword?: string
  role?: string
}

// 用户表单数据
export interface SystemUserFormData {
  username: string
  password?: string
  nickname?: string
  phone?: string
  email?: string
  role: 'admin' | 'user'
  tenantId?: number
  status?: 'active' | 'inactive'
}

/**
 * 获取系统用户列表
 */
export function getSystemUserList(params: SystemUserQueryParams) {
  return http.get<PageResult<SystemUser>>('/users', { params })
}

/**
 * 获取系统用户详情
 */
export function getSystemUserById(id: number) {
  return http.get<SystemUser>(`/users/${id}`)
}

/**
 * 创建系统用户
 */
export function createSystemUser(data: SystemUserFormData) {
  return http.post<SystemUser>('/users', data)
}

/**
 * 更新系统用户
 */
export function updateSystemUser(id: number, data: Partial<SystemUserFormData>) {
  return http.put<SystemUser>(`/users/${id}`, data)
}

/**
 * 删除系统用户
 */
export function deleteSystemUser(id: number) {
  return http.delete<void>(`/users/${id}`)
}

/**
 * 重置用户密码
 */
export function resetSystemUserPassword(id: number) {
  return http.post<{ newPassword: string }>(`/users/${id}/reset-password`)
}

/**
 * 获取当前用户资料
 */
export function getProfile(): Promise<UserInfo> {
  return http.get<UserInfo>('/profile')
}

/**
 * 更新当前用户资料
 */
export function updateProfile(data: { nickname?: string; phone?: string; email?: string }) {
  return http.put<void>('/profile', data)
}