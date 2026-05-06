import { Layout, Menu } from 'antd'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  DashboardOutlined,
  UserOutlined,
  FileTextOutlined,
  DollarOutlined,
  ToolOutlined,
  RobotOutlined,
} from '@ant-design/icons'
import type { MenuProps } from 'antd'
import './index.less'

const { Sider } = Layout

type MenuItem = Required<MenuProps>['items'][number]

const LogoIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="10" width="16" height="12" rx="1" fill="white" opacity="0.9"/>
    <polygon points="3,11 12,4 21,11" fill="#ed8936"/>
    <rect x="8" y="13" width="3" height="3" rx="0.5" fill="#ed8936"/>
    <rect x="13" y="13" width="3" height="3" rx="0.5" fill="#ed8936"/>
    <rect x="10" y="17" width="4" height="5" rx="0.5" fill="#1a365d"/>
  </svg>
)

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
  {
    key: '/user/ai',
    icon: <RobotOutlined />,
    label: 'AI 助手',
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
        <div className="logo-icon">
          <LogoIcon />
        </div>
        <h1>租户信息管理</h1>
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