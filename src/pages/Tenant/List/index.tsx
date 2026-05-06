import { useState, useEffect } from 'react'
import { Table, Card, Button, Space, Input, Modal, Form, Select, message, Switch, Popconfirm } from 'antd'
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { Tenant } from '@/types'
import { getTenantList, createTenant, updateTenant, deleteTenant, type TenantFormData, type TenantQueryParams } from '@/api'
import './index.less'

const TenantList = () => {
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [data, setData] = useState<Tenant[]>([])
  const [total, setTotal] = useState(0)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 })
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [form] = Form.useForm()

  useEffect(() => {
    fetchData()
  }, [pagination.current, pagination.pageSize, searchKeyword])

  const fetchData = async () => {
    try {
      setLoading(true)
      const params: TenantQueryParams = {
        page: pagination.current,
        pageSize: pagination.pageSize,
      }
      if (searchKeyword) params.keyword = searchKeyword

      const result = await getTenantList(params)
      setData(result.list)
      setTotal(result.total)
    } catch (error: unknown) {
      const err = error as Error
      if (err.name !== 'ApiError' && err.name !== 'HttpError') {
        message.error(err.message || '获取租户列表失败')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (record: Tenant, checked: boolean) => {
    try {
      await updateTenant(record.id, { ...record, status: checked ? 'active' : 'inactive' })
      message.success(checked ? '租户已启用' : '租户已停用')
      fetchData()
    } catch (error: unknown) {
      const err = error as Error
      if (err.name !== 'ApiError' && err.name !== 'HttpError') {
        message.error(err.message || '状态更新失败')
      }
    }
  }

  const handleBatchDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要删除的租户')
      return
    }
    Modal.confirm({
      title: '批量删除确认',
      content: `确定要删除选中的 ${selectedRowKeys.length} 个租户吗？此操作不可撤销。`,
      okText: '确认删除',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          setLoading(true)
          await Promise.all(selectedRowKeys.map((id) => deleteTenant(id as number)))
          message.success('批量删除成功')
          setSelectedRowKeys([])
          fetchData()
        } catch (error: unknown) {
          const err = error as Error
          if (err.name !== 'ApiError' && err.name !== 'HttpError') {
            message.error(err.message || '批量删除失败')
          }
        } finally {
          setLoading(false)
        }
      },
    })
  }

  const columns: ColumnsType<Tenant> = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: '租户名称', dataIndex: 'name', key: 'name' },
    { title: '联系人', dataIndex: 'contactPerson', key: 'contactPerson' },
    { title: '联系电话', dataIndex: 'phone', key: 'phone' },
    { title: '邮箱', dataIndex: 'email', key: 'email' },
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
      width: 150,
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)} className="action-btn">
            编辑
          </Button>
          <Popconfirm
            title="确认删除"
            description={`确定要删除租户 "${record.name}" 吗？`}
            onConfirm={() => handleDelete(record)}
            okText="删除"
            cancelText="取消"
            okButtonProps={{ danger: true }}
          >
            <Button type="link" danger icon={<DeleteOutlined />} className="action-btn">
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
  }

  const handleAdd = () => {
    setEditingId(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (record: Tenant) => {
    setEditingId(record.id)
    form.setFieldsValue(record)
    setModalVisible(true)
  }

  const handleDelete = async (record: Tenant) => {
    try {
      await deleteTenant(record.id)
      message.success('删除成功')
      fetchData()
    } catch (error: unknown) {
      const err = error as Error
      if (err.name !== 'ApiError' && err.name !== 'HttpError') {
        message.error(err.message || '删除失败')
      }
    }
  }

  const handleModalOk = () => {
    form.validateFields().then(async (values) => {
      try {
        setLoading(true)
        const formData: TenantFormData = values

        if (editingId) {
          await updateTenant(editingId, formData)
          message.success('更新成功')
        } else {
          await createTenant(formData)
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

  const handleTableChange = (pag: any) => {
    setPagination({ current: pag.current, pageSize: pag.pageSize })
  }

  return (
    <div className="tenant-list">
      <div className="page-header">
        <div className="page-title">
          <h2>租户管理</h2>
          <p>管理所有租户信息，包括新增、编辑和删除操作</p>
        </div>
      </div>

      <Card bordered={false} className="content-card">
        <div className="search-bar">
          <Space>
            <Input.Search
              placeholder="搜索租户名称、联系人或电话"
              allowClear
              style={{ width: 300 }}
              prefix={<SearchOutlined />}
              onSearch={handleSearch}
            />
            {selectedRowKeys.length > 0 && (
              <Popconfirm
                title="批量删除确认"
                description={`确定要删除选中的 ${selectedRowKeys.length} 个租户吗？`}
                onConfirm={handleBatchDelete}
                okText="确认删除"
                cancelText="取消"
                okButtonProps={{ danger: true }}
              >
                <Button danger icon={<DeleteOutlined />}>
                  批量删除({selectedRowKeys.length})
                </Button>
              </Popconfirm>
            )}
          </Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增租户
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          onChange={handleTableChange}
          rowSelection={rowSelection}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total,
            showTotal: (totalCount) => `共 ${totalCount} 条`,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
          }}
        />
      </Card>

      <Modal
        title={editingId ? '编辑租户' : '新增租户'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        confirmLoading={loading}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="租户名称"
            rules={[{ required: true, message: '请输入租户名称' }]}
          >
            <Input placeholder="请输入租户名称" />
          </Form.Item>
          <Form.Item
            name="contactPerson"
            label="联系人"
            rules={[{ required: true, message: '请输入联系人' }]}
          >
            <Input placeholder="请输入联系人" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="联系电话"
            rules={[{ required: true, message: '请输入联系电话' }]}
          >
            <Input placeholder="请输入联系电话" />
          </Form.Item>
          <Form.Item
            name="email"
            label="邮箱"
            rules={[{ type: 'email', message: '请输入正确的邮箱地址' }]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>
          <Form.Item
            name="status"
            label="状态"
            initialValue="active"
          >
            <Select placeholder="请选择状态">
              <Select.Option value="active">正常</Select.Option>
              <Select.Option value="inactive">已停用</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default TenantList