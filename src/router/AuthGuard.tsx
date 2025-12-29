import { Navigate, useLocation } from 'react-router-dom'
import { useUserStore } from '@/store'

interface AuthGuardProps {
  children: React.ReactNode
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  const { isLoggedIn } = useUserStore()
  const location = useLocation()

  // 白名单路由，不需要登录
  const whiteList = ['/login']

  if (!isLoggedIn && !whiteList.includes(location.pathname)) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (isLoggedIn && location.pathname === '/login') {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

export default AuthGuard
