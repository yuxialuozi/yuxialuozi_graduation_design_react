import { useEffect, useState } from 'react'
import { Card, Descriptions, Row, Col, Statistic, Spin, message, Tag, Button, Modal, Form, Input } from 'antd'
import {
  HomeOutlined,
  FileTextOutlined,
  DollarOutlined,
  ToolOutlined,
  LockOutlined,
} from '@ant-design/icons'
import { getTenantProfile, changePassword } from '@/api/user'
import { useUserStore } from '@/store'
import type { TenantProfile } from '@/types'
import './index.less'

const UserProfile = () => {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<TenantProfile | null>(null)
  const [passwordModalVisible, setPasswordModalVisible] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [form] = Form.useForm()
  const { userInfo } = useUserStore()

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const data = await getTenantProfile()
      setProfile(data)
    } catch (error: unknown) {
      const err = error as Error
      if (err.name !== 'ApiError' && err.name !== 'HttpError') {
        message.error(err.message || '获取信息失败')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  const handlePasswordChange = async () => {
    try {
      const values = await form.validateFields()
      setPasswordLoading(true)
      await changePassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      })
      message.success('密码修改成功')
      setPasswordModalVisible(false)
      form.resetFields()
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'errorFields' in error) {
        return
      }
      const err = error as Error
      if (err.name !== 'ApiError' && err.name !== 'HttpError') {
        message.error(err.message || '密码修改失败')
      }
    } finally {
      setPasswordLoading(false)
    }
  }

  const getRoleTag = () => {
    const role = userInfo?.role
    if (role === 'admin') {
      return <Tag color="red">管理员</Tag>
    }
    return <Tag color="blue">租户用户</Tag>
  }

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div className="user-profile">
      <div className="page-header">
        <h2>个人信息</h2>
        <p>查看和管理您的个人信息和账号设置</p>
      </div>

      {/* 统计信息 */}
      <Row gutter={[16, 16]} className="stats-row">
        <Col xs={12} lg={6}>
          <Card bordered={false} className="stat-card">
            <Statistic
              title="有效合同"
              value={profile?.activeContract || 0}
              prefix={<FileTextOutlined style={{ color: '#3182ce' }} />}
              valueStyle={{ color: '#1a365d' }}
            />
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card bordered={false} className="stat-card">
            <Statistic
              title="租住房间"
              value={profile?.activeRoom || 0}
              prefix={<HomeOutlined style={{ color: '#48bb78' }} />}
              valueStyle={{ color: '#1a365d' }}
            />
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card bordered={false} className="stat-card">
            <Statistic
              title="未缴费用"
              value={profile?.unpaidFee || 0}
              precision={2}
              suffix="元"
              prefix={<DollarOutlined style={{ color: (profile?.unpaidFee || 0) > 0 ? '#f56565' : '#48bb78' }} />}
              valueStyle={{ color: (profile?.unpaidFee || 0) > 0 ? '#f56565' : '#48bb78' }}
            />
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card bordered={false} className="stat-card">
            <Statistic
              title="待处理维修"
              value={profile?.pendingMaintenance || 0}
              prefix={<ToolOutlined style={{ color: (profile?.pendingMaintenance || 0) > 0 ? '#ed8936' : '#48bb78' }} />}
              valueStyle={{ color: (profile?.pendingMaintenance || 0) > 0 ? '#ed8936' : '#48bb78' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 租户基本信息 */}
      <Card title="租户信息" className="profile-card">
        <Descriptions column={2}>
          <Descriptions.Item label="租户名称">{profile?.tenantName || '-'}</Descriptions.Item>
          <Descriptions.Item label="联系人">{profile?.contact || '-'}</Descriptions.Item>
          <Descriptions.Item label="联系电话">{profile?.phone || '-'}</Descriptions.Item>
          <Descriptions.Item label="电子邮箱">{profile?.email || '-'}</Descriptions.Item>
        </Descriptions>
      </Card>

      {/* 账号信息 */}
      <Card
        title="账号信息"
        className="profile-card"
        extra={
          <Button type="primary" icon={<LockOutlined />} onClick={() => setPasswordModalVisible(true)}>
            修改密码
          </Button>
        }
      >
        <Descriptions column={2}>
          <Descriptions.Item label="用户名">{profile?.username || '-'}</Descriptions.Item>
          <Descriptions.Item label="昵称">{profile?.nickname || '-'}</Descriptions.Item>
          <Descriptions.Item label="用户角色">{getRoleTag()}</Descriptions.Item>
          <Descriptions.Item label="租户ID">{profile?.tenantId || '-'}</Descriptions.Item>
        </Descriptions>
      </Card>

      {/* 修改密码弹窗 */}
      <Modal
        title="修改密码"
        open={passwordModalVisible}
        onOk={handlePasswordChange}
        onCancel={() => {
          setPasswordModalVisible(false)
          form.resetFields()
        }}
        confirmLoading={passwordLoading}
        okText="确认修改"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="oldPassword"
            label="原密码"
            rules={[{ required: true, message: '请输入原密码' }]}
          >
            <Input.Password placeholder="请输入原密码" />
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
            dependencies={['newPassword']}
            rules={[
              { required: true, message: '请再次输入新密码' },
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
        </Form>
      </Modal>
    </div>
  )
}

export default UserProfile