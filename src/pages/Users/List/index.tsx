import { useState, useEffect } from 'react'
import { Table, Card, Button, Space, Input, Tag, Modal, Form, Select, message, Switch, Popconfirm } from 'antd'
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, KeyOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { SystemUser } from '@/types'
import {
  getSystemUserList,
  createSystemUser,
  updateSystemUser,
  deleteSystemUser,
  resetSystemUserPassword,
  type SystemUserFormData,
  type SystemUserQueryParams,
} from '@/api'
import { getTenantList } from '@/api'
import './index.less'

const UserManagement = () => {
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [searchRole, setSearchRole] = useState('')
  const [data, setData] = useState<SystemUser[]>([])
  const [total, setTotal] = useState(0)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 })
  const [form] = Form.useForm()
  const [tenants, setTenants] = useState<{ id: number; name: string }[]>([])

  useEffect(() => {
    fetchData()
    fetchTenants()
  }, [pagination.current, pagination.pageSize, searchKeyword, searchRole])

  const fetchData = async () => {
    try {
      setLoading(true)
      const params: SystemUserQueryParams = {
        page: pagination.current,
        pageSize: pagination.pageSize,
      }
      if (searchKeyword) params.keyword = searchKeyword
      if (searchRole) params.role = searchRole

      const result = await getSystemUserList(params)
      setData(result.list)
      setTotal(result.total)
    } catch (error: unknown) {
      const err = error as Error
      if (err.name !== 'ApiError' && err.name !== 'HttpError') {
        message.error(err.message || '获取用户列表失败')
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchTenants = async () => {
    try {
      const result = await getTenantList({ page: 1, pageSize: 1000 })
      setTenants(result.list.map((t) => ({ id: t.id, name: t.name })))
    } catch {
      // ignore errors for tenant list
    }
  }

  const columns: ColumnsType<SystemUser> = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: '用户名', dataIndex: 'username', key: 'username' },
    { title: '昵称', dataIndex: 'nickname', key: 'nickname' },
    { title: '手机号', dataIndex: 'phone', key: 'phone' },
    { title: '邮箱', dataIndex: 'email', key: 'email' },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={role === 'admin' ? 'blue' : 'green'}>
          {role === 'admin' ? '管理员' : '租户用户'}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record) => (
        <Switch
          checked={status === 'active'}
          checkedChildren="启用"
          unCheckedChildren="停用"
          onChange={(checked) => handleStatusChange(record, checked)}
          loading={loading}
        />
      ),
    },
    { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', width: 180 },
    {
      title: '操作',
      key: 'action',
      width: 220,
      render: (_, record) => (
        <Space size="small">
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)} size="small">
            编辑
          </Button>
          <Button type="link" icon={<KeyOutlined />} onClick={() => handleResetPassword(record)} size="small">
            重置密码
          </Button>
          <Popconfirm
            title="确认删除"
            description={`确定要删除用户 "${record.username}" 吗？`}
            onConfirm={() => handleDelete(record)}
            okText="删除"
            cancelText="取消"
            okButtonProps={{ danger: true }}
          >
            <Button type="link" danger icon={<DeleteOutlined />} size="small">
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const handleAdd = () => {
    setEditingId(null)
    form.resetFields()
    form.setFieldsValue({ role: 'user', status: 'active' })
    setModalVisible(true)
  }

  const handleEdit = (record: SystemUser) => {
    setEditingId(record.id)
    form.setFieldsValue(record)
    setModalVisible(true)
  }

  const handleDelete = async (record: SystemUser) => {
    try {
      await deleteSystemUser(record.id)
      message.success('删除成功')
      fetchData()
    } catch (error: unknown) {
      const err = error as Error
      if (err.name !== 'ApiError' && err.name !== 'HttpError') {
        message.error(err.message || '删除失败')
      }
    }
  }

  const handleResetPassword = async (record: SystemUser) => {
    try {
      const result = await resetSystemUserPassword(record.id)
      Modal.success({
        title: '密码重置成功',
        content: `用户 "${record.username}" 的新密码为：${result.newPassword}，请告知用户及时修改。`,
      })
    } catch (error: unknown) {
      const err = error as Error
      if (err.name !== 'ApiError' && err.name !== 'HttpError') {
        message.error(err.message || '重置密码失败')
      }
    }
  }

  const handleStatusChange = async (record: SystemUser, checked: boolean) => {
    try {
      await updateSystemUser(record.id, { status: checked ? 'active' : 'inactive' })
      message.success(checked ? '用户已启用' : '用户已停用')
      fetchData()
    } catch (error: unknown) {
      const err = error as Error
      if (err.name !== 'ApiError' && err.name !== 'HttpError') {
        message.error(err.message || '状态更新失败')
      }
    }
  }

  const handleModalOk = () => {
    form.validateFields().then(async (values) => {
      try {
        setLoading(true)
        const formData: SystemUserFormData = {
          username: values.username,
          password: values.password,
          nickname: values.nickname,
          phone: values.phone,
          email: values.email,
          role: values.role,
          tenantId: values.tenantId,
          status: values.status,
        }

        if (editingId) {
          await updateSystemUser(editingId, formData)
          message.success('更新成功')
        } else {
          await createSystemUser(formData)
          message.success('创建成功')
        }

        setModalVisible(false)
        form.resetFields()
        setEditingId(null)
        fetchData()
      } catch (error: unknown) {
        const err = error as Error
        if (err.name !== 'ApiError' && err.name !== 'HttpError') {
          message.error(err.message || (editingId ? '更新失败' : '创建失败'))
        }
      } finally {
        setLoading(false)
      }
    })
  }

  const handleSearch = (value: string) => {
    setSearchKeyword(value)
    setPagination({ ...pagination, current: 1 })
  }

  const handleRoleFilter = (value: string) => {
    setSearchRole(value || '')
    setPagination({ ...pagination, current: 1 })
  }

  const handleTableChange = (pag: any) => {
    setPagination({ current: pag.current, pageSize: pag.pageSize })
  }

  return (
    <div className="user-management">
      <div className="page-header">
        <div className="page-title">
          <h2>用户管理</h2>
          <p>管理系统用户账号，包括创建、编辑、删除和密码重置操作</p>
        </div>
      </div>

      <Card bordered={false} className="content-card">
        <div className="search-bar">
          <Space>
            <Input.Search
              placeholder="搜索用户名、昵称"
              allowClear
              style={{ width: 240 }}
              prefix={<SearchOutlined />}
              onSearch={handleSearch}
            />
            <Select
              allowClear
              placeholder="角色筛选"
              style={{ width: 140 }}
              onChange={handleRoleFilter}
            >
              <Select.Option value="admin">管理员</Select.Option>
              <Select.Option value="user">租户用户</Select.Option>
            </Select>
          </Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增用户
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          onChange={handleTableChange}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total,
            showTotal: (t) => `共 ${t} 条`,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      <Modal
        title={editingId ? '编辑用户' : '新增用户'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => { setModalVisible(false); form.resetFields() }}
        confirmLoading={loading}
        width={600}
        destroyOnClose
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="请输入用户名" disabled={!!editingId} />
          </Form.Item>
          {!editingId && (
            <Form.Item
              name="password"
              label="初始密码"
              rules={[{ required: true, message: '请输入初始密码' }, { min: 6, message: '密码至少6位' }]}
            >
              <Input.Password placeholder="请输入初始密码" />
            </Form.Item>
          )}
          <Form.Item name="nickname" label="昵称">
            <Input placeholder="请输入昵称" />
          </Form.Item>
          <Form.Item name="phone" label="手机号">
            <Input placeholder="请输入手机号" />
          </Form.Item>
          <Form.Item name="email" label="邮箱" rules={[{ type: 'email', message: '请输入正确的邮箱' }]}>
            <Input placeholder="请输入邮箱" />
          </Form.Item>
          <Form.Item name="role" label="角色" rules={[{ required: true, message: '请选择角色' }]}>
            <Select placeholder="请选择角色">
              <Select.Option value="admin">管理员</Select.Option>
              <Select.Option value="user">租户用户</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="tenantId" label="绑定租户">
            <Select allowClear placeholder="请选择绑定的租户（租户用户必选）" showSearch
              filterOption={(input, option) =>
                (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
              }>
              {tenants.map((t) => (
                <Select.Option key={t.id} value={t.id}>{t.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          {editingId && (
            <Form.Item name="status" label="状态">
              <Select placeholder="请选择状态">
                <Select.Option value="active">启用</Select.Option>
                <Select.Option value="inactive">停用</Select.Option>
              </Select>
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  )
}

export default UserManagement