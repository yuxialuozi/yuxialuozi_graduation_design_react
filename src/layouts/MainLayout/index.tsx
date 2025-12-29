import { Layout } from 'antd'
import { Outlet } from 'react-router-dom'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import Footer from '../components/Footer'
import { useAppStore } from '@/store'
import './index.less'

const { Content } = Layout

const MainLayout = () => {
  const { collapsed } = useAppStore()

  return (
    <Layout className="app-layout">
      <Sidebar />
      <Layout className="site-layout" style={{ marginLeft: collapsed ? 80 : 200 }}>
        <Header />
        <Content className="site-content">
          <Outlet />
        </Content>
        <Footer />
      </Layout>
    </Layout>
  )
}

export default MainLayout
