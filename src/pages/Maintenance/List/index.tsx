import { useState } from 'react'
import { Table, Card, Button, Space, Input, Tag, Modal, Form, Select, message } from 'antd'
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { Maintenance } from '@/types'

const MaintenanceList = () => {
  const [loading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [form] = Form.useForm()

  // 模拟数据
  const mockData: Maintenance[] = [
    {
      id: 1,
      ticketNo: 'WX2024030001',
      tenantId: 1,
      tenantName: '张三',
      roomNo: 'A-101',
      type: 'electrical',
      description: '客厅灯不亮，需要更换灯泡',
      priority: 'medium',
      status: 'completed',
      assignee: '王师傅',
      createdAt: '2024-03-01 09:30:00',
      completedAt: '2024-03-01 14:00:00',
      updatedAt: '2024-03-01 14:00:00',
    },
    {
      id: 2,
      ticketNo: 'WX2024030002',
      tenantId: 2,
      tenantName: '李四',
      roomNo: 'A-201',
      type: 'plumbing',
      description: '卫生间水龙头漏水',
      priority: 'high',
      status: 'processing',
      assignee: '李师傅',
      createdAt: '2024-03-05 10:15:00',
      updatedAt: '2024-03-05 11:00:00',
    },
    {
      id: 3,
      ticketNo: 'WX2024030003',
      tenantId: 1,
      tenantName: '张三',
      roomNo: 'A-101',
      type: 'appliance',
      description: '空调不制冷，需要检修',
      priority: 'urgent',
      status: 'pending',
      createdAt: '2024-03-10 08:00:00',
      updatedAt: '2024-03-10 08:00:00',
    },
    {
      id: 4,
      ticketNo: 'WX2024030004',
      tenantId: 2,
      tenantName: '李四',
      roomNo: 'A-201',
      type: 'furniture',
      description: '衣柜门松动',
      priority: 'low',
      status: 'pending',
      createdAt: '2024-03-12 15:30:00',
      updatedAt: '2024-03-12 15:30:00',
    },
    {
      id: 5,
      ticketNo: 'WX2024030005',
      tenantId: 1,
      tenantName: '张三',
      roomNo: 'A-101',
      type: 'other',
      description: '门锁有时打不开',
      priority: 'medium',
      status: 'cancelled',
      createdAt: '2024-03-08 11:20:00',
      updatedAt: '2024-03-09 09:00:00',
    },
  ]

  const typeMap = {
    electrical: { text: '电器', color: 'orange' },
    plumbing: { text: '水管', color: 'blue' },
    appliance: { text: '家电', color: 'purple' },
    furniture: { text: '家具', color: 'cyan' },
    other: { text: '其他', color: 'default' },
  }

  const priorityMap = {
    low: { text: '低', color: 'default' },
    medium: { text: '中', color: 'blue' },
    high: { text: '高', color: 'orange' },
    urgent: { text: '紧急', color: 'red' },
  }

  const statusMap = {
    pending: { text: '待处理', color: 'warning' },
    processing: { text: '处理中', color: 'processing' },
    completed: { text: '已完成', color: 'success' },
    cancelled: { text: '已取消', color: 'default' },
  }

  const columns: ColumnsType<Maintenance> = [
    { title: '工单号', dataIndex: 'ticketNo', key: 'ticketNo' },
    { title: '租户', dataIndex: 'tenantName', key: 'tenantName' },
    { title: '房间号', dataIndex: 'roomNo', key: 'roomNo' },
    {
      title: '维修类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: keyof typeof typeMap) => (
        <Tag color={typeMap[type]?.color}>{typeMap[type]?.text}</Tag>
      ),
    },
    {
      title: '问题描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      width: 200,
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: keyof typeof priorityMap) => (
        <Tag color={priorityMap[priority]?.color}>{priorityMap[priority]?.text}</Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: keyof typeof statusMap) => (
        <Tag color={statusMap[status]?.color}>{statusMap[status]?.text}</Tag>
      ),
    },
    {
      title: '处理人',
      dataIndex: 'assignee',
      key: 'assignee',
      render: (name: string) => name || '-'
    },
    { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', width: 180 },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 180,
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

  const handleEdit = (record: Maintenance) => {
    form.setFieldsValue(record)
    setModalVisible(true)
  }

  const handleDelete = (record: Maintenance) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除工单 "${record.ticketNo}" 吗？`,
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
      title="维修工单列表"
      extra={
        <Space>
          <Select placeholder="维修类型" allowClear style={{ width: 100 }}>
            <Select.Option value="electrical">电器</Select.Option>
            <Select.Option value="plumbing">水管</Select.Option>
            <Select.Option value="appliance">家电</Select.Option>
            <Select.Option value="furniture">家具</Select.Option>
            <Select.Option value="other">其他</Select.Option>
          </Select>
          <Select placeholder="状态" allowClear style={{ width: 100 }}>
            <Select.Option value="pending">待处理</Select.Option>
            <Select.Option value="processing">处理中</Select.Option>
            <Select.Option value="completed">已完成</Select.Option>
          </Select>
          <Select placeholder="优先级" allowClear style={{ width: 100 }}>
            <Select.Option value="urgent">紧急</Select.Option>
            <Select.Option value="high">高</Select.Option>
            <Select.Option value="medium">中</Select.Option>
            <Select.Option value="low">低</Select.Option>
          </Select>
          <Input.Search
            placeholder="搜索工单号"
            allowClear
            style={{ width: 160 }}
            prefix={<SearchOutlined />}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新建工单
          </Button>
        </Space>
      }
    >
      <Table
        columns={columns}
        dataSource={mockData}
        rowKey="id"
        loading={loading}
        scroll={{ x: 1400 }}
        pagination={{ pageSize: 10, showTotal: (total) => `共 ${total} 条` }}
      />

      <Modal
        title="维修工单"
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="tenantName"
            label="租户"
            rules={[{ required: true, message: '请选择租户' }]}
          >
            <Select placeholder="请选择租户">
              <Select.Option value="张三">张三 (A-101)</Select.Option>
              <Select.Option value="李四">李四 (A-201)</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="type"
            label="维修类型"
            rules={[{ required: true, message: '请选择维修类型' }]}
          >
            <Select placeholder="请选择维修类型">
              <Select.Option value="electrical">电器</Select.Option>
              <Select.Option value="plumbing">水管</Select.Option>
              <Select.Option value="appliance">家电</Select.Option>
              <Select.Option value="furniture">家具</Select.Option>
              <Select.Option value="other">其他</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="priority"
            label="优先级"
            rules={[{ required: true, message: '请选择优先级' }]}
          >
            <Select placeholder="请选择优先级">
              <Select.Option value="low">低</Select.Option>
              <Select.Option value="medium">中</Select.Option>
              <Select.Option value="high">高</Select.Option>
              <Select.Option value="urgent">紧急</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="description"
            label="问题描述"
            rules={[{ required: true, message: '请输入问题描述' }]}
          >
            <Input.TextArea rows={4} placeholder="请详细描述需要维修的问题" />
          </Form.Item>
          <Form.Item
            name="assignee"
            label="处理人"
          >
            <Select placeholder="请选择处理人" allowClear>
              <Select.Option value="王师傅">王师傅</Select.Option>
              <Select.Option value="李师傅">李师傅</Select.Option>
              <Select.Option value="张师傅">张师傅</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="status"
            label="状态"
          >
            <Select placeholder="请选择状态">
              <Select.Option value="pending">待处理</Select.Option>
              <Select.Option value="processing">处理中</Select.Option>
              <Select.Option value="completed">已完成</Select.Option>
              <Select.Option value="cancelled">已取消</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}

export default MaintenanceList
