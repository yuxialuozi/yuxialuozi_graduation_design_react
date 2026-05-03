import { Layout } from 'antd'
import { Outlet } from 'react-router-dom'
import UserHeader from './components/Header'
import UserSidebar from './components/Sidebar'
import './index.less'

const { Content } = Layout

const UserLayout = () => {
  return (
    <Layout className="user-layout">
      <UserSidebar />
      <Layout className="site-layout">
        <UserHeader />
        <Content className="site-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default UserLayout