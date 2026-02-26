import { http } from '@/utils/request'
import type { UserInfo, LoginParams, LoginResult } from '@/types'

/**
 * 用户登录
 */
export function login(params: LoginParams) {
  return http.post<LoginResult>('/auth/login', params)
}

/**
 * 获取当前用户信息
 */
export function getCurrentUser() {
  return http.get<UserInfo>('/auth/me')
}

/**
 * 用户登出
 */
export function logout() {
  return http.post<void>('/auth/logout')
}
