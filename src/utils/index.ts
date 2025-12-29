import dayjs from 'dayjs'

// 格式化日期
export const formatDate = (date: string | Date, format = 'YYYY-MM-DD') => {
  return dayjs(date).format(format)
}

// 格式化日期时间
export const formatDateTime = (date: string | Date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

// 格式化金额
export const formatMoney = (amount: number) => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
  }).format(amount)
}

// 本地存储封装
export const storage = {
  get<T>(key: string): T | null {
    const value = localStorage.getItem(key)
    if (value) {
      try {
        return JSON.parse(value)
      } catch {
        return value as unknown as T
      }
    }
    return null
  },
  set(key: string, value: unknown) {
    localStorage.setItem(key, JSON.stringify(value))
  },
  remove(key: string) {
    localStorage.removeItem(key)
  },
  clear() {
    localStorage.clear()
  },
}
