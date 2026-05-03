import { lazy } from 'react'
import type { RouteObject } from 'react-router-dom'
import { MainLayout } from '@/layouts'
import UserLayout from '@/layouts/UserLayout'

// 懒加载页面组件
const Login = lazy(() => import('@/pages/Login'))
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const TenantList = lazy(() => import('@/pages/Tenant/List'))
const ContractList = lazy(() => import('@/pages/Contract/List'))
const RoomList = lazy(() => import('@/pages/Room/List'))
const FeeList = lazy(() => import('@/pages/Fee/List'))
const MaintenanceList = lazy(() => import('@/pages/Maintenance/List'))
const Report = lazy(() => import('@/pages/Report'))

// 用户端页面组件
const UserDashboard = lazy(() => import('@/pages/User/Dashboard'))
const UserProfile = lazy(() => import('@/pages/User/Profile'))
const UserContract = lazy(() => import('@/pages/User/Contract'))
const UserFee = lazy(() => import('@/pages/User/Fee'))
const UserMaintenance = lazy(() => import('@/pages/User/Maintenance'))

export const routes: RouteObject[] = [
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'tenant',
        children: [
          {
            path: 'list',
            element: <TenantList />,
          },
        ],
      },
      {
        path: 'contract',
        children: [
          {
            path: 'list',
            element: <ContractList />,
          },
        ],
      },
      {
        path: 'room',
        children: [
          {
            path: 'list',
            element: <RoomList />,
          },
        ],
      },
      {
        path: 'fee',
        children: [
          {
            path: 'list',
            element: <FeeList />,
          },
        ],
      },
      {
        path: 'maintenance',
        children: [
          {
            path: 'list',
            element: <MaintenanceList />,
          },
        ],
      },
      {
        path: 'report',
        element: <Report />,
      },
    ],
  },
  // 用户端路由
  {
    path: '/user',
    element: <UserLayout />,
    children: [
      {
        index: true,
        element: <UserDashboard />,
      },
      {
        path: 'dashboard',
        element: <UserDashboard />,
      },
      {
        path: 'profile',
        element: <UserProfile />,
      },
      {
        path: 'contract',
        element: <UserContract />,
      },
      {
        path: 'fee',
        element: <UserFee />,
      },
      {
        path: 'maintenance',
        element: <UserMaintenance />,
      },
    ],
  },
]
