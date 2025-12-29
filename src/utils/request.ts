import axios, { AxiosError, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import { message } from 'antd'
import type { ApiResponse } from '@/types'

// 创建 axios 实例
const request = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const { data } = response
    if (data.code === 200) {
      return response
    }
    message.error(data.message || '请求失败')
    return Promise.reject(new Error(data.message))
  },
  (error: AxiosError<ApiResponse>) => {
    if (error.response) {
      const { status, data } = error.response
      switch (status) {
        case 401:
          message.error('登录已过期，请重新登录')
          localStorage.removeItem('token')
          window.location.href = '/login'
          break
        case 403:
          message.error('没有权限访问')
          break
        case 404:
          message.error('请求的资源不存在')
          break
        case 500:
          message.error('服务器错误')
          break
        default:
          message.error(data?.message || '请求失败')
      }
    } else {
      message.error('网络错误，请检查网络连接')
    }
    return Promise.reject(error)
  }
)

// 封装请求方法
export const http = {
  get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return request.get(url, config).then((res) => res.data.data)
  },
  post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return request.post(url, data, config).then((res) => res.data.data)
  },
  put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return request.put(url, data, config).then((res) => res.data.data)
  },
  delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return request.delete(url, config).then((res) => res.data.data)
  },
}

export default request
