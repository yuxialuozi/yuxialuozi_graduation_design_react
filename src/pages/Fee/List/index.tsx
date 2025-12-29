import { useState } from 'react'
import { Table, Card, Button, Space, Input, Tag, Modal, Form, InputNumber, Select, DatePicker, message } from 'antd'
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, CheckOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { Fee } from '@/types'
import { formatMoney } from '@/utils'

const FeeList = () => {
  const [loading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [form] = Form.useForm()

  // 模拟数据
  const mockData: Fee[] = [
    {
      id: 1,
      tenantId: 1,
      tenantName: '张三',
      roomNo: 'A-101',
      feeType: 'rent',
      amount: 2500,
      period: '2024-03',
      dueDate: '2024-03-05',
      status: 'paid',
      paidDate: '2024-03-03',
      createdAt: '2024-03-01',
      updatedAt: '2024-03-03',
    },
    {
      id: 2,
      tenantId: 1,
      tenantName: '张三',
      roomNo: 'A-101',
      feeType: 'electricity',
      amount: 156.5,
      period: '2024-03',
      dueDate: '2024-03-15',
      status: 'unpaid',
      createdAt: '2024-03-10',
      updatedAt: '2024-03-10',
    },
    {
      id: 3,
      tenantId: 2,
      tenantName: '李四',
      roomNo: 'A-201',
      feeType: 'rent',
      amount: 3000,
      period: '2024-03',
      dueDate: '2024-03-05',
      status: 'overdue',
      createdAt: '2024-03-01',
      updatedAt: '2024-03-01',
    },
    {
      id: 4,
      tenantId: 2,
      tenantName: '李四',
      roomNo: 'A-201',
      feeType: 'water',
      amount: 45.8,
      period: '2024-03',
      dueDate: '2024-03-15',
      status: 'unpaid',
      createdAt: '2024-03-10',
      updatedAt: '2024-03-10',
    },
    {
      id: 5,
      tenantId: 1,
      tenantName: '张三',
      roomNo: 'A-101',
      feeType: 'property',
      amount: 200,
      period: '2024-Q1',
      dueDate: '2024-03-31',
      status: 'paid',
      paidDate: '2024-03-20',
      createdAt: '2024-03-01',
      updatedAt: '2024-03-20',
    },
  ]

  const feeTypeMap = {
    rent: { text: '租金', color: 'blue' },
    water: { text: '水费', color: 'cyan' },
    electricity: { text: '电费', color: 'orange' },
    property: { text: '物业费', color: 'purple' },
    other: { text: '其他', color: 'default' },
  }

  const statusMap = {
    unpaid: { text: '待缴费', color: 'warning' },
    paid: { text: '已缴费', color: 'success' },
    overdue: { text: '已逾期', color: 'error' },
  }

  const columns: ColumnsType<Fee> = [
    { title: '租户', dataIndex: 'tenantName', key: 'tenantName' },
    { title: '房间号', dataIndex: 'roomNo', key: 'roomNo' },
    {
      title: '费用类型',
      dataIndex: 'feeType',
      key: 'feeType',
      render: (type: keyof typeof feeTypeMap) => (
        <Tag color={feeTypeMap[type]?.color}>{feeTypeMap[type]?.text}</Tag>
      ),
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => formatMoney(amount),
    },
    { title: '账期', dataIndex: 'period', key: 'period' },
    { title: '应缴日期', dataIndex: 'dueDate', key: 'dueDate' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: keyof typeof statusMap) => (
        <Tag color={statusMap[status]?.color}>{statusMap[status]?.text}</Tag>
      ),
    },
    {
      title: '缴费日期',
      dataIndex: 'paidDate',
      key: 'paidDate',
      render: (date: string) => date || '-'
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          {record.status !== 'paid' && (
            <Button type="link" icon={<CheckOutlined />} onClick={() => handlePay(record)}>
              确认缴费
            </Button>
          )}
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

  const handleEdit = (record: Fee) => {
    form.setFieldsValue(record)
    setModalVisible(true)
  }

  const handleDelete = (_record: Fee) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除该费用记录吗？`,
      onOk: () => {
        message.success('删除成功')
      },
    })
  }

  const handlePay = (record: Fee) => {
    Modal.confirm({
      title: '确认缴费',
      content: `确认租户 "${record.tenantName}" 已缴纳 ${formatMoney(record.amount)} 的${feeTypeMap[record.feeType]?.text}？`,
      onOk: () => {
        message.success('缴费确认成功')
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
      title="费用列表"
      extra={
        <Space>
          <Select placeholder="费用类型" allowClear style={{ width: 120 }}>
            <Select.Option value="rent">租金</Select.Option>
            <Select.Option value="water">水费</Select.Option>
            <Select.Option value="electricity">电费</Select.Option>
            <Select.Option value="property">物业费</Select.Option>
          </Select>
          <Select placeholder="缴费状态" allowClear style={{ width: 120 }}>
            <Select.Option value="unpaid">待缴费</Select.Option>
            <Select.Option value="paid">已缴费</Select.Option>
            <Select.Option value="overdue">已逾期</Select.Option>
          </Select>
          <Input.Search
            placeholder="搜索租户"
            allowClear
            style={{ width: 160 }}
            prefix={<SearchOutlined />}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增费用
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
        summary={(pageData) => {
          const totalAmount = pageData.reduce((sum, item) => sum + item.amount, 0)
          const unpaidAmount = pageData.filter(item => item.status !== 'paid').reduce((sum, item) => sum + item.amount, 0)
          return (
            <Table.Summary fixed>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={3}>合计</Table.Summary.Cell>
                <Table.Summary.Cell index={1}>
                  <strong>{formatMoney(totalAmount)}</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2} colSpan={3}>
                  待收: <strong style={{ color: '#ff4d4f' }}>{formatMoney(unpaidAmount)}</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={3} colSpan={2} />
              </Table.Summary.Row>
            </Table.Summary>
          )
        }}
      />

      <Modal
        title="费用信息"
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
            name="feeType"
            label="费用类型"
            rules={[{ required: true, message: '请选择费用类型' }]}
          >
            <Select placeholder="请选择费用类型">
              <Select.Option value="rent">租金</Select.Option>
              <Select.Option value="water">水费</Select.Option>
              <Select.Option value="electricity">电费</Select.Option>
              <Select.Option value="property">物业费</Select.Option>
              <Select.Option value="other">其他</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="amount"
            label="金额"
            rules={[{ required: true, message: '请输入金额' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="请输入金额"
              prefix="¥"
              min={0}
              precision={2}
            />
          </Form.Item>
          <Form.Item
            name="period"
            label="账期"
            rules={[{ required: true, message: '请输入账期' }]}
          >
            <Input placeholder="请输入账期，如 2024-03" />
          </Form.Item>
          <Form.Item
            name="dueDate"
            label="应缴日期"
            rules={[{ required: true, message: '请选择应缴日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}

export default FeeList
