import { Navigate, useLocation } from 'react-router-dom'
import { useUserStore } from '@/store'

interface AuthGuardProps {
  children: React.ReactNode
}

// 管理端路由前缀（仅admin可访问）
const adminRoutes = ['/dashboard', '/tenant', '/contract', '/room', '/fee', '/maintenance', '/report']

// 用户端路由前缀（仅user可访问）
const userRoutes = ['/user']

// 白名单路由
const whiteList = ['/login']

const AuthGuard = ({ children }: AuthGuardProps) => {
  const { isLoggedIn, userInfo } = useUserStore()
  const location = useLocation()
  const { pathname } = location

  // 未登录，重定向到登录页
  if (!isLoggedIn && !whiteList.includes(pathname)) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // 已登录在登录页，重定向到对应首页
  if (isLoggedIn && pathname === '/login') {
    const defaultPath = userInfo?.role === 'admin' ? '/dashboard' : '/user/dashboard'
    return <Navigate to={defaultPath} replace />
  }

  // admin用户访问用户端路由，重定向到管理端
  if (isLoggedIn && userInfo?.role === 'admin' && userRoutes.some(route => pathname.startsWith(route))) {
    return <Navigate to="/dashboard" replace />
  }

  // 普通用户访问管理端路由，重定向到用户端
  if (isLoggedIn && userInfo?.role === 'user' && (pathname === '/' || adminRoutes.some(route => pathname.startsWith(route)))) {
    return <Navigate to="/user/dashboard" replace />
  }

  // admin用户访问根路径，重定向到dashboard
  if (isLoggedIn && userInfo?.role === 'admin' && pathname === '/') {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

export default AuthGuard