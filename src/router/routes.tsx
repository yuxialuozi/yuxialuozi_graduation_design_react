import { lazy } from 'react'
import type { RouteObject } from 'react-router-dom'
import { MainLayout } from '@/layouts'

// 懒加载页面组件
const Login = lazy(() => import('@/pages/Login'))
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const TenantList = lazy(() => import('@/pages/Tenant/List'))
const ContractList = lazy(() => import('@/pages/Contract/List'))
const RoomList = lazy(() => import('@/pages/Room/List'))
const FeeList = lazy(() => import('@/pages/Fee/List'))
const MaintenanceList = lazy(() => import('@/pages/Maintenance/List'))
const Report = lazy(() => import('@/pages/Report'))

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
]
