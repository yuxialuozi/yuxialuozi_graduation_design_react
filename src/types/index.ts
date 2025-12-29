// 用户信息类型
export interface UserInfo {
  id: number
  username: string
  nickname: string
  avatar?: string
  role: string
  permissions: string[]
}

// 登录请求参数
export interface LoginParams {
  username: string
  password: string
}

// 登录响应
export interface LoginResult {
  token: string
  userInfo: UserInfo
}

// API 响应基础类型
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

// 分页参数
export interface PageParams {
  page: number
  pageSize: number
}

// 分页响应
export interface PageResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

// 租户信息
export interface Tenant {
  id: number
  name: string
  contactPerson: string
  phone: string
  email: string
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

// 合同信息
export interface Contract {
  id: number
  tenantId: number
  tenantName: string
  contractNo: string
  startDate: string
  endDate: string
  amount: number
  status: 'draft' | 'active' | 'expired' | 'terminated'
  createdAt: string
  updatedAt: string
}

// 房间信息
export interface Room {
  id: number
  roomNo: string
  building: string
  floor: number
  area: number
  monthlyRent: number
  status: 'vacant' | 'occupied' | 'maintenance'
  tenantId?: number
  tenantName?: string
  createdAt: string
  updatedAt: string
}

// 费用信息
export interface Fee {
  id: number
  tenantId: number
  tenantName: string
  roomNo: string
  feeType: 'rent' | 'water' | 'electricity' | 'property' | 'other'
  amount: number
  period: string
  dueDate: string
  paidDate?: string
  status: 'unpaid' | 'paid' | 'overdue'
  createdAt: string
  updatedAt: string
}

// 维修工单
export interface Maintenance {
  id: number
  ticketNo: string
  tenantId: number
  tenantName: string
  roomNo: string
  type: 'electrical' | 'plumbing' | 'appliance' | 'furniture' | 'other'
  description: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'pending' | 'processing' | 'completed' | 'cancelled'
  assignee?: string
  createdAt: string
  completedAt?: string
  updatedAt: string
}

// 路由元信息
export interface RouteMeta {
  title: string
  icon?: string
  requiresAuth?: boolean
}
