import { useState } from 'react'
import { Table, Card, Button, Space, Input, Tag, Modal, Form, message } from 'antd'
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { Tenant } from '@/types'

const TenantList = () => {
  const [loading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [form] = Form.useForm()

  // 模拟数据
  const mockData: Tenant[] = [
    {
      id: 1,
      name: '张三',
      contactPerson: '张三',
      phone: '13800138001',
      email: 'zhangsan@example.com',
      status: 'active',
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15',
    },
    {
      id: 2,
      name: '李四',
      contactPerson: '李四',
      phone: '13800138002',
      email: 'lisi@example.com',
      status: 'active',
      createdAt: '2024-02-20',
      updatedAt: '2024-02-20',
    },
    {
      id: 3,
      name: '王五',
      contactPerson: '王五',
      phone: '13800138003',
      email: 'wangwu@example.com',
      status: 'inactive',
      createdAt: '2024-03-10',
      updatedAt: '2024-03-10',
    },
  ]

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
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (record: Tenant) => {
    form.setFieldsValue(record)
    setModalVisible(true)
  }

  const handleDelete = (record: Tenant) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除租户 "${record.name}" 吗？`,
      onOk: () => {
        message.success('删除成功')
      },
    })
  }

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      console.log('表单数据:', values)
      message.success('保存成功')
      setModalVisible(false)
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
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增租户
          </Button>
        </Space>
      }
    >
      <Table
        columns={columns}
        dataSource={mockData}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10, showTotal: (total) => `共 ${total} 条` }}
      />

      <Modal
        title="租户信息"
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
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
          <Form.Item name="email" label="邮箱">
            <Input placeholder="请输入邮箱" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}

export default TenantList
