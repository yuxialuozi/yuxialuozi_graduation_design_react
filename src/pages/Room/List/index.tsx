import { useState, useEffect } from 'react'
import { Table, Card, Button, Space, Input, Tag, Modal, Form, InputNumber, Select, message, Popconfirm } from 'antd'
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, HomeOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { Room } from '@/types'
import { formatMoney } from '@/utils'
import {
  getRoomList, createRoom, updateRoom, deleteRoom,
  assignTenant, unassignRoom, getBuildings, getTenantList,
  type RoomFormData, type RoomQueryParams,
} from '@/api'
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
  const [tenants, setTenants] = useState<any[]>([])
  const [buildings, setBuildings] = useState<string[]>([])
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [form] = Form.useForm()
  const [assignForm] = Form.useForm()

  useEffect(() => {
    loadTenants()
    loadBuildings()
  }, [])

  useEffect(() => {
    fetchData()
  }, [pagination.current, pagination.pageSize, searchKeyword, searchBuilding, searchStatus])

  const loadTenants = async () => {
    try {
      const result = await getTenantList({ page: 1, pageSize: 100 })
      setTenants(result.list)
    } catch (error: unknown) {
      const err = error as Error
      if (err.name !== 'ApiError' && err.name !== 'HttpError') {
        message.error(err.message || '加载租户列表失败')
      }
    }
  }

  const loadBuildings = async () => {
    try {
      const result = await getBuildings()
      setBuildings(result)
    } catch {
      // ignore errors
    }
  }

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
    } catch (error: unknown) {
      const err = error as Error
      if (err.name !== 'ApiError' && err.name !== 'HttpError') {
        message.error(err.message || '获取房间列表失败')
      }
    } finally {
      setLoading(false)
    }
  }

  const statusMap: Record<string, { text: string; color: string }> = {
    vacant: { text: '空置', color: 'green' },
    occupied: { text: '已出租', color: 'blue' },
    maintenance: { text: '维修中', color: 'orange' },
  }

  const handleStatusChange = async (record: Room, checked: boolean) => {
    try {
      const newStatus = checked ? 'vacant' : 'maintenance'
      await updateRoom(record.id, { ...record, status: newStatus })
      message.success('状态已更新')
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
      message.warning('请先选择要删除的房间')
      return
    }
    Modal.confirm({
      title: '批量删除确认',
      content: `确定要删除选中的 ${selectedRowKeys.length} 个房间吗？`,
      okText: '确认删除',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          setLoading(true)
          await Promise.all(selectedRowKeys.map((id) => deleteRoom(id as number)))
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

  const columns: ColumnsType<Room> = [
    { title: '房间号', dataIndex: 'roomNo', key: 'roomNo' },
    { title: '楼栋', dataIndex: 'building', key: 'building' },
    { title: '楼层', dataIndex: 'floor', key: 'floor', width: 80 },
    {
      title: '面积(㎡)',
      dataIndex: 'area',
      key: 'area',
      render: (area: number) => `${area} ㎡`,
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
      render: (status: string, record) => (
        <Space>
          <Tag color={statusMap[status]?.color}>{statusMap[status]?.text}</Tag>
          <Popconfirm
            title="快速切换状态"
            description={
              <Space direction="vertical" size={4}>
                {Object.entries(statusMap).map(([key, val]) => (
                  <Button key={key} size="small" type={status === key ? 'primary' : 'default'}
                    onClick={() => handleStatusChange(record, key !== status)}>
                    {val.text}
                  </Button>
                ))}
              </Space>
            }
            okText="取消"
            cancelText=""
          >
            <Button size="small" type="link">切换</Button>
          </Popconfirm>
        </Space>
      ),
    },
    {
      title: '当前租户',
      dataIndex: 'tenantName',
      key: 'tenantName',
      render: (name: string) => name || '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 220,
      render: (_, record) => (
        <Space size="small">
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)} size="small">
            编辑
          </Button>
          {record.status === 'vacant' || record.status === 'maintenance' ? (
            <Button type="link" onClick={() => handleAssign(record)} size="small">
              分配租户
            </Button>
          ) : (
            <Button type="link" icon={<HomeOutlined />} onClick={() => handleRelease(record)} size="small" danger>
              释放房间
            </Button>
          )}
          <Popconfirm
            title="确认删除"
            description={`确定要删除房间 "${record.roomNo}" 吗？`}
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

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
  }

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

  const handleDelete = async (record: Room) => {
    try {
      await deleteRoom(record.id)
      message.success('删除成功')
      fetchData()
    } catch (error: unknown) {
      const err = error as Error
      if (err.name !== 'ApiError' && err.name !== 'HttpError') {
        message.error(err.message || '删除失败')
      }
    }
  }

  const handleRelease = async (record: Room) => {
    try {
      await unassignRoom(record.id)
      message.success('房间已释放')
      fetchData()
    } catch (error: unknown) {
      const err = error as Error
      if (err.name !== 'ApiError' && err.name !== 'HttpError') {
        message.error(err.message || '释放房间失败')
      }
    }
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
        loadBuildings()
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

  const handleAssign = (record: Room) => {
    setAssignRoomId(record.id)
    assignForm.resetFields()
    setAssignModalVisible(true)
  }

  const handleAssignOk = () => {
    assignForm.validateFields().then(async (values) => {
      try {
        if (assignRoomId) {
          await assignTenant(assignRoomId, { tenantId: values.tenantId })
          message.success('分配成功')
          setAssignModalVisible(false)
          assignForm.resetFields()
          setAssignRoomId(null)
          fetchData()
        }
      } catch (error: unknown) {
        const err = error as Error
        if (err.name !== 'ApiError' && err.name !== 'HttpError') {
          message.error(err.message || '分配失败')
        }
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
    <div className="room-list">
      <div className="page-header">
        <div className="page-title">
          <h2>房间管理</h2>
          <p>管理所有房源信息，包括新增、编辑和分配租户</p>
        </div>
      </div>

      <Card bordered={false} className="content-card">
        <div className="search-bar">
          <Space>
            <Select
              placeholder="楼栋筛选"
              allowClear
              style={{ width: 140 }}
              value={searchBuilding || undefined}
              onChange={(value) => { setSearchBuilding(value || ''); setPagination({ ...pagination, current: 1 }) }}
            >
              {buildings.map((b) => <Select.Option key={b} value={b}>{b}</Select.Option>)}
            </Select>
            <Select
              placeholder="状态筛选"
              allowClear
              style={{ width: 120 }}
              onChange={(value) => { setSearchStatus(value || ''); setPagination({ ...pagination, current: 1 }) }}
            >
              <Select.Option value="vacant">空置</Select.Option>
              <Select.Option value="occupied">已出租</Select.Option>
              <Select.Option value="maintenance">维修中</Select.Option>
            </Select>
            <Input.Search
              placeholder="搜索房间号"
              allowClear
              style={{ width: 200 }}
              prefix={<SearchOutlined />}
              onSearch={handleSearch}
            />
            {selectedRowKeys.length > 0 && (
              <Popconfirm
                title="批量删除确认"
                description={`确定要删除选中的 ${selectedRowKeys.length} 个房间吗？`}
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
            新增房间
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
        title={editingId ? '编辑房间' : '新增房间'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        width={600}
        destroyOnClose
      >
        <Form form={form} layout="vertical" preserve={false}>
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
            <Select
              placeholder="请选择楼栋"
              showSearch
              filterOption={(input, option) =>
                (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
              }
            >
              {buildings.map((b) => <Select.Option key={b} value={b}>{b}</Select.Option>)}
              {!buildings.includes('A栋') && <Select.Option value="A栋">A栋</Select.Option>}
              {!buildings.includes('B栋') && <Select.Option value="B栋">B栋</Select.Option>}
              {!buildings.includes('C栋') && <Select.Option value="C栋">C栋</Select.Option>}
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
          <Form.Item name="status" label="状态" initialValue="vacant">
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
            <Select placeholder="请选择租户" showSearch
              filterOption={(input, option) =>
                (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
              }
              loading={tenants.length === 0}
            >
              {tenants.map((tenant: any) => (
                <Select.Option key={tenant.id} value={tenant.id}>
                  {tenant.name} {tenant.contactPerson && `(${tenant.contactPerson})`}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default RoomList