import { useState } from 'react'
import { Table, Card, Button, Space, Input, Tag, Modal, Form, DatePicker, InputNumber, message } from 'antd'
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { Contract } from '@/types'
import { formatMoney } from '@/utils'

const ContractList = () => {
  const [loading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [form] = Form.useForm()

  // 模拟数据
  const mockData: Contract[] = [
    {
      id: 1,
      tenantId: 1,
      tenantName: '张三',
      contractNo: 'HT2024001',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      amount: 36000,
      status: 'active',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
    {
      id: 2,
      tenantId: 2,
      tenantName: '李四',
      contractNo: 'HT2024002',
      startDate: '2024-02-01',
      endDate: '2025-01-31',
      amount: 48000,
      status: 'active',
      createdAt: '2024-02-01',
      updatedAt: '2024-02-01',
    },
    {
      id: 3,
      tenantId: 3,
      tenantName: '王五',
      contractNo: 'HT2023010',
      startDate: '2023-06-01',
      endDate: '2024-05-31',
      amount: 42000,
      status: 'expired',
      createdAt: '2023-06-01',
      updatedAt: '2024-06-01',
    },
  ]

  const statusMap = {
    draft: { text: '草稿', color: 'default' },
    active: { text: '生效中', color: 'green' },
    expired: { text: '已到期', color: 'orange' },
    terminated: { text: '已终止', color: 'red' },
  }

  const columns: ColumnsType<Contract> = [
    { title: '合同编号', dataIndex: 'contractNo', key: 'contractNo' },
    { title: '租户名称', dataIndex: 'tenantName', key: 'tenantName' },
    { title: '开始日期', dataIndex: 'startDate', key: 'startDate' },
    { title: '结束日期', dataIndex: 'endDate', key: 'endDate' },
    {
      title: '合同金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => formatMoney(amount),
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
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />}>
            查看
          </Button>
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

  const handleEdit = (record: Contract) => {
    form.setFieldsValue(record)
    setModalVisible(true)
  }

  const handleDelete = (record: Contract) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除合同 "${record.contractNo}" 吗？`,
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
      title="合同列表"
      extra={
        <Space>
          <Input.Search
            placeholder="搜索合同"
            allowClear
            style={{ width: 200 }}
            prefix={<SearchOutlined />}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增合同
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
        title="合同信息"
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="contractNo"
            label="合同编号"
            rules={[{ required: true, message: '请输入合同编号' }]}
          >
            <Input placeholder="请输入合同编号" />
          </Form.Item>
          <Form.Item
            name="tenantName"
            label="租户名称"
            rules={[{ required: true, message: '请选择租户' }]}
          >
            <Input placeholder="请选择租户" />
          </Form.Item>
          <Form.Item
            name="dateRange"
            label="合同期限"
            rules={[{ required: true, message: '请选择合同期限' }]}
          >
            <DatePicker.RangePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="amount"
            label="合同金额"
            rules={[{ required: true, message: '请输入合同金额' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="请输入合同金额"
              prefix="¥"
              min={0}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}

export default ContractList
