import { useState, useEffect } from 'react'
import { Table, Card, Button, Space, Input, Tag, Modal, Form, message } from 'antd'
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
  const [searchStatus, setSearchStatus] = useState('')
  const [data, setData] = useState<Tenant[]>([])
  const [total, setTotal] = useState(0)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 })
  const [form] = Form.useForm()

  useEffect(() => {
    fetchData()
  }, [pagination.current, pagination.pageSize, searchKeyword, searchStatus])

  const fetchData = async () => {
    try {
      setLoading(true)
      const params: TenantQueryParams = {
        page: pagination.current,
        pageSize: pagination.pageSize,
      }
      if (searchKeyword) params.keyword = searchKeyword
      if (searchStatus) params.status = searchStatus

      const result = await getTenantList(params)
      setData(result.list)
      setTotal(result.total)
    } catch (error) {
      message.error('获取租户列表失败')
    } finally {
      setLoading(false)
    }
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
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? '正常' : '已停用'}
        </Tag>
      ),
    },
    { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt' },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)}>
            删除
          </Button>
        </Space>
      ),
    },
  ]

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

  const handleDelete = (record: Tenant) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除租户 "${record.name}" 吗？`,
      onOk: async () => {
        try {
          await deleteTenant(record.id)
          message.success('删除成功')
          fetchData()
        } catch (error) {
          message.error('删除失败')
        }
      },
    })
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
      } catch (error) {
        message.error(editingId ? '更新失败' : '创建失败')
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
    setPagination({
      current: pag.current,
      pageSize: pag.pageSize,
    })
  }

  return (
    <Card
      title="租户列表"
      extra={
        <Space>
          <Input.Search
            placeholder="搜索租户"
            allowClear
            style={{ width: 200 }}
            prefix={<SearchOutlined />}
            onSearch={handleSearch}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增租户
          </Button>
        </Space>
      }
    >
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
          showTotal: (totalCount) => `共 ${totalCount} 条`,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50'],
        }}
      />

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
            <select>
              <option value="active">正常</option>
              <option value="inactive">已停用</option>
            </select>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}

export default TenantList