import { http } from '@/utils/request'
import type { Contract, PageParams, PageResult } from '@/types'

// 合同查询参数
export interface ContractQueryParams extends PageParams {
  keyword?: string
  status?: string
  startDateFrom?: string
  startDateTo?: string
}

// 合同创建/更新参数
export interface ContractFormData {
  tenantId: number
  contractNo: string  // 后端要求必填
  startDate: string   // ISO 8601 格式: "2025-01-01T00:00:00Z"
  endDate: string     // ISO 8601 格式: "2025-12-31T00:00:00Z"
  amount?: number
  status?: string
}

/**
 * 获取合同列表
 */
export function getContractList(params: ContractQueryParams) {
  return http.get<PageResult<Contract>>('/contracts', { params })
}

/**
 * 根据ID获取合同信息
 */
export function getContractById(id: number) {
  return http.get<Contract>(`/contracts/${id}`)
}

/**
 * 创建合同
 */
export function createContract(data: ContractFormData) {
  return http.post<Contract>('/contracts', data)
}

/**
 * 更新合同
 */
export function updateContract(id: number, data: ContractFormData) {
  return http.put<Contract>(`/contracts/${id}`, data)
}

/**
 * 删除合同
 */
export function deleteContract(id: number) {
  return http.delete<void>(`/contracts/${id}`)
}
