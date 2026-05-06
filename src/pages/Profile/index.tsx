import { useState, useEffect } from 'react'
import { Card, Form, Input, Button, message, Tabs, Row, Col, Divider } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { getProfile, updateProfile, changePassword } from '@/api'
import './index.less'

const Profile = () => {
  const [loading, setLoading] = useState(false)
  const [profileForm] = Form.useForm()
  const [passwordForm] = Form.useForm()

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const data = await getProfile()
      profileForm.setFieldsValue({
        username: data.username,
        nickname: data.nickname,
        phone: data.phone,
        email: data.email,
        role: data.role === 'admin' ? '管理员' : '租户用户',
      })
    } catch (error: unknown) {
      const err = error as Error
      if (err.name !== 'ApiError' && err.name !== 'HttpError') {
        message.error(err.message || '获取个人资料失败')
      }
    }
  }

  const handleProfileSubmit = () => {
    profileForm.validateFields().then(async (values) => {
      try {
        setLoading(true)
        await updateProfile({
          nickname: values.nickname,
          phone: values.phone,
          email: values.email,
        })
        message.success('资料更新成功')
        fetchProfile()
      } catch (error: unknown) {
        const err = error as Error
        if (err.name !== 'ApiError' && err.name !== 'HttpError') {
          message.error(err.message || '更新失败')
        }
      } finally {
        setLoading(false)
      }
    })
  }

  const handlePasswordSubmit = () => {
    passwordForm.validateFields().then(async (values) => {
      if (values.newPassword !== values.confirmPassword) {
        message.error('两次输入的密码不一致')
        return
      }
      try {
        setLoading(true)
        await changePassword({
          oldPassword: values.oldPassword,
          newPassword: values.newPassword,
        })
        message.success('密码修改成功')
        passwordForm.resetFields()
      } catch (error: unknown) {
        const err = error as Error
        if (err.name !== 'ApiError' && err.name !== 'HttpError') {
          message.error(err.message || '密码修改失败')
        }
      } finally {
        setLoading(false)
      }
    })
  }

  const tabItems = [
    {
      key: 'profile',
      label: (
        <span>
          <UserOutlined />
          个人资料
        </span>
      ),
      children: (
        <div className="profile-form-wrapper">
          <Form
            form={profileForm}
            layout="vertical"
            className="profile-form"
          >
            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item name="username" label="用户名">
                  <Input disabled />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="role" label="角色">
                  <Input disabled />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item name="nickname" label="昵称">
                  <Input placeholder="请输入昵称" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="phone" label="手机号">
                  <Input placeholder="请输入手机号" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item name="email" label="邮箱" rules={[{ type: 'email', message: '请输入正确的邮箱' }]}>
                  <Input placeholder="请输入邮箱" />
                </Form.Item>
              </Col>
            </Row>
            <Divider />
            <Form.Item>
              <Button type="primary" onClick={handleProfileSubmit} loading={loading}>
                保存修改
              </Button>
            </Form.Item>
          </Form>
        </div>
      ),
    },
    {
      key: 'password',
      label: (
        <span>
          <LockOutlined />
          修改密码
        </span>
      ),
      children: (
        <div className="password-form-wrapper">
          <Form
            form={passwordForm}
            layout="vertical"
            className="password-form"
          >
            <Form.Item
              name="oldPassword"
              label="当前密码"
              rules={[{ required: true, message: '请输入当前密码' }]}
            >
              <Input.Password placeholder="请输入当前密码" />
            </Form.Item>
            <Form.Item
              name="newPassword"
              label="新密码"
              rules={[
                { required: true, message: '请输入新密码' },
                { min: 6, message: '新密码至少6位' },
              ]}
            >
              <Input.Password placeholder="请输入新密码（至少6位）" />
            </Form.Item>
            <Form.Item
              name="confirmPassword"
              label="确认新密码"
              rules={[
                { required: true, message: '请确认新密码' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve()
                    }
                    return Promise.reject(new Error('两次输入的密码不一致'))
                  },
                }),
              ]}
            >
              <Input.Password placeholder="请再次输入新密码" />
            </Form.Item>
            <Divider />
            <Form.Item>
              <Button type="primary" onClick={handlePasswordSubmit} loading={loading}>
                修改密码
              </Button>
            </Form.Item>
          </Form>
        </div>
      ),
    },
  ]

  return (
    <div className="profile-page">
      <div className="page-header">
        <div className="page-title">
          <h2>个人中心</h2>
          <p>管理您的个人信息、修改密码</p>
        </div>
      </div>

      <Card bordered={false} className="content-card">
        <Tabs defaultActiveKey="profile" items={tabItems} />
      </Card>
    </div>
  )
}

export default Profile