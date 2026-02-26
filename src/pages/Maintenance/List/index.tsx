import { useState, useEffect } from 'react'
import { Table, Card, Button, Space, Input, Tag, Modal, Form, Select, DatePicker, message } from 'antd'
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, UserOutlined, CheckCircleOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { Maintenance } from '@/types'
import { getMaintenanceList, createMaintenance, updateMaintenance, deleteMaintenance, assignMaintenance, completeMaintenance, type MaintenanceFormData, type MaintenanceQueryParams, type AssignMaintenanceData, type CompleteMaintenanceData, getTenantList } from '@/api'
import dayjs from 'dayjs'
import './index.less'

const { TextArea } = Input

const MaintenanceList = () => {
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [assignModalVisible, setAssignModalVisible] = useState(false)
  const [completeModalVisible, setCompleteModalVisible] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [assignTicketId, setAssignTicketId] = useState<number | null>(null)
  const [completeTicketId, setCompleteTicketId] = useState<number | null>(null)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [searchType, setSearchType] = useState('')
  const [searchStatus, setSearchStatus] = useState('')
  const [searchPriority, setSearchPriority] = useState('')
  const [data, setData] = useState<Maintenance[]>([])
  const [total, setTotal] = useState(0)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 })
  const [tenants, setTenants] = useState<any[]>([])
  const [form] = Form.useForm()
  const [assignForm] = Form.useForm()
  const [completeForm] = Form.useForm()

  // 加载租户列表用于下拉选择
  useEffect(() => {
    loadTenants()
  }, [])

  useEffect(() => {
    fetchData()
  }, [pagination.current, pagination.pageSize, searchKeyword, searchType, searchStatus, searchPriority])

  const loadTenants = async () => {
    try {
      const result = await getTenantList({ page: 1, pageSize: 100 })
      setTenants(result.list)
    } catch (error) {
      console.error('加载租户列表失败', error)
    }
  }

  const fetchData = async () => {
    try {
      setLoading(true)
      const params: MaintenanceQueryParams = {
        page: pagination.current,
        pageSize: pagination.pageSize,
      }
      if (searchKeyword) params.keyword = searchKeyword
      if (searchType) params.type = searchType
      if (searchStatus) params.status = searchStatus
      if (searchPriority) params.priority = searchPriority

      const result = await getMaintenanceList(params)
      setData(result.list)
      setTotal(result.total)
    } catch (error) {
      message.error('获取维修工单列表失败')
    } finally {
      setLoading(false)
    }
  }

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
    { title: '工单号', dataIndex: 'ticketNo', key: 'ticketNo', width: 150 },
    { title: '租户', dataIndex: 'tenantName', key: 'tenantName', width: 100 },
    { title: '房间号', dataIndex: 'roomNo', key: 'roomNo', width: 100 },
    {
      title: '维修类型',
      dataIndex: 'type',
      key: 'type',
      width: 80,
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
      width: 80,
      render: (priority: keyof typeof priorityMap) => (
        <Tag color={priorityMap[priority]?.color}>{priorityMap[priority]?.text}</Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: keyof typeof statusMap) => (
        <Tag color={statusMap[status]?.color}>{statusMap[status]?.text}</Tag>
      ),
    },
    {
      title: '处理人',
      dataIndex: 'assignee',
      key: 'assignee',
      width: 80,
      render: (name: string) => name || '-'
    },
    { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', width: 150 },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          {record.status === 'pending' && (
            <Button type="link" icon={<UserOutlined />} onClick={() => handleAssign(record)}>
              分配
            </Button>
          )}
          {record.status === 'processing' && (
            <Button type="link" icon={<CheckCircleOutlined />} onClick={() => handleComplete(record)}>
              完成
            </Button>
          )}
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

  const handleEdit = (record: Maintenance) => {
    setEditingId(record.id)
    form.setFieldsValue(record)
    setModalVisible(true)
  }

  const handleDelete = (record: Maintenance) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除工单 "${record.ticketNo}" 吗？`,
      onOk: async () => {
        try {
          await deleteMaintenance(record.id)
          message.success('删除成功')
          fetchData()
        } catch (error) {
          message.error('删除失败')
        }
      },
    })
  }

  const handleAssign = (record: Maintenance) => {
    setAssignTicketId(record.id)
    assignForm.resetFields()
    setAssignModalVisible(true)
  }

  const handleComplete = (record: Maintenance) => {
    setCompleteTicketId(record.id)
    completeForm.resetFields()
    setCompleteModalVisible(true)
  }

  const handleModalOk = () => {
    form.validateFields().then(async (values) => {
      try {
        setLoading(true)
        const formData: MaintenanceFormData = values

        if (editingId) {
          await updateMaintenance(editingId, formData)
          message.success('更新成功')
        } else {
          await createMaintenance(formData)
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

  const handleAssignOk = () => {
    assignForm.validateFields().then(async (values) => {
      try {
        if (assignTicketId) {
          await assignMaintenance(assignTicketId, values)
          message.success('分配成功')
          setAssignModalVisible(false)
          assignForm.resetFields()
          setAssignTicketId(null)
          fetchData()
        }
      } catch (error) {
        message.error('分配失败')
      }
    })
  }

  const handleCompleteOk = () => {
    completeForm.validateFields().then(async (values) => {
      try {
        if (completeTicketId) {
          const completeData: CompleteMaintenanceData = {
            completedAt: values.completedAt ? dayjs(values.completedAt).toISOString() : undefined,
          }
          await completeMaintenance(completeTicketId, completeData)
          message.success('标记完成成功')
          setCompleteModalVisible(false)
          completeForm.resetFields()
          setCompleteTicketId(null)
          fetchData()
        }
      } catch (error) {
        message.error('操作失败')
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
      title="维修工单列表"
      extra={
        <Space>
          <Select placeholder="维修类型" allowClear style={{ width: 120 }} onChange={(value) => { setSearchType(value || '') }}>
            <Select.Option value="electrical">电器</Select.Option>
            <Select.Option value="plumbing">水管</Select.Option>
            <Select.Option value="appliance">家电</Select.Option>
            <Select.Option value="furniture">家具</Select.Option>
            <Select.Option value="other">其他</Select.Option>
          </Select>
          <Select placeholder="状态" allowClear style={{ width: 120 }} onChange={(value) => { setSearchStatus(value || '') }}>
            <Select.Option value="pending">待处理</Select.Option>
            <Select.Option value="processing">处理中</Select.Option>
            <Select.Option value="completed">已完成</Select.Option>
            <Select.Option value="cancelled">已取消</Select.Option>
          </Select>
          <Select placeholder="优先级" allowClear style={{ width: 120 }} onChange={(value) => { setSearchPriority(value || '') }}>
            <Select.Option value="urgent">紧急</Select.Option>
            <Select.Option value="high">高</Select.Option>
            <Select.Option value="medium">中</Select.Option>
            <Select.Option value="low">低</Select.Option>
          </Select>
          <Input.Search
            placeholder="搜索工单号"
            allowClear
            style={{ width: 200 }}
            prefix={<SearchOutlined />}
            onSearch={handleSearch}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新建工单
          </Button>
        </Space>
      }
    >
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        scroll={{ x: 1400 }}
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
        title={editingId ? '编辑维修工单' : '新建维修工单'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        confirmLoading={loading}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="tenantId"
            label="租户"
            rules={[{ required: true, message: '请选择租户' }]}
          >
            <Select placeholder="请选择租户">
              {tenants.map((tenant: any) => (
                <Option key={tenant.id} value={tenant.id}>
                  {tenant.name} {tenant.contactPerson && `(${tenant.contactPerson})`}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="roomNo"
            label="房间号"
            rules={[{ required: true, message: '请输入房间号' }]}
          >
            <Input placeholder="如 A-101" />
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
            initialValue="medium"
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
            <TextArea rows={4} placeholder="请详细描述需要维修的问题" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="分配维修人员"
        open={assignModalVisible}
        onOk={handleAssignOk}
        onCancel={() => setAssignModalVisible(false)}
        width={400}
      >
        <Form form={assignForm} layout="vertical">
          <Form.Item
            name="assignee"
            label="维修人员"
            rules={[{ required: true, message: '请选择维修人员' }]}
          >
            <Select placeholder="请选择维修人员">
              <Select.Option value="王师傅">王师傅</Select.Option>
              <Select.Option value="李师傅">李师傅</Select.Option>
              <Select.Option value="张师傅">张师傅</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="完成维修工单"
        open={completeModalVisible}
        onOk={handleCompleteOk}
        onCancel={() => setCompleteModalVisible(false)}
        width={400}
      >
        <Form form={completeForm} layout="vertical">
          <Form.Item
            name="completedAt"
            label="完成时间"
          >
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}

export default MaintenanceList