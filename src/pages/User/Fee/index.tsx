import { useEffect, useState } from 'react'
import { Card, Table, Tag, Button, Modal, message, Spin, Select, Space } from 'antd'
import { CreditCardOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { getTenantFees, payTenantFee } from '@/api/user'
import type { Fee } from '@/types'
import './index.less'

const UserFee = () => {
  const [loading, setLoading] = useState(true)
  const [fees, setFees] = useState<Fee[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [feeTypeFilter, setFeeTypeFilter] = useState<string>('')
  const [payingId, setPayingId] = useState<number | null>(null)

  const fetchFees = async () => {
    try {
      setLoading(true)
      const res = await getTenantFees({ page, pageSize, status: statusFilter, feeType: feeTypeFilter })
      if (res.code === 0) {
        setFees(res.data.list || [])
        setTotal(res.data.total || 0)
      } else {
        message.error(res.message || '获取账单列表失败')
      }
    } catch {
      message.error('获取账单列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFees()
  }, [page, pageSize, statusFilter, feeTypeFilter])

  const handlePay = async (record: Fee) => {
    Modal.confirm({
      title: '确认缴费',
      content: `确认缴纳 ${record.roomNo} 的 ${getFeeTypeName(record.feeType)} 费用 ¥${record.amount.toFixed(2)} 吗？`,
      okText: '确认缴费',
      cancelText: '取消',
      onOk: async () => {
        try {
          setPayingId(record.id)
          const res = await payTenantFee(record.id)
          if (res.code === 0) {
            message.success('缴费成功')
            fetchFees()
          } else {
            message.error(res.message || '缴费失败')
          }
        } catch {
          message.error('缴费失败')
        } finally {
          setPayingId(null)
        }
      },
    })
  }

  const getFeeTypeName = (type: string) => {
    const typeMap: Record<string, string> = {
      rent: '租金',
      water: '水费',
      electricity: '电费',
      property: '物业费',
      other: '其他',
    }
    return typeMap[type] || type
  }

  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      paid: { color: 'success', text: '已缴' },
      unpaid: { color: 'error', text: '未缴' },
      overdue: { color: 'warning', text: '逾期' },
    }
    const s = statusMap[status] || { color: 'default', text: status }
    return <Tag color={s.color}>{s.text}</Tag>
  }

  const columns = [
    {
      title: '房间号',
      dataIndex: 'roomNo',
      key: 'roomNo',
    },
    {
      title: '费用类型',
      dataIndex: 'feeType',
      key: 'feeType',
      render: (type: string) => getFeeTypeName(type),
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => `¥${amount.toFixed(2)}`,
    },
    {
      title: '账期',
      dataIndex: 'period',
      key: 'period',
    },
    {
      title: '到期日期',
      dataIndex: 'dueDate',
      key: 'dueDate',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: Fee) =>
        record.status === 'unpaid' || record.status === 'overdue' ? (
          <Button
            type="primary"
            size="small"
            icon={<CreditCardOutlined />}
            loading={payingId === record.id}
            onClick={() => handlePay(record)}
          >
            缴费
          </Button>
        ) : (
          <Button type="text" size="small" icon={<CheckCircleOutlined />} disabled>
            已缴
          </Button>
        ),
    },
  ]

  return (
    <div className="user-fee">
      <h2>我的账单</h2>

      <Card>
        <Space style={{ marginBottom: 16 }}>
          <Select
            placeholder="费用状态"
            allowClear
            style={{ width: 120 }}
            value={statusFilter || undefined}
            onChange={(v) => {
              setStatusFilter(v || '')
              setPage(1)
            }}
            options={[
              { label: '全部', value: '' },
              { label: '未缴', value: 'unpaid' },
              { label: '已缴', value: 'paid' },
              { label: '逾期', value: 'overdue' },
            ]}
          />
          <Select
            placeholder="费用类型"
            allowClear
            style={{ width: 120 }}
            value={feeTypeFilter || undefined}
            onChange={(v) => {
              setFeeTypeFilter(v || '')
              setPage(1)
            }}
            options={[
              { label: '全部', value: '' },
              { label: '租金', value: 'rent' },
              { label: '水费', value: 'water' },
              { label: '电费', value: 'electricity' },
              { label: '物业费', value: 'property' },
              { label: '其他', value: 'other' },
            ]}
          />
        </Space>

        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={fees}
            rowKey="id"
            pagination={{
              current: page,
              pageSize,
              total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (t) => `共 ${t} 条`,
              onChange: (p, ps) => {
                setPage(p)
                setPageSize(ps)
              },
            }}
            locale={fees.length === 0 ? { emptyText: '暂无账单数据' } : undefined}
          />
        </Spin>
      </Card>
    </div>
  )
}

export default UserFee