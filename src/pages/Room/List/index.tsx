import { useState, useEffect } from 'react'
import { Table, Card, Button, Space, Input, Tag, Modal, Form, InputNumber, Select, message } from 'antd'
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { Room } from '@/types'
import { formatMoney } from '@/utils'
import { getRoomList, createRoom, updateRoom, deleteRoom, assignTenant, type RoomFormData, type RoomQueryParams, type AssignTenantData } from '@/api'
import './index.less'

const RoomList = () => {
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [assignModalVisible, setAssignModalVisible] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [assignRoomId, setAssignRoomId] = useState<number | null>(null)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [searchBuilding, setSearchBuilding] = useState('')
  const [searchStatus, setSearchStatus] = useState('')
  const [data, setData] = useState<Room[]>([])
  const [total, setTotal] = useState(0)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 })
  const [form] = Form.useForm()
  const [assignForm] = Form.useForm()

  useEffect(() => {
    fetchData()
  }, [pagination.current, pagination.pageSize, searchKeyword, searchBuilding, searchStatus])

  const fetchData = async () => {
    try {
      setLoading(true)
      const params: RoomQueryParams = {
        page: pagination.current,
        pageSize: pagination.pageSize,
      }
      if (searchKeyword) params.keyword = searchKeyword
      if (searchBuilding) params.building = searchBuilding
      if (searchStatus) params.status = searchStatus

      const result = await getRoomList(params)
      setData(result.list)
      setTotal(result.total)
    } catch (error) {
      message.error('获取房间列表失败')
    } finally {
      setLoading(false)
    }
  }

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
          <Button type="link" onClick={() => handleAssign(record)}>
            分配租户
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

  const handleEdit = (record: Room) => {
    setEditingId(record.id)
    form.setFieldsValue(record)
    setModalVisible(true)
  }

  const handleDelete = (record: Room) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除房间 "${record.roomNo}" 吗？`,
      onOk: async () => {
        try {
          await deleteRoom(record.id)
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
        const formData: RoomFormData = values

        if (editingId) {
          await updateRoom(editingId, formData)
          message.success('更新成功')
        } else {
          await createRoom(formData)
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

  const handleAssign = (record: Room) => {
    setAssignRoomId(record.id)
    assignForm.resetFields()
    setAssignModalVisible(true)
  }

  const handleAssignOk = () => {
    assignForm.validateFields().then(async (values) => {
      try {
        if (assignRoomId) {
          await assignTenant(assignRoomId, values)
          message.success('分配成功')
          setAssignModalVisible(false)
          assignForm.resetFields()
          setAssignRoomId(null)
          fetchData()
        }
      } catch (error) {
        message.error('分配失败')
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
      title="房间列表"
      extra={
        <Space>
          <Select placeholder="楼栋筛选" allowClear style={{ width: 120 }} onChange={(value) => { setSearchBuilding(value || '') }}>
            <Select.Option value="A栋">A栋</Select.Option>
            <Select.Option value="B栋">B栋</Select.Option>
            <Select.Option value="C栋">C栋</Select.Option>
          </Select>
          <Select placeholder="状态筛选" allowClear style={{ width: 120 }} onChange={(value) => { setSearchStatus(value || '') }}>
            <Select.Option value="vacant">空置</Select.Option>
            <Select.Option value="occupied">已出租</Select.Option>
            <Select.Option value="maintenance">维修中</Select.Option>
          </Select>
          <Input.Search
            placeholder="搜索房间号"
            allowClear
            style={{ width: 160 }}
            prefix={<SearchOutlined />}
            onSearch={handleSearch}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增房间
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

      <Modal
        title="分配租户"
        open={assignModalVisible}
        onOk={handleAssignOk}
        onCancel={() => setAssignModalVisible(false)}
        width={400}
      >
        <Form form={assignForm} layout="vertical">
          <Form.Item
            name="tenantId"
            label="选择租户"
            rules={[{ required: true, message: '请选择租户' }]}
          >
            <Select placeholder="请选择租户">
              <Select.Option value={1}>张三</Select.Option>
              <Select.Option value={2}>李四</Select.Option>
              <Select.Option value={3}>王五</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}

export default RoomList
