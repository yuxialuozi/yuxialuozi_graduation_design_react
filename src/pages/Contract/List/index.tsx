import { useState, useEffect } from 'react'
import { Table, Card, Button, Space, Input, Tag, Modal, Form, DatePicker, InputNumber, Select, message, Descriptions, Popconfirm } from 'antd'
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, EyeOutlined, CheckCircleOutlined, StopOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { Contract, Tenant } from '@/types'
import { formatMoney } from '@/utils'
import { getContractList, createContract, updateContract, deleteContract, activateContract, terminateContract, getTenantList, type ContractFormData, type ContractQueryParams } from '@/api'
import dayjs from 'dayjs'
import './index.less'

const ContractList = () => {
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [data, setData] = useState<Contract[]>([])
  const [total, setTotal] = useState(0)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 })
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [form] = Form.useForm()

  useEffect(() => {
    fetchData()
    loadTenants()
  }, [pagination.current, pagination.pageSize, searchKeyword])

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
      const params: ContractQueryParams = {
        page: pagination.current,
        pageSize: pagination.pageSize,
      }
      if (searchKeyword) params.keyword = searchKeyword

      const result = await getContractList(params)
      setData(result.list)
      setTotal(result.total)
    } catch (error: unknown) {
      const err = error as Error
      if (err.name !== 'ApiError' && err.name !== 'HttpError') {
        message.error(err.message || '获取合同列表失败')
      }
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
    { title: '开始日期', dataIndex: 'startDate', key: 'startDate', width: 120 },
    { title: '结束日期', dataIndex: 'endDate', key: 'endDate', width: 120 },
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
      width: 240,
      render: (_, record) => (
        <Space size="small">
          <Button type="link" icon={<EyeOutlined />} onClick={() => handleView(record)} size="small">
            查看
          </Button>
          {record.status === 'draft' && (
            <Popconfirm
              title="激活合同"
              description="确定要激活此合同吗？"
              onConfirm={() => handleActivate(record)}
              okText="确认"
              cancelText="取消"
            >
              <Button type="link" icon={<CheckCircleOutlined />} size="small" style={{ color: '#52c41a' }}>
                激活
              </Button>
            </Popconfirm>
          )}
          {(record.status === 'draft' || record.status === 'active') && (
            <Popconfirm
              title="终止合同"
              description="确定要终止此合同吗？终止后不可恢复。"
              onConfirm={() => handleTerminate(record)}
              okText="确认终止"
              cancelText="取消"
              okButtonProps={{ danger: true }}
            >
              <Button type="link" danger icon={<StopOutlined />} size="small">
                终止
              </Button>
            </Popconfirm>
          )}
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)} size="small">
            编辑
          </Button>
          <Popconfirm
            title="确认删除"
            description={`确定要删除合同 "${record.contractNo}" 吗？`}
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

  const handleView = (record: Contract) => {
    setSelectedContract(record)
    setDetailModalVisible(true)
  }

  const handleAdd = () => {
    setEditingId(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (record: Contract) => {
    setEditingId(record.id)
    form.setFieldsValue({
      tenantId: record.tenantId,
      contractNo: record.contractNo,
      amount: record.amount,
      status: record.status,
      dateRange: [dayjs(record.startDate), dayjs(record.endDate)],
    })
    setModalVisible(true)
  }

  const handleDelete = async (record: Contract) => {
    try {
      await deleteContract(record.id)
      message.success('删除成功')
      fetchData()
    } catch (error: unknown) {
      const err = error as Error
      if (err.name !== 'ApiError' && err.name !== 'HttpError') {
        message.error(err.message || '删除失败')
      }
    }
  }

  const handleActivate = async (record: Contract) => {
    try {
      await activateContract(record.id)
      message.success('合同已激活')
      fetchData()
    } catch (error: unknown) {
      const err = error as Error
      if (err.name !== 'ApiError' && err.name !== 'HttpError') {
        message.error(err.message || '激活失败')
      }
    }
  }

  const handleTerminate = async (record: Contract) => {
    try {
      await terminateContract(record.id)
      message.success('合同已终止')
      fetchData()
    } catch (error: unknown) {
      const err = error as Error
      if (err.name !== 'ApiError' && err.name !== 'HttpError') {
        message.error(err.message || '终止失败')
      }
    }
  }

  const handleBatchDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要删除的合同')
      return
    }
    Modal.confirm({
      title: '批量删除确认',
      content: `确定要删除选中的 ${selectedRowKeys.length} 个合同吗？`,
      okText: '确认删除',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          setLoading(true)
          await Promise.all(selectedRowKeys.map((id) => deleteContract(id as number)))
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

  const handleModalOk = () => {
    form.validateFields().then(async (values) => {
      try {
        setLoading(true)
        const { dateRange, ...rest } = values
        const formData: ContractFormData = {
          ...rest,
          tenantId: values.tenantId,
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

  const handleDetailModalOk = () => {
    setDetailModalVisible(false)
    setSelectedContract(null)
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
    <div className="contract-list">
      <div className="page-header">
        <div className="page-title">
          <h2>合同管理</h2>
          <p>管理所有租赁合同，包括新增、编辑、查看和删除操作</p>
        </div>
      </div>

      <Card bordered={false} className="content-card">
        <div className="search-bar">
          <Input.Search
            placeholder="搜索合同编号或租户名称"
            allowClear
            style={{ width: 300 }}
            prefix={<SearchOutlined />}
            onSearch={handleSearch}
          />
          {selectedRowKeys.length > 0 && (
            <Button danger icon={<DeleteOutlined />} onClick={handleBatchDelete}>
              批量删除({selectedRowKeys.length})
            </Button>
          )}
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增合同
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
        />
      </Card>

      <Modal
        title={editingId ? '编辑合同' : '新增合同'}
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

      <Modal
        title="合同详情"
        open={detailModalVisible}
        onOk={handleDetailModalOk}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>,
        ]}
        width={700}
      >
        {selectedContract && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="合同编号" span={2}>
              {selectedContract.contractNo}
            </Descriptions.Item>
            <Descriptions.Item label="租户名称" span={2}>
              {selectedContract.tenantName}
            </Descriptions.Item>
            <Descriptions.Item label="开始日期">
              {selectedContract.startDate}
            </Descriptions.Item>
            <Descriptions.Item label="结束日期">
              {selectedContract.endDate}
            </Descriptions.Item>
            <Descriptions.Item label="合同金额" span={2}>
              <span style={{ color: '#f5222d', fontWeight: 'bold' }}>
                {formatMoney(selectedContract.amount)}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={statusMap[selectedContract.status]?.color}>
                {statusMap[selectedContract.status]?.text}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="创建时间">
              {selectedContract.createdAt}
            </Descriptions.Item>
            <Descriptions.Item label="更新时间" span={2}>
              {selectedContract.updatedAt}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  )
}

export default ContractList