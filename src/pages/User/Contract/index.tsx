import { useEffect, useState } from 'react'
import { Card, Table, Tag, Spin, message } from 'antd'
import { getTenantContracts } from '@/api/user'
import type { Contract } from '@/types'
import './index.less'

const UserContract = () => {
  const [loading, setLoading] = useState(true)
  const [contracts, setContracts] = useState<Contract[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const fetchContracts = async () => {
    try {
      setLoading(true)
      const result = await getTenantContracts({ page, pageSize })
      setContracts(result.list || [])
      setTotal(result.total || 0)
    } catch (error: unknown) {
      const err = error as Error
      if (err.name !== 'ApiError' && err.name !== 'HttpError') {
        message.error(err.message || '获取合同列表失败')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContracts()
  }, [page, pageSize])

  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      draft: { color: 'default', text: '草稿' },
      active: { color: 'success', text: '生效中' },
      expired: { color: 'warning', text: '已过期' },
      terminated: { color: 'error', text: '已终止' },
    }
    const s = statusMap[status] || { color: 'default', text: status }
    return <Tag color={s.color}>{s.text}</Tag>
  }

  const columns = [
    {
      title: '合同编号',
      dataIndex: 'contractNo',
      key: 'contractNo',
    },
    {
      title: '开始日期',
      dataIndex: 'startDate',
      key: 'startDate',
    },
    {
      title: '结束日期',
      dataIndex: 'endDate',
      key: 'endDate',
    },
    {
      title: '合同金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => (
        <span style={{ fontWeight: 600, color: '#f56565' }}>¥{amount.toFixed(2)}</span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
    },
  ]

  return (
    <div className="user-contract">
      <div className="page-header">
        <h2>我的合同</h2>
        <p>查看您的所有租赁合同</p>
      </div>

      <Card bordered={false} className="content-card">
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={contracts}
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
            locale={contracts.length === 0 ? { emptyText: '暂无合同数据' } : undefined}
          />
        </Spin>
      </Card>
    </div>
  )
}

export default UserContract