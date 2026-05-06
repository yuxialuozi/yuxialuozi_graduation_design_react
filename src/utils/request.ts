import axios, { AxiosError, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import { Modal } from 'antd'
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
    // 重要业务错误使用卡片式弹窗显示
    Modal.error({
      title: '操作失败',
      content: errorMsg,
      okText: '确定',
      maskClosable: true,
    })
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
          Modal.warning({
            title: '登录已过期',
            content: errorMsg || '请重新登录以继续操作',
            okText: '确定',
            onOk: () => {
              localStorage.removeItem('token')
              window.location.href = '/login'
            },
          })
          break
        case 403:
          Modal.error({
            title: '没有权限',
            content: errorMsg || '您没有权限访问此资源',
            okText: '确定',
          })
          break
        case 404:
          Modal.error({
            title: '资源不存在',
            content: errorMsg || '请求的资源不存在',
            okText: '确定',
          })
          break
        case 500:
          Modal.error({
            title: '服务器错误',
            content: errorMsg || '服务器发生错误，请稍后重试',
            okText: '确定',
          })
          break
        case 400:
          Modal.error({
            title: '请求参数错误',
            content: errorMsg || '请检查输入的参数是否正确',
            okText: '确定',
          })
          break
        default:
          Modal.error({
            title: '请求失败',
            content: errorMsg || '发生未知错误，请稍后重试',
            okText: '确定',
          })
      }
      const err = new Error(errorMsg || '请求失败')
      err.name = 'HttpError'
      return Promise.reject(err)
    } else {
      // 网络错误（CORS / 超时 / 连接失败）
      Modal.error({
        title: '网络错误',
        content: '无法连接到服务器，请检查网络连接',
        okText: '确定',
      })
      const err = new Error('网络错误，请检查网络连接')
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
    // 如果没有data，不传递data参数，避免发送 undefined/null 导致后端解析失败
    if (data === undefined || data === null) {
      return request.post(url, undefined, config).then((res) => res.data.data)
    }
    return request.post(url, data, config).then((res) => res.data.data)
  },
  put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    if (data === undefined || data === null) {
      return request.put(url, undefined, config).then((res) => res.data.data)
    }
    return request.put(url, data, config).then((res) => res.data.data)
  },
  delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return request.delete(url, config).then((res) => res.data.data)
  },
}

export default request
