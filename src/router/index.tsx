import { Suspense } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Spin } from 'antd'
import { routes } from './routes'
import AuthGuard from './AuthGuard'

const router = createBrowserRouter(routes)

const Loading = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <Spin size="large" />
  </div>
)

const Router = () => {
  return (
    <AuthGuard>
      <Suspense fallback={<Loading />}>
        <RouterProvider router={router} />
      </Suspense>
    </AuthGuard>
  )
}

export default Router
