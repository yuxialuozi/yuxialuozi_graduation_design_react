import { Layout, Menu } from 'antd'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  DashboardOutlined,
  UserOutlined,
  FileTextOutlined,
  DollarOutlined,
  ToolOutlined,
} from '@ant-design/icons'
import type { MenuProps } from 'antd'
import './index.less'

const { Sider } = Layout

type MenuItem = Required<MenuProps>['items'][number]

const menuItems: MenuItem[] = [
  {
    key: '/user/dashboard',
    icon: <DashboardOutlined />,
    label: '我的首页',
  },
  {
    key: '/user/profile',
    icon: <UserOutlined />,
    label: '个人信息',
  },
  {
    key: '/user/contract',
    icon: <FileTextOutlined />,
    label: '我的合同',
  },
  {
    key: '/user/fee',
    icon: <DollarOutlined />,
    label: '我的账单',
  },
  {
    key: '/user/maintenance',
    icon: <ToolOutlined />,
    label: '维修工单',
  },
]

const UserSidebar = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    navigate(key)
  }

  return (
    <Sider className="user-sidebar" width={220}>
      <div className="logo">
        <h1>租户端</h1>
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={handleMenuClick}
      />
    </Sider>
  )
}

export default UserSidebar