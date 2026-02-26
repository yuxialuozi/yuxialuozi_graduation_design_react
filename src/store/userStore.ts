import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserInfo } from '@/types'

interface UserState {
  token: string | null
  userInfo: UserInfo | null
  isLoggedIn: boolean
  setToken: (token: string) => void
  setUserInfo: (userInfo: UserInfo) => void
  login: (token: string, userInfo: UserInfo) => void
  logout: () => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      token: null,
      userInfo: null,
      isLoggedIn: false,
      setToken: (token) => {
        console.log('设置token:', token)
        set({ token, isLoggedIn: !!token })
      },
      setUserInfo: (userInfo) => {
        console.log('设置用户信息:', userInfo)
        set({ userInfo })
      },
      login: (token, userInfo) => {
        console.log('用户登录:', { token, userInfo })
        set({ token, userInfo, isLoggedIn: true })
      },
      logout: () => {
        console.log('用户登出')
        localStorage.removeItem('token')
        set({ token: null, userInfo: null, isLoggedIn: false })
      },
    }),
    {
      name: 'user-storage',
      version: 1, // 添加版本号
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          // 迁移旧版本状态
          if (persistedState.token) {
            localStorage.setItem('token', persistedState.token)
          }
          return persistedState
        }
        return persistedState
      },
    }
  )
)
