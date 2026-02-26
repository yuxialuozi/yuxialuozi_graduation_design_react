import { Form, Input, Button, Card, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '@/store'
import type { LoginParams } from '@/types'
import { login } from '@/api'
import './index.less'

const Login = () => {
  const navigate = useNavigate()
  const { login: userLogin } = useUserStore()
  const [form] = Form.useForm()

  const onFinish = async (values: LoginParams) => {
    try {
      const result = await login(values)
      console.log('登录响应数据:', result) // 调试日志
      // 后端现在返回 userInfo 字段，做兼容处理
      const userInfo = result.userInfo || result.user
      if (!userInfo) {
        message.error('登录失败，服务器返回数据格式错误')
        return
      }
      console.log('用户信息:', userInfo) // 调试日志
      console.log('Token:', result.token) // 调试日志

      // 手动保存token到localStorage，确保axios拦截器能获取到
      localStorage.setItem('token', result.token)

      userLogin(result.token, userInfo)
      message.success('登录成功')
      navigate('/dashboard')
    } catch (error) {
      console.error('登录错误:', error)
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
