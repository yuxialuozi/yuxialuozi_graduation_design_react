import { useState, useEffect } from 'react'
import { Table, Card, Button, Space, Input, Tag, Modal, Form, DatePicker, InputNumber, Select, message, Popconfirm } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, CheckOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { Fee, Tenant } from '@/types'
import { formatMoney } from '@/utils'
import { getFeeList, createFee, updateFee, deleteFee, payFee, getTenantList, type FeeFormData, type FeeQueryParams, type PayFeeData } from '@/api'
import dayjs from 'dayjs'
import './index.less'

const FeeList = () => {
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [searchRoomNo, setSearchRoomNo] = useState('')
  const [searchFeeType, setSearchFeeType] = useState('')
  const [searchStatus, setSearchStatus] = useState('')
  const [data, setData] = useState<Fee[]>([])
  const [total, setTotal] = useState(0)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 })
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [form] = Form.useForm()

  useEffect(() => {
    fetchData()
    loadTenants()
  }, [pagination.current, pagination.pageSize, searchRoomNo, searchFeeType, searchStatus])

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

  const fetchData = async () => {
    try {
      setLoading(true)
      const params: FeeQueryParams = {
        page: pagination.current,
        pageSize: pagination.pageSize,
      }
      if (searchRoomNo) params.roomNo = searchRoomNo
      if (searchFeeType) params.feeType = searchFeeType
      if (searchStatus) params.status = searchStatus

      const result = await getFeeList(params)
      setData(result.list)
      setTotal(result.total)
    } catch (error: unknown) {
      const err = error as Error
      if (err.name !== 'ApiError' && err.name !== 'HttpError') {
        message.error(err.message || '获取费用列表失败')
      }
    } finally {
      setLoading(false)
    }
  }

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
      width: 200,
      render: (_, record) => (
        <Space>
          {record.status !== 'paid' && (
            <Popconfirm
              title="确认缴费"
              description={`确认租户 "${record.tenantName}" 已缴纳 ${formatMoney(record.amount)} 吗？`}
              onConfirm={() => handlePay(record)}
              okText="确认"
              cancelText="取消"
            >
              <Button type="link" icon={<CheckOutlined />} className="action-btn">
                确认缴费
              </Button>
            </Popconfirm>
          )}
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)} className="action-btn">
            编辑
          </Button>
          <Popconfirm
            title="确认删除"
            description="确定要删除该费用记录吗？"
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

  const handleAdd = () => {
    setEditingId(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (record: Fee) => {
    setEditingId(record.id)
    form.setFieldsValue({
      ...record,
      tenantId: record.tenantId,
      dueDate: dayjs(record.dueDate),
    })
    setModalVisible(true)
  }

  const handleDelete = async (record: Fee) => {
    try {
      await deleteFee(record.id)
      message.success('删除成功')
      fetchData()
    } catch (error: unknown) {
      const err = error as Error
      if (err.name !== 'ApiError' && err.name !== 'HttpError') {
        message.error(err.message || '删除失败')
      }
    }
  }

  const handlePay = async (record: Fee) => {
    try {
      const payData: PayFeeData = {
        paidDate: dayjs().toISOString(),
      }
      await payFee(record.id, payData)
      message.success('缴费确认成功')
      fetchData()
    } catch (error: unknown) {
      const err = error as Error
      if (err.name !== 'ApiError' && err.name !== 'HttpError') {
        message.error(err.message || '缴费确认失败')
      }
    }
  }

  const handleBatchPay = () => {
    const unpaidItems = data.filter(item => selectedRowKeys.includes(item.id) && item.status !== 'paid')
    if (unpaidItems.length === 0) {
      message.warning('请选择未缴费的记录')
      return
    }
    Modal.confirm({
      title: '批量确认缴费',
      content: `确定要确认选中的 ${unpaidItems.length} 条未缴费记录吗？`,
      okText: '确认',
      onOk: async () => {
        try {
          setLoading(true)
          const payData: PayFeeData = { paidDate: dayjs().toISOString() }
          await Promise.all(unpaidItems.map(item => payFee(item.id, payData)))
          message.success('批量确认缴费成功')
          setSelectedRowKeys([])
          fetchData()
        } catch (error: unknown) {
          const err = error as Error
          if (err.name !== 'ApiError' && err.name !== 'HttpError') {
            message.error(err.message || '批量确认失败')
          }
        } finally {
          setLoading(false)
        }
      },
    })
  }

  const handleModalOk = () => {
    form.validateFields().then(async (values) => {
      try {
        setLoading(true)
        const { dueDate, ...rest } = values
        const formData: FeeFormData = {
          ...rest,
          tenantId: values.tenantId,
          dueDate: dueDate ? dueDate.format('YYYY-MM-DDTHH:mm:ss') : '',
        }

        if (editingId) {
          await updateFee(editingId, formData)
          message.success('更新成功')
        } else {
          await createFee(formData)
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

  const handleTableChange = (pag: any) => {
    setPagination({
      current: pag.current,
      pageSize: pag.pageSize,
    })
  }

  return (
    <div className="fee-list">
      <div className="page-header">
        <div className="page-title">
          <h2>费用管理</h2>
          <p>管理所有费用记录，包括租金、水电费、物业费等</p>
        </div>
      </div>

      <Card bordered={false} className="content-card">
        <div className="search-bar">
          <Space>
            <Select placeholder="费用类型" allowClear style={{ width: 120 }} onChange={(value) => { setSearchFeeType(value || ''); setPagination({ ...pagination, current: 1 }) }}>
              <Select.Option value="rent">租金</Select.Option>
              <Select.Option value="water">水费</Select.Option>
              <Select.Option value="electricity">电费</Select.Option>
              <Select.Option value="property">物业费</Select.Option>
            </Select>
            <Select placeholder="缴费状态" allowClear style={{ width: 120 }} onChange={(value) => { setSearchStatus(value || ''); setPagination({ ...pagination, current: 1 }) }}>
              <Select.Option value="unpaid">待缴费</Select.Option>
              <Select.Option value="paid">已缴费</Select.Option>
              <Select.Option value="overdue">已逾期</Select.Option>
            </Select>
            <Input
              placeholder="搜索房间号"
              allowClear
              style={{ width: 150 }}
              onChange={(e) => { setSearchRoomNo(e.target.value); setPagination({ ...pagination, current: 1 }) }}
            />
            {selectedRowKeys.length > 0 && (
              <Button icon={<CheckOutlined />} onClick={handleBatchPay}>
                批量确认缴费({selectedRowKeys.length})
              </Button>
            )}
          </Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增费用
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          onChange={handleTableChange}
          rowSelection={{ selectedRowKeys, onChange: (keys) => setSelectedRowKeys(keys) }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total,
            showTotal: (totalCount) => `共 ${totalCount} 条`,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
          }}
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
      </Card>

      <Modal
        title={editingId ? '编辑费用' : '新增费用'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="tenantId"
            label="租户"
            rules={[{ required: true, message: '请选择租户' }]}
          >
            <Select placeholder="请选择租户" showSearch filterOption={(input, option) =>
              (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
            }>
              {tenants.map((tenant) => (
                <Select.Option key={tenant.id} value={tenant.id}>
                  {tenant.name} ({tenant.contactPerson})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="roomNo" label="房间号">
            <Input placeholder="请输入房间号" />
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
    </div>
  )
}

export default FeeList