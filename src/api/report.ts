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
  date: string
  income: number
}

// 入住率报表数据
export interface OccupancyReportData {
  date: string
  occupancyRate: number
  totalRooms: number
  occupiedRooms: number
}

// 费用构成报表数据
export interface FeeCompositionData {
  feeType: string
  amount: number
  percentage: number
}

// 维修统计报表数据
export interface MaintenanceStatsData {
  status: string
  count: number
  percentage: number
}

// 租户排名数据
export interface TenantRankingData {
  tenantId: number
  tenantName: string
  totalFee: number
  rank: number
}

// 仪表盘数据
export interface DashboardData {
  totalTenants: number
  totalRooms: number
  occupiedRooms: number
  occupancyRate: number
  totalIncome: number
  monthlyIncome: number
  pendingFees: number
  activeContracts: number
  pendingMaintenance: number
  recentTenants: Tenant[]
  recentContracts: Contract[]
  recentFees: Fee[]
  recentMaintenance: Maintenance[]
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
