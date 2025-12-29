import { Layout, Avatar, Dropdown, Space } from 'antd'
import { UserOutlined, LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { useUserStore, useAppStore } from '@/store'
import { useNavigate } from 'react-router-dom'
import './index.less'

const { Header: AntHeader } = Layout

const Header = () => {
  const navigate = useNavigate()
  const { userInfo, logout } = useUserStore()
  const { collapsed, toggleCollapsed } = useAppStore()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const items: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人中心',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ]

  return (
    <AntHeader className="app-header">
      <div className="header-left">
        <span className="trigger" onClick={toggleCollapsed}>
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </span>
      </div>
      <div className="header-right">
        <Dropdown menu={{ items }} placement="bottomRight">
          <Space className="user-info">
            <Avatar size="small" icon={<UserOutlined />} />
            <span className="username">{userInfo?.nickname || '用户'}</span>
          </Space>
        </Dropdown>
      </div>
    </AntHeader>
  )
}

export default Header
