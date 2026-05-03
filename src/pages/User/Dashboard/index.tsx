import { useEffect, useState } from 'react'
import { Card, Row, Col, Statistic, Table, Progress, Spin, message } from 'antd'
import {
  FileTextOutlined,
  HomeOutlined,
  DollarOutlined,
  ToolOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import { getTenantDashboard } from '@/api/user'
import type { TenantDashboard } from '@/types'
import './index.less'

const UserDashboard = () => {
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<TenantDashboard | null>(null)

  const fetchDashboard = async () => {
    try {
      setLoading(true)
      const res = await getTenantDashboard()
      if (res.code === 0) {
        setDashboardData(res.data)
      } else {
        message.error(res.message || '获取数据失败')
      }
    } catch {
      message.error('获取数据失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
  }, [])

  // 费用趋势图表配置
  const getFeeTrendOption = () => {
    if (!dashboardData?.feeTrend) return {}
    return {
      title: {
        text: '近6个月费用趋势',
        left: 'center',
      },
      tooltip: {
        trigger: 'axis',
      },
      xAxis: {
        type: 'category',
        data: dashboardData.feeTrend.map((item) => item.month),
      },
      yAxis: {
        type: 'value',
        name: '金额(元)',
      },
      series: [
        {
          name: '已缴费用',
          type: 'bar',
          data: dashboardData.feeTrend.map((item) => item.amount),
          itemStyle: {
            color: '#1890ff',
          },
        },
      ],
    }
  }

  // 费用构成图表配置
  const getFeeCompositionOption = () => {
    if (!dashboardData) return {}
    const { paidFee, unpaidFee } = dashboardData
    return {
      title: {
        text: '费用构成',
        left: 'center',
      },
      tooltip: {
        trigger: 'item',
      },
      legend: {
        bottom: 0,
      },
      series: [
        {
          name: '费用状态',
          type: 'pie',
          radius: '60%',
          data: [
            { value: paidFee, name: `已缴 ${paidFee.toFixed(2)}元` },
            { value: unpaidFee, name: `未缴 ${unpaidFee.toFixed(2)}元` },
          ],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
        },
      ],
    }
  }

  const recentFeesColumns = [
    { title: '房间号', dataIndex: 'roomNo', key: 'roomNo' },
    { title: '费用类型', dataIndex: 'feeType', key: 'feeType',
      render: (type: string) => {
        const typeMap: Record<string, string> = {
          rent: '租金',
          water: '水费',
          electricity: '电费',
          property: '物业费',
          other: '其他',
        }
        return typeMap[type] || type
      }
    },
    { title: '金额', dataIndex: 'amount', key: 'amount', render: (v: number) => `¥${v.toFixed(2)}` },
    { title: '状态', dataIndex: 'status', key: 'status',
      render: (status: string) => {
        const statusMap: Record<string, { color: string; text: string }> = {
          paid: { color: 'green', text: '已缴' },
          unpaid: { color: 'red', text: '未缴' },
          overdue: { color: 'orange', text: '逾期' },
        }
        const s = statusMap[status] || { color: 'default', text: status }
        return <span style={{ color: s.color }}>{s.text}</span>
      }
    },
  ]

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div className="user-dashboard">
      <h2>欢迎回来！</h2>

      {/* 统计卡片 */}
      <Row gutter={16} className="stat-row">
        <Col span={6}>
          <Card>
            <Statistic
              title="有效合同"
              value={dashboardData?.activeContract || 0}
              prefix={<FileTextOutlined />}
              suffix={`/ ${dashboardData?.totalContract || 0}`}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="租住房间"
              value={dashboardData?.totalRoom || 0}
              prefix={<HomeOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="累计费用"
              value={dashboardData?.totalFee || 0}
              prefix={<DollarOutlined />}
              precision={2}
              suffix="元"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="待处理维修"
              value={dashboardData?.pendingMaintenance || 0}
              prefix={<ToolOutlined />}
              valueStyle={{ color: (dashboardData?.pendingMaintenance || 0) > 0 ? '#faad14' : '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 费用状态概览 */}
      <Row gutter={16} className="fee-summary-row">
        <Col span={12}>
          <Card title="费用缴纳情况">
            <Row gutter={16}>
              <Col span={12}>
                <div className="fee-item">
                  <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                  <span>已缴费用：</span>
                  <span className="fee-value">¥{(dashboardData?.paidFee || 0).toFixed(2)}</span>
                </div>
              </Col>
              <Col span={12}>
                <div className="fee-item">
                  <ExclamationCircleOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />
                  <span>未缴费用：</span>
                  <span className="fee-value">¥{(dashboardData?.unpaidFee || 0).toFixed(2)}</span>
                </div>
              </Col>
            </Row>
            <Progress
              percent={
                dashboardData?.totalFee
                  ? (Number(dashboardData.paidFee) / Number(dashboardData.totalFee)) * 100
                  : 0
              }
              strokeColor="#52c41a"
              format={(percent) => `${percent?.toFixed(1)}%`}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="维修工单情况">
            <Row gutter={16}>
              <Col span={12}>
                <div className="fee-item">
                  <ExclamationCircleOutlined style={{ color: '#faad14', marginRight: 8 }} />
                  <span>待处理：</span>
                  <span className="fee-value">{dashboardData?.pendingMaintenance || 0}</span>
                </div>
              </Col>
              <Col span={12}>
                <div className="fee-item">
                  <ToolOutlined style={{ color: '#1890ff', marginRight: 8 }} />
                  <span>总工单：</span>
                  <span className="fee-value">{dashboardData?.totalMaintenance || 0}</span>
                </div>
              </Col>
            </Row>
            <Progress
              percent={
                dashboardData?.totalMaintenance
                  ? ((Number(dashboardData.totalMaintenance) - Number(dashboardData.pendingMaintenance)) /
                      Number(dashboardData.totalMaintenance)) *
                    100
                  : 100
              }
              strokeColor="#1890ff"
              format={(percent) => `${percent?.toFixed(1)}%`}
            />
          </Card>
        </Col>
      </Row>

      {/* 图表 */}
      <Row gutter={16} className="chart-row">
        <Col span={12}>
          <Card>
            <ReactECharts option={getFeeTrendOption()} style={{ height: 300 }} notMerge={true} />
          </Card>
        </Col>
        <Col span={12}>
          <Card>
            <ReactECharts option={getFeeCompositionOption()} style={{ height: 300 }} notMerge={true} />
          </Card>
        </Col>
      </Row>

      {/* 最近账单 */}
      <Card title="最近账单" className="recent-fees-card">
        <Table
          columns={recentFeesColumns}
          dataSource={dashboardData?.recentFees || []}
          rowKey="id"
          pagination={false}
        />
      </Card>
    </div>
  )
}

export default UserDashboard