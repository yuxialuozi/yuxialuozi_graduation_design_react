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
    } else {
      console.log('没有找到token，跳过Authorization头设置')
    }
    console.log('请求配置:', config.method, config.url, config.headers.Authorization ? '带token' : '无token')
    return config
  },
  (error) => {
    console.error('请求拦截器错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const { data } = response
    if (data.code === 0) {
      return response
    }
    // 业务错误，data.message 包含后端返回的错误信息
    const errorMsg = data.message || '请求失败'
    message.error(errorMsg)
    // 将错误信息附加到 Error 对象，方便组件获取
    const err = new Error(errorMsg)
    err.name = 'ApiError'
    return Promise.reject(err)
  },
  (error: AxiosError<ApiResponse>) => {
    if (error.response) {
      // HTTP 错误（4xx/5xx），从 response body 中提取后端错误信息
      const { status, data } = error.response
      const errorMsg = data?.message
      switch (status) {
        case 401:
          message.error(errorMsg || '登录已过期，请重新登录')
          localStorage.removeItem('token')
          window.location.href = '/login'
          break
        case 403:
          message.error(errorMsg || '没有权限访问此资源')
          break
        case 404:
          message.error(errorMsg || '请求的资源不存在')
          break
        case 500:
          message.error(errorMsg || '服务器错误')
          break
        case 400:
          message.error(errorMsg || '请求参数错误')
          break
        default:
          message.error(errorMsg || '请求失败')
      }
      const err = new Error(errorMsg || '请求失败')
      err.name = 'HttpError'
      return Promise.reject(err)
    } else {
      // 网络错误（CORS / 超时 / 连接失败）或后端返回了非 0 code 但 HTTP 200
      // axios 没有正确解析响应，可能是网络问题或响应格式异常
      let errorMsg = '网络错误，请检查网络连接'
      // 检查 error.data 是否有业务错误信息（HTTP 200 但 code 非 0 的情况）
      if (error.data && typeof error.data === 'object' && 'message' in (error.data as object)) {
        errorMsg = (error.data as ApiResponse).message || errorMsg
      }
      message.error(errorMsg)
      const err = new Error(errorMsg)
      err.name = 'NetworkError'
      return Promise.reject(err)
    }
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
