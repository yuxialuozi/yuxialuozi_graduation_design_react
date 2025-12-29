import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, useRoutes } from 'react-router-dom'
import { ConfigProvider, Spin } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { routes } from './router/routes'
import 'antd/dist/reset.css'
import './assets/styles/global.less'

const Loading = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <Spin size="large" />
  </div>
)

const AppRoutes = () => {
  const element = useRoutes(routes)
  return <Suspense fallback={<Loading />}>{element}</Suspense>
}

const App = () => {
  return (
    <ConfigProvider locale={zhCN}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ConfigProvider>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
