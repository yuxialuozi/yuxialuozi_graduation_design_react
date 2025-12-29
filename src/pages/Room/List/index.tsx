import { useState } from 'react'
import { Table, Card, Button, Space, Input, Tag, Modal, Form, InputNumber, Select, message } from 'antd'
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { Room } from '@/types'
import { formatMoney } from '@/utils'

const RoomList = () => {
  const [loading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [form] = Form.useForm()

  // 模拟数据
  const mockData: Room[] = [
    {
      id: 1,
      roomNo: 'A-101',
      building: 'A栋',
      floor: 1,
      area: 45,
      monthlyRent: 2500,
      status: 'occupied',
      tenantId: 1,
      tenantName: '张三',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-15',
    },
    {
      id: 2,
      roomNo: 'A-102',
      building: 'A栋',
      floor: 1,
      area: 50,
      monthlyRent: 2800,
      status: 'vacant',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
    {
      id: 3,
      roomNo: 'A-201',
      building: 'A栋',
      floor: 2,
      area: 55,
      monthlyRent: 3000,
      status: 'occupied',
      tenantId: 2,
      tenantName: '李四',
      createdAt: '2024-01-01',
      updatedAt: '2024-02-01',
    },
    {
      id: 4,
      roomNo: 'B-101',
      building: 'B栋',
      floor: 1,
      area: 40,
      monthlyRent: 2200,
      status: 'maintenance',
      createdAt: '2024-01-01',
      updatedAt: '2024-03-01',
    },
    {
      id: 5,
      roomNo: 'B-102',
      building: 'B栋',
      floor: 1,
      area: 48,
      monthlyRent: 2600,
      status: 'vacant',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
  ]

  const statusMap = {
    vacant: { text: '空置', color: 'green' },
    occupied: { text: '已出租', color: 'blue' },
    maintenance: { text: '维修中', color: 'orange' },
  }

  const columns: ColumnsType<Room> = [
    { title: '房间号', dataIndex: 'roomNo', key: 'roomNo' },
    { title: '楼栋', dataIndex: 'building', key: 'building' },
    { title: '楼层', dataIndex: 'floor', key: 'floor' },
    {
      title: '面积(㎡)',
      dataIndex: 'area',
      key: 'area',
      render: (area: number) => `${area} ㎡`
    },
    {
      title: '月租金',
      dataIndex: 'monthlyRent',
      key: 'monthlyRent',
      render: (rent: number) => formatMoney(rent),
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
      title: '当前租户',
      dataIndex: 'tenantName',
      key: 'tenantName',
      render: (name: string) => name || '-'
    },
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

  const handleEdit = (record: Room) => {
    form.setFieldsValue(record)
    setModalVisible(true)
  }

  const handleDelete = (record: Room) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除房间 "${record.roomNo}" 吗？`,
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
      title="房间列表"
      extra={
        <Space>
          <Select placeholder="楼栋筛选" allowClear style={{ width: 120 }}>
            <Select.Option value="A栋">A栋</Select.Option>
            <Select.Option value="B栋">B栋</Select.Option>
          </Select>
          <Select placeholder="状态筛选" allowClear style={{ width: 120 }}>
            <Select.Option value="vacant">空置</Select.Option>
            <Select.Option value="occupied">已出租</Select.Option>
            <Select.Option value="maintenance">维修中</Select.Option>
          </Select>
          <Input.Search
            placeholder="搜索房间号"
            allowClear
            style={{ width: 160 }}
            prefix={<SearchOutlined />}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增房间
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
        title="房间信息"
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="roomNo"
            label="房间号"
            rules={[{ required: true, message: '请输入房间号' }]}
          >
            <Input placeholder="请输入房间号，如 A-101" />
          </Form.Item>
          <Form.Item
            name="building"
            label="楼栋"
            rules={[{ required: true, message: '请选择楼栋' }]}
          >
            <Select placeholder="请选择楼栋">
              <Select.Option value="A栋">A栋</Select.Option>
              <Select.Option value="B栋">B栋</Select.Option>
              <Select.Option value="C栋">C栋</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="floor"
            label="楼层"
            rules={[{ required: true, message: '请输入楼层' }]}
          >
            <InputNumber style={{ width: '100%' }} placeholder="请输入楼层" min={1} />
          </Form.Item>
          <Form.Item
            name="area"
            label="面积(㎡)"
            rules={[{ required: true, message: '请输入面积' }]}
          >
            <InputNumber style={{ width: '100%' }} placeholder="请输入面积" min={1} />
          </Form.Item>
          <Form.Item
            name="monthlyRent"
            label="月租金"
            rules={[{ required: true, message: '请输入月租金' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="请输入月租金"
              prefix="¥"
              min={0}
            />
          </Form.Item>
          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select placeholder="请选择状态">
              <Select.Option value="vacant">空置</Select.Option>
              <Select.Option value="occupied">已出租</Select.Option>
              <Select.Option value="maintenance">维修中</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}

export default RoomList
