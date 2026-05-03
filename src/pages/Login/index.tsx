import { useState } from 'react'
import { Form, Input, Button, Card, Tabs, message } from 'antd'
import { UserOutlined, LockOutlined, TeamOutlined, CrownOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '@/store'
import type { LoginParams } from '@/types'
import { login } from '@/api'
import './index.less'

const Login = () => {
  const navigate = useNavigate()
  const { login: userLogin } = useUserStore()
  const [form] = Form.useForm()
  const [activeTab, setActiveTab] = useState('tenant')
  const [loading, setLoading] = useState(false)

  const onFinish = async (values: LoginParams) => {
    try {
      setLoading(true)
      const result = await login(values)
      console.log('登录响应数据:', result)
      const userInfo = result.userInfo || result.user
      if (!userInfo) {
        message.error('登录失败，服务器返回数据格式错误')
        return
      }
      console.log('用户信息:', userInfo)
      console.log('Token:', result.token)

      // 手动保存token到localStorage
      localStorage.setItem('token', result.token)

      userLogin(result.token, userInfo)
      message.success('登录成功')

      // 根据角色跳转到不同页面
      if (userInfo.role === 'admin') {
        navigate('/dashboard')
      } else {
        navigate('/user/dashboard')
      }
    } catch (error) {
      console.error('登录错误:', error)
      message.error('登录失败，请检查用户名和密码')
    } finally {
      setLoading(false)
    }
  }

  const tabItems = [
    {
      key: 'tenant',
      label: (
        <span>
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
              <Input prefix={<UserOutlined />} placeholder="用户名" />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="密码" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block loading={loading}>
                登录
              </Button>
            </Form.Item>
          </Form>
        </div>
      ),
    },
    {
      key: 'admin',
      label: (
        <span>
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
              <Input prefix={<UserOutlined />} placeholder="用户名" />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="密码" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block loading={loading}>
                登录
              </Button>
            </Form.Item>
          </Form>
        </div>
      ),
    },
  ]

  return (
    <div className="login-container">
      <Card className="login-card" title="租户信息管理系统">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          centered
        />
        <div className="login-tips">
          <p>演示账号: admin / 123456</p>
        </div>
      </Card>
    </div>
  )
}

export default Login
