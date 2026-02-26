import { http } from '@/utils/request'
import type { Fee, PageParams, PageResult } from '@/types'

// 费用查询参数
export interface FeeQueryParams extends PageParams {
  tenantId?: number
  roomNo?: string
  feeType?: string
  status?: string
  period?: string
}

// 费用创建/更新参数
export interface FeeFormData {
  tenantId: number
  roomNo?: string
  feeType: string
  amount: number
  period?: string
  dueDate: string
  status?: string
}

// 缴费参数
export interface PayFeeData {
  paidDate?: string
}

/**
 * 获取费用列表
 */
export function getFeeList(params: FeeQueryParams) {
  return http.get<PageResult<Fee>>('/fees', { params })
}

/**
 * 根据ID获取费用信息
 */
export function getFeeById(id: number) {
  return http.get<Fee>(`/fees/${id}`)
}

/**
 * 创建费用记录
 */
export function createFee(data: FeeFormData) {
  return http.post<Fee>('/fees', data)
}

/**
 * 更新费用记录
 */
export function updateFee(id: number, data: FeeFormData) {
  return http.put<Fee>(`/fees/${id}`, data)
}

/**
 * 删除费用记录
 */
export function deleteFee(id: number) {
  return http.delete<void>(`/fees/${id}`)
}

/**
 * 确认缴费
 */
export function payFee(id: number, data?: PayFeeData) {
  return http.post<Fee>(`/fees/${id}/pay`, data)
}
