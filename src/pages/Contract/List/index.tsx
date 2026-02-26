import { useState, useEffect } from 'react'
import { Table, Card, Button, Space, Input, Tag, Modal, Form, DatePicker, InputNumber, Select, message } from 'antd'
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { Contract } from '@/types'
import { formatMoney } from '@/utils'
import { getContractList, createContract, updateContract, deleteContract, type ContractFormData, type ContractQueryParams } from '@/api'
import dayjs from 'dayjs'
import './index.less'

const ContractList = () => {
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [searchStatus, setSearchStatus] = useState('')
  const [startDateFrom, setStartDateFrom] = useState('')
  const [startDateTo, setStartDateTo] = useState('')
  const [data, setData] = useState<Contract[]>([])
  const [total, setTotal] = useState(0)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 })
  const [form] = Form.useForm()

  useEffect(() => {
    fetchData()
  }, [pagination.current, pagination.pageSize, searchKeyword, searchStatus, startDateFrom, startDateTo])

  const fetchData = async () => {
    try {
      setLoading(true)
      const params: ContractQueryParams = {
        page: pagination.current,
        pageSize: pagination.pageSize,
      }
      if (searchKeyword) params.keyword = searchKeyword
      if (searchStatus) params.status = searchStatus
      if (startDateFrom) params.startDateFrom = startDateFrom
      if (startDateTo) params.startDateTo = startDateTo

      const result = await getContractList(params)
      setData(result.list)
      setTotal(result.total)
    } catch (error) {
      message.error('获取合同列表失败')
    } finally {
      setLoading(false)
    }
  }

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
    setEditingId(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (record: Contract) => {
    setEditingId(record.id)
    form.setFieldsValue({
      ...record,
      dateRange: [dayjs(record.startDate), dayjs(record.endDate)],
      tenantName: record.tenantName,
    })
    setModalVisible(true)
  }

  const handleDelete = (record: Contract) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除合同 "${record.contractNo}" 吗？`,
      onOk: async () => {
        try {
          await deleteContract(record.id)
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
        const { dateRange, tenantName, ...rest } = values
        const formData: ContractFormData = {
          ...rest,
          tenantId: values.tenantId || 1, // 这里应该从 tenantName 查找对应的 tenantId
          startDate: dateRange[0].format('YYYY-MM-DD'),
          endDate: dateRange[1].format('YYYY-MM-DD'),
        }

        if (editingId) {
          await updateContract(editingId, formData)
          message.success('更新成功')
        } else {
          await createContract(formData)
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
      title="合同列表"
      extra={
        <Space>
          <Input.Search
            placeholder="搜索合同"
            allowClear
            style={{ width: 200 }}
            prefix={<SearchOutlined />}
            onSearch={handleSearch}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增合同
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
            name="tenantId"
            label="租户ID"
            rules={[{ required: true, message: '请输入租户ID' }]}
          >
            <Input placeholder="请输入租户ID" />
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
          <Form.Item name="status" label="状态">
            <Select placeholder="请选择状态">
              <Select.Option value="draft">草稿</Select.Option>
              <Select.Option value="active">生效中</Select.Option>
              <Select.Option value="expired">已到期</Select.Option>
              <Select.Option value="terminated">已终止</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}

export default ContractList
