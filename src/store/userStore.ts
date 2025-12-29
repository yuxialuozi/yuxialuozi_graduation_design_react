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
      setToken: (token) => set({ token, isLoggedIn: !!token }),
      setUserInfo: (userInfo) => set({ userInfo }),
      login: (token, userInfo) => set({ token, userInfo, isLoggedIn: true }),
      logout: () => set({ token: null, userInfo: null, isLoggedIn: false }),
    }),
    {
      name: 'user-storage',
    }
  )
)
