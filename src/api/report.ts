import { http } from '@/utils/request'
import type { Tenant, Contract, Room, Fee, Maintenance } from '@/types'

// 报表查询参数
export interface ReportQueryParams {
  start?: string
  end?: string
  groupBy?: string
  limit?: number
}

// 收入报表数据
export interface IncomeReportData {
  total: number
  byDay: Array<{
    day: string
    amount: number
  }>
  byType: Array<{
    feeType: string
    amount: number
  }>
}

// 入住率报表数据
export interface OccupancyReportData {
  totalRooms: number
  occupiedRooms: number
  vacantRooms: number
  occupancyRate: number
}

// 费用构成报表数据
export interface FeeCompositionData {
  feeType: string
  amount: number
}

// 维修统计报表数据
export interface MaintenanceStatsData {
  byType: Array<{
    type: string
    count: number
  }>
  byStatus: Array<{
    status: string
    count: number
  }>
}

// 租户排名数据
export interface TenantRankingData {
  tenantId: number
  tenantName: string
  amount: number
}

// 仪表盘数据
export interface DashboardData {
  totalTenants: number
  totalRooms: number
  occupiedRooms: number
  occupancyRate: number
  activeContracts: number
  pendingFees: number
  unpaidAmount: number
  pendingMaintenance: number
  incomeChart: { date: string; amount: number }[]
  maintenanceStatusChart: { status: string; count: number }[]
  feeTypeChart: { feeType: string; amount: number }[]
}

/**
 * 获取收入报表
 */
export function getIncomeReport(params?: ReportQueryParams) {
  return http.get<IncomeReportData[]>('/reports/income', { params })
}

/**
 * 获取入住率报表
 */
export function getOccupancyReport(params?: ReportQueryParams) {
  return http.get<OccupancyReportData[]>('/reports/occupancy', { params })
}

/**
 * 获取费用构成报表
 */
export function getFeeComposition(params?: ReportQueryParams) {
  return http.get<FeeCompositionData[]>('/reports/fees/composition', { params })
}

/**
 * 获取维修统计报表
 */
export function getMaintenanceStats(params?: ReportQueryParams) {
  return http.get<MaintenanceStatsData[]>('/reports/maintenance/stats', { params })
}

/**
 * 获取租户排名
 */
export function getTenantRanking(params?: ReportQueryParams) {
  return http.get<TenantRankingData[]>('/reports/tenants/ranking', { params })
}

/**
 * 获取仪表盘数据
 */
export function getDashboard() {
  return http.get<DashboardData>('/reports/dashboard')
}
