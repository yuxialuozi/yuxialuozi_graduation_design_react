import { http } from '@/utils/request'
import type { PageResult, TenantProfile, TenantDashboard, Fee, Contract, Room, Maintenance, MaintenanceRequest, PayFeeRequest } from '@/types'

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