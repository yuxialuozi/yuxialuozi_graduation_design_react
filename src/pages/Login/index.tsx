import { Form, Input, Button, Card, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '@/store'
import type { LoginParams } from '@/types'
import './index.less'

const Login = () => {
  const navigate = useNavigate()
  const { login } = useUserStore()
  const [form] = Form.useForm()

  const onFinish = async (values: LoginParams) => {
    try {
      // TODO: 调用实际的登录 API
      // const result = await loginApi(values)

      // 模拟登录成功
      const mockUserInfo = {
        id: 1,
        username: values.username,
        nickname: '管理员',
        role: 'admin',
        permissions: ['*'],
      }
      const mockToken = 'mock-token-' + Date.now()

      login(mockToken, mockUserInfo)
      message.success('登录成功')
      navigate('/dashboard')
    } catch (error) {
      message.error('登录失败，请检查用户名和密码')
    }
  }

  return (
    <div className="login-container">
      <Card className="login-card" title="租户信息管理系统">
        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="用户名"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              登录
            </Button>
          </Form.Item>
        </Form>
        <div className="login-tips">
          <p>演示账号: admin / 123456</p>
        </div>
      </Card>
    </div>
  )
}

export default Login
