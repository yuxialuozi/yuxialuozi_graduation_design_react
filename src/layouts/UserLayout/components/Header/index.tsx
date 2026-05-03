import { Layout, Avatar, Dropdown, Space, Badge } from 'antd'
import { UserOutlined, LogoutOutlined, BellOutlined } from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { useUserStore } from '@/store'
import { useNavigate } from 'react-router-dom'
import './index.less'

const { Header: AntHeader } = Layout

const UserHeader = () => {
  const navigate = useNavigate()
  const { userInfo, logout } = useUserStore()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const items: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人信息',
      onClick: () => navigate('/user/profile'),
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
    <AntHeader className="user-header">
      <div className="header-right">
        <div className="header-title">租户信息管理系统 - 用户端</div>
        <Space size="large">
          <Badge count={0} size="small">
            <BellOutlined style={{ fontSize: 18, cursor: 'pointer' }} />
          </Badge>
          <Dropdown menu={{ items }} placement="bottomRight">
            <Space className="user-info">
              <Avatar size="small" icon={<UserOutlined />} />
              <span className="username">{userInfo?.nickname || '租户用户'}</span>
            </Space>
          </Dropdown>
        </Space>
      </div>
    </AntHeader>
  )
}

export default UserHeader