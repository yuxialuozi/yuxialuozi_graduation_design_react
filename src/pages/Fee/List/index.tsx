import { useState, useEffect } from 'react'
import { Table, Card, Button, Space, Input, Tag, Modal, Form, DatePicker, InputNumber, Select, message } from 'antd'
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, CheckOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { Fee } from '@/types'
import { formatMoney } from '@/utils'
import { getFeeList, createFee, updateFee, deleteFee, payFee, type FeeFormData, type FeeQueryParams, type PayFeeData } from '@/api'
import dayjs from 'dayjs'
import './index.less'

const FeeList = () => {
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [searchTenantId, setSearchTenantId] = useState<number>()
  const [searchRoomNo, setSearchRoomNo] = useState('')
  const [searchFeeType, setSearchFeeType] = useState('')
  const [searchStatus, setSearchStatus] = useState('')
  const [searchPeriod, setSearchPeriod] = useState('')
  const [data, setData] = useState<Fee[]>([])
  const [total, setTotal] = useState(0)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 })
  const [form] = Form.useForm()

  useEffect(() => {
    fetchData()
  }, [pagination.current, pagination.pageSize, searchTenantId, searchRoomNo, searchFeeType, searchStatus, searchPeriod])

  const fetchData = async () => {
    try {
      setLoading(true)
      const params: FeeQueryParams = {
        page: pagination.current,
        pageSize: pagination.pageSize,
      }
      if (searchTenantId) params.tenantId = searchTenantId
      if (searchRoomNo) params.roomNo = searchRoomNo
      if (searchFeeType) params.feeType = searchFeeType
      if (searchStatus) params.status = searchStatus
      if (searchPeriod) params.period = searchPeriod

      const result = await getFeeList(params)
      setData(result.list)
      setTotal(result.total)
    } catch (error) {
      message.error('获取费用列表失败')
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

  const handleDelete = (record: Fee) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除该费用记录吗？`,
      onOk: async () => {
        try {
          await deleteFee(record.id)
          message.success('删除成功')
          fetchData()
        } catch (error) {
          message.error('删除失败')
        }
      },
    })
  }

  const handlePay = (record: Fee) => {
    Modal.confirm({
      title: '确认缴费',
      content: `确认租户 "${record.tenantName}" 已缴纳 ${formatMoney(record.amount)} 的${feeTypeMap[record.feeType]?.text}？`,
      onOk: async () => {
        try {
          const payData: PayFeeData = {
            paidDate: dayjs().toISOString(),
          }
          await payFee(record.id, payData)
          message.success('缴费确认成功')
          fetchData()
        } catch (error) {
          message.error('缴费确认失败')
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
          tenantId: values.tenantId || 1,
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
      } catch (error) {
        message.error(editingId ? '更新失败' : '创建失败')
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
    <Card
      title="费用列表"
      extra={
        <Space>
          <Select placeholder="费用类型" allowClear style={{ width: 120 }} onChange={(value) => { setSearchFeeType(value || '') }}>
            <Select.Option value="rent">租金</Select.Option>
            <Select.Option value="water">水费</Select.Option>
            <Select.Option value="electricity">电费</Select.Option>
            <Select.Option value="property">物业费</Select.Option>
          </Select>
          <Select placeholder="缴费状态" allowClear style={{ width: 120 }} onChange={(value) => { setSearchStatus(value || '') }}>
            <Select.Option value="unpaid">待缴费</Select.Option>
            <Select.Option value="paid">已缴费</Select.Option>
            <Select.Option value="overdue">已逾期</Select.Option>
          </Select>
          <Input
            placeholder="搜索房间号"
            allowClear
            style={{ width: 120 }}
            onChange={(e) => setSearchRoomNo(e.target.value)}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增费用
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
            name="tenantId"
            label="租户ID"
            rules={[{ required: true, message: '请输入租户ID' }]}
          >
            <InputNumber style={{ width: '100%' }} placeholder="请输入租户ID" min={1} />
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
    </Card>
  )
}

export default FeeList
