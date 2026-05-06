import { useEffect, useState } from 'react'
import { Card, Row, Col, Table, Progress, Spin, message } from 'antd'
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
      const data = await getTenantDashboard()
      setDashboardData(data)
    } catch (error: unknown) {
      const err = error as Error
      if (err.name !== 'ApiError' && err.name !== 'HttpError') {
        message.error(err.message || '获取仪表盘数据失败')
      }
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
      tooltip: {
        trigger: 'axis',
        formatter: '{b}<br/><span style="display:inline-block;margin-right:4px;border-radius:10px;width:10px;height:10px;background-color:#3182ce;"></span>{c}元'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '10px',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: dashboardData.feeTrend.map((item) => item.month),
        axisLine: { lineStyle: { color: '#e2e8f0' } },
        axisLabel: { color: '#718096' }
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: '#f0f0f0' } },
        axisLabel: { color: '#718096', formatter: '¥{value}' }
      },
      series: [
        {
          name: '已缴费用',
          type: 'bar',
          data: dashboardData.feeTrend.map((item) => item.amount),
          itemStyle: { color: '#3182ce', borderRadius: [4, 4, 0, 0] },
        },
      ],
    }
  }

  // 费用构成图表配置
  const getFeeCompositionOption = () => {
    if (!dashboardData) return {}
    const { paidFee, unpaidFee } = dashboardData
    return {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c}元 ({d}%)',
      },
      legend: { bottom: 0, left: 'center' },
      series: [
        {
          name: '费用状态',
          type: 'pie',
          radius: ['45%', '70%'],
          center: ['50%', '45%'],
          data: [
            { value: paidFee, name: `已缴 ${paidFee.toFixed(2)}元`, itemStyle: { color: '#48bb78' } },
            { value: unpaidFee, name: `未缴 ${unpaidFee.toFixed(2)}元`, itemStyle: { color: '#f56565' } },
          ],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.2)',
            },
          },
          label: {
            formatter: '{b}: {c}元',
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
        return <span style={{ color: s.color, fontWeight: 500 }}>{s.text}</span>
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

  // 统计卡片配置
  const stats = [
    {
      title: '有效合同',
      value: dashboardData?.activeContract || 0,
      suffix: `/ ${dashboardData?.totalContract || 0}`,
      icon: <FileTextOutlined />,
      color: '#3182ce',
    },
    {
      title: '租住房间',
      value: dashboardData?.totalRoom || 0,
      icon: <HomeOutlined />,
      color: '#48bb78',
    },
    {
      title: '累计费用',
      value: `¥${(dashboardData?.totalFee || 0).toFixed(2)}`,
      icon: <DollarOutlined />,
      color: '#ed8936',
      isText: true,
    },
    {
      title: '待处理维修',
      value: dashboardData?.pendingMaintenance || 0,
      icon: <ToolOutlined />,
      color: (dashboardData?.pendingMaintenance || 0) > 0 ? '#f56565' : '#48bb78',
    },
  ]

  return (
    <div className="user-dashboard">
      <div className="page-header">
        <h2>欢迎回来！</h2>
        <p>这里是您的个人租住信息概览</p>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[20, 20]} className="stat-row">
        {stats.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card bordered={false} className="stat-card">
              <div className="stat-icon" style={{ background: stat.color }}>
                {stat.icon}
              </div>
              <div className="stat-content">
                <div className="stat-title">{stat.title}</div>
                {stat.isText ? (
                  <div className="stat-value" style={{ fontSize: 20 }}>{stat.value}</div>
                ) : (
                  <div className="stat-value">
                    {stat.value}
                    {stat.suffix && <span style={{ fontSize: 14, color: '#a0aec0', marginLeft: 4 }}>{stat.suffix}</span>}
                  </div>
                )}
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* 费用和维修概览 */}
      <Row gutter={[20, 20]} style={{ marginTop: 20 }}>
        <Col xs={24} lg={12}>
          <Card bordered={false} className="summary-card" title="费用缴纳情况">
            <div className="summary-item">
              <div className="summary-icon" style={{ background: '#f0fdf4', color: '#48bb78' }}>
                <CheckCircleOutlined />
              </div>
              <span className="summary-label">已缴费用</span>
              <span className="summary-value" style={{ color: '#48bb78' }}>
                ¥{(dashboardData?.paidFee || 0).toFixed(2)}
              </span>
            </div>
            <div className="summary-item">
              <div className="summary-icon" style={{ background: '#fef2f2', color: '#f56565' }}>
                <ExclamationCircleOutlined />
              </div>
              <span className="summary-label">未缴费用</span>
              <span className="summary-value" style={{ color: '#f56565' }}>
                ¥{(dashboardData?.unpaidFee || 0).toFixed(2)}
              </span>
            </div>
            <Progress
              percent={
                dashboardData?.totalFee
                  ? (Number(dashboardData.paidFee) / Number(dashboardData.totalFee)) * 100
                  : 0
              }
              strokeColor="#48bb78"
              format={(percent) => `${percent?.toFixed(1)}%`}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card bordered={false} className="summary-card" title="维修工单情况">
            <div className="summary-item">
              <div className="summary-icon" style={{ background: '#fffbeb', color: '#ed8936' }}>
                <ExclamationCircleOutlined />
              </div>
              <span className="summary-label">待处理</span>
              <span className="summary-value" style={{ color: '#ed8936' }}>
                {dashboardData?.pendingMaintenance || 0}
              </span>
            </div>
            <div className="summary-item">
              <div className="summary-icon" style={{ background: '#eff6ff', color: '#3182ce' }}>
                <ToolOutlined />
              </div>
              <span className="summary-label">总工单</span>
              <span className="summary-value" style={{ color: '#3182ce' }}>
                {dashboardData?.totalMaintenance || 0}
              </span>
            </div>
            <Progress
              percent={
                dashboardData?.totalMaintenance
                  ? ((Number(dashboardData.totalMaintenance) - Number(dashboardData.pendingMaintenance)) /
                      Number(dashboardData.totalMaintenance)) *
                    100
                  : 100
              }
              strokeColor="#3182ce"
              format={(percent) => `${percent?.toFixed(1)}%`}
            />
          </Card>
        </Col>
      </Row>

      {/* 图表 */}
      <Row gutter={[20, 20]} style={{ marginTop: 20 }}>
        <Col xs={24} lg={12}>
          <Card bordered={false} className="chart-card" title="费用趋势">
            <ReactECharts option={getFeeTrendOption()} style={{ height: 280 }} notMerge={true} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card bordered={false} className="chart-card" title="费用构成">
            <ReactECharts option={getFeeCompositionOption()} style={{ height: 280 }} notMerge={true} />
          </Card>
        </Col>
      </Row>

      {/* 最近账单 */}
      <Card bordered={false} className="recent-card" title="最近账单">
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