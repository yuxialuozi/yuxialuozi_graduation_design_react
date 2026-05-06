import { useState } from 'react'
import { Form, Input, Button, Tabs, message, Alert } from 'antd'
import { UserOutlined, LockOutlined, TeamOutlined, CrownOutlined, FileTextOutlined, DollarOutlined, ToolOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '@/store'
import type { LoginParams } from '@/types'
import { login } from '@/api'
import './index.less'

const LogoIcon = () => (
  <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fff" />
        <stop offset="100%" stopColor="rgba(255,255,255,0.8)" />
      </linearGradient>
    </defs>
    <rect x="12" y="24" width="36" height="30" rx="2" fill="url(#logoGrad)" opacity="0.95"/>
    <polygon points="6,26 30,8 54,26" fill="#ed8936"/>
    <rect x="20" y="30" width="8" height="8" rx="1" fill="#ed8936"/>
    <rect x="32" y="30" width="8" height="8" rx="1" fill="#ed8936"/>
    <rect x="26" y="44" width="8" height="10" rx="1" fill="#1a365d"/>
    <circle cx="32" cy="49" r="1" fill="#ed8936"/>
  </svg>
)

const Login = () => {
  const navigate = useNavigate()
  const { login: userLogin } = useUserStore()
  const [form] = Form.useForm()
  const [activeTab, setActiveTab] = useState('tenant')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const onFinish = async (values: LoginParams) => {
    setErrorMsg('')
    try {
      setLoading(true)
      const result = await login(values)
      console.log('登录响应数据:', result)
      const userInfo = result.user
      if (!userInfo) {
        message.error('登录失败，服务器返回数据格式错误')
        return
      }
      console.log('用户信息:', userInfo)
      console.log('Token:', result.token)

      localStorage.setItem('token', result.token)

      userLogin(result.token, userInfo)
      setErrorMsg('')
      message.success('登录成功')

      if (userInfo.role === 'admin') {
        navigate('/dashboard')
      } else {
        navigate('/user/dashboard')
      }
    } catch (error: unknown) {
      const err = error as Error
      setErrorMsg(err.message || '登录失败，请检查用户名和密码')
    } finally {
      setLoading(false)
    }
  }

  const tabItems = [
    {
      key: 'tenant',
      label: (
        <span className="tab-label">
          <TeamOutlined />
          租户登录
        </span>
      ),
      children: (
        <div className="tab-content">
          <p className="tab-description">租户用户登录入口，可管理您的合同、账单和维修工单</p>
          <Form
            form={form}
            name="tenant-login"
            onFinish={onFinish}
            autoComplete="off"
            size="large"
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: '请输入用户名' }]}
            >
              <Input prefix={<UserOutlined />} placeholder="请输入用户名" />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="请输入密码" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block loading={loading} className="login-btn">
                登 录
              </Button>
            </Form.Item>
          </Form>
        </div>
      ),
    },
    {
      key: 'admin',
      label: (
        <span className="tab-label">
          <CrownOutlined />
          管理端登录
        </span>
      ),
      children: (
        <div className="tab-content">
          <p className="tab-description">管理员登录入口，可管理租户、房间、合同、费用等</p>
          <Form
            form={form}
            name="admin-login"
            onFinish={onFinish}
            autoComplete="off"
            size="large"
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: '请输入用户名' }]}
            >
              <Input prefix={<UserOutlined />} placeholder="请输入用户名" />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="请输入密码" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block loading={loading} className="login-btn">
                登 录
              </Button>
            </Form.Item>
          </Form>
        </div>
      ),
    },
  ]

  return (
    <div className="login-wrapper">
      <div className="login-left">
        <div className="brand-content">
          <div className="brand-logo">
            <LogoIcon />
          </div>
          <h1>租户信息管理系统</h1>
          <p className="brand-subtitle">智能高效的物业管理解决方案</p>
          <div className="brand-features">
            <div className="feature-item">
              <div className="feature-icon"><FileTextOutlined /></div>
              <span>合同管理</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon"><DollarOutlined /></div>
              <span>费用管理</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon"><ToolOutlined /></div>
              <span>维修服务</span>
            </div>
          </div>
        </div>
        <div className="brand-decoration" />
      </div>

      <div className="login-right">
        <div className="login-header">
          <h2>欢迎回来</h2>
          <p>请登录您的账号以继续</p>
        </div>

        <div className="login-card">
          {errorMsg && (
            <Alert
              message={errorMsg}
              type="error"
              showIcon
              style={{ marginBottom: 24 }}
            />
          )}
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
          />
        </div>

        <div className="login-footer">
          <p>演示账号: admin / 123456</p>
        </div>
      </div>
    </div>
  )
}

export default Login