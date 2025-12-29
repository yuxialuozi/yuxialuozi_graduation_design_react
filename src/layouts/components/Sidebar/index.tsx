import { Layout, Menu } from 'antd'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  DashboardOutlined,
  UserOutlined,
  FileTextOutlined,
  HomeOutlined,
  DollarOutlined,
  ToolOutlined,
  BarChartOutlined,
} from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { useAppStore } from '@/store'
import './index.less'

const { Sider } = Layout

type MenuItem = Required<MenuProps>['items'][number]

const menuItems: MenuItem[] = [
  {
    key: '/dashboard',
    icon: <DashboardOutlined />,
    label: '仪表盘',
  },
  {
    key: '/tenant',
    icon: <UserOutlined />,
    label: '租户管理',
    children: [
      { key: '/tenant/list', label: '租户列表' },
    ],
  },
  {
    key: '/contract',
    icon: <FileTextOutlined />,
    label: '合同管理',
    children: [
      { key: '/contract/list', label: '合同列表' },
    ],
  },
  {
    key: '/room',
    icon: <HomeOutlined />,
    label: '房间管理',
    children: [
      { key: '/room/list', label: '房间列表' },
    ],
  },
  {
    key: '/fee',
    icon: <DollarOutlined />,
    label: '费用管理',
    children: [
      { key: '/fee/list', label: '费用列表' },
    ],
  },
  {
    key: '/maintenance',
    icon: <ToolOutlined />,
    label: '维修管理',
    children: [
      { key: '/maintenance/list', label: '维修列表' },
    ],
  },
  {
    key: '/report',
    icon: <BarChartOutlined />,
    label: '报表统计',
  },
]

const Sidebar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { collapsed } = useAppStore()

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    navigate(key)
  }

  // 获取当前路径的父级路径作为默认展开项
  const getOpenKeys = () => {
    const pathParts = location.pathname.split('/')
    if (pathParts.length > 2) {
      return [`/${pathParts[1]}`]
    }
    return []
  }

  return (
    <Sider trigger={null} collapsible collapsed={collapsed} className="app-sidebar">
      <div className="logo">
        <h1>{collapsed ? '租' : '租户管理系统'}</h1>
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        defaultOpenKeys={getOpenKeys()}
        items={menuItems}
        onClick={handleMenuClick}
      />
    </Sider>
  )
}

export default Sidebar
