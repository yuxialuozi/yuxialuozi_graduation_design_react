import request from '@/utils/request'
import type { ApiResponse, PageResult, TenantProfile, TenantDashboard, Fee, Contract, Room, Maintenance, MaintenanceRequest, PayFeeRequest } from '@/types'

// 获取租户个人信息
export function getTenantProfile(): Promise<ApiResponse<TenantProfile>> {
  return request.get('/tenant/profile')
}

// 获取租户合同列表
export function getTenantContracts(params?: { page?: number; pageSize?: number }): Promise<ApiResponse<PageResult<Contract>>> {
  return request.get('/tenant/contracts', { params })
}

// 获取租户房间列表
export function getTenantRooms(params?: { page?: number; pageSize?: number }): Promise<ApiResponse<PageResult<Room>>> {
  return request.get('/tenant/rooms', { params })
}

// 获取租户账单列表
export function getTenantFees(params?: {
  page?: number
  pageSize?: number
  status?: string
  feeType?: string
  period?: string
}): Promise<ApiResponse<PageResult<Fee>>> {
  return request.get('/tenant/fees', { params })
}

// 缴纳账单
export function payTenantFee(id: number, data?: PayFeeRequest): Promise<ApiResponse<void>> {
  return request.post(`/tenant/fees/${id}/pay`, data)
}

// 获取租户维修工单列表
export function getTenantMaintenance(params?: {
  page?: number
  pageSize?: number
  status?: string
}): Promise<ApiResponse<PageResult<Maintenance>>> {
  return request.get('/tenant/maintenance', { params })
}

// 提交维修工单
export function createTenantMaintenance(data: MaintenanceRequest): Promise<ApiResponse<void>> {
  return request.post('/tenant/maintenance', data)
}

// 获取租户仪表盘数据
export function getTenantDashboard(): Promise<ApiResponse<TenantDashboard>> {
  return request.get('/tenant/dashboard')
}

// 修改密码
export function changePassword(data: { oldPassword: string; newPassword: string }): Promise<ApiResponse<void>> {
  return request.post('/auth/change-password', data)
}