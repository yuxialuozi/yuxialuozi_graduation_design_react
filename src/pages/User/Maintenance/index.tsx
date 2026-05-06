import { useEffect, useState } from 'react'
import { Card, Table, Tag, Button, Modal, Form, Input, Select, message, Spin } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { getTenantMaintenance, createTenantMaintenance } from '@/api/user'
import type { Maintenance } from '@/types'
import './index.less'

const { TextArea } = Input

const UserMaintenance = () => {
  const [loading, setLoading] = useState(true)
  const [maintenances, setMaintenances] = useState<Maintenance[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [statusFilter] = useState<string>('')
  const [submitLoading, setSubmitLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [form] = Form.useForm()

  const fetchMaintenance = async () => {
    try {
      setLoading(true)
      const result = await getTenantMaintenance({ page, pageSize, status: statusFilter })
      setMaintenances(result.list || [])
      setTotal(result.total || 0)
    } catch (error: unknown) {
      const err = error as Error
      if (err.name !== 'ApiError' && err.name !== 'HttpError') {
        message.error(err.message || '获取维修工单列表失败')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMaintenance()
  }, [page, pageSize, statusFilter])

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setSubmitLoading(true)
      await createTenantMaintenance(values)
      message.success('提交成功')
      setModalVisible(false)
      form.resetFields()
      fetchMaintenance()
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'errorFields' in error) {
        return
      }
      const err = error as Error
      if (err.name !== 'ApiError' && err.name !== 'HttpError') {
        message.error(err.message || '提交失败')
      }
    } finally {
      setSubmitLoading(false)
    }
  }

  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      pending: { color: 'warning', text: '待处理' },
      processing: { color: 'processing', text: '处理中' },
      completed: { color: 'success', text: '已完成' },
      cancelled: { color: 'default', text: '已取消' },
    }
    const s = statusMap[status] || { color: 'default', text: status }
    return <Tag color={s.color}>{s.text}</Tag>
  }

  const getPriorityTag = (priority: string) => {
    const priorityMap: Record<string, { color: string; text: string }> = {
      low: { color: 'green', text: '低' },
      medium: { color: 'blue', text: '中' },
      high: { color: 'orange', text: '高' },
      urgent: { color: 'red', text: '紧急' },
    }
    const p = priorityMap[priority] || { color: 'default', text: priority }
    return <Tag color={p.color}>{p.text}</Tag>
  }

  const getTypeName = (type: string) => {
    const typeMap: Record<string, string> = {
      electrical: '电路故障',
      plumbing: '水管故障',
      appliance: '家电维修',
      furniture: '家具维修',
      other: '其他',
    }
    return typeMap[type] || type
  }

  const columns = [
    {
      title: '工单编号',
      dataIndex: 'ticketNo',
      key: 'ticketNo',
    },
    {
      title: '房间号',
      dataIndex: 'roomNo',
      key: 'roomNo',
    },
    {
      title: '维修类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => getTypeName(type),
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => getPriorityTag(priority),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: '负责人',
      dataIndex: 'assignee',
      key: 'assignee',
      render: (assignee: string) => assignee || '-',
    },
  ]

  return (
    <div className="user-maintenance">
      <div className="page-header">
        <h2>维修工单</h2>
        <p>查看您的维修申请记录和状态</p>
      </div>

      <Card
        bordered={false}
        className="content-card"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
            提交维修
          </Button>
        }
      >
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={maintenances}
            rowKey="id"
            pagination={{
              current: page,
              pageSize,
              total: total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (t) => `共 ${t} 条`,
              onChange: (p, ps) => {
                setPage(p)
                setPageSize(ps)
              },
            }}
            locale={maintenances.length === 0 ? { emptyText: '暂无维修工单' } : undefined}
          />
        </Spin>
      </Card>

      <Modal
        title="提交维修工单"
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setModalVisible(false)
          form.resetFields()
        }}
        confirmLoading={submitLoading}
        okText="提交"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="type"
            label="维修类型"
            rules={[{ required: true, message: '请选择维修类型' }]}
          >
            <Select
              placeholder="请选择维修类型"
              options={[
                { label: '电路故障', value: 'electrical' },
                { label: '水管故障', value: 'plumbing' },
                { label: '家电维修', value: 'appliance' },
                { label: '家具维修', value: 'furniture' },
                { label: '其他', value: 'other' },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="priority"
            label="优先级"
            rules={[{ required: true, message: '请选择优先级' }]}
          >
            <Select
              placeholder="请选择优先级"
              options={[
                { label: '低', value: 'low' },
                { label: '中', value: 'medium' },
                { label: '高', value: 'high' },
                { label: '紧急', value: 'urgent' },
              ]}
            />
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
    </div>
  )
}

export default UserMaintenance