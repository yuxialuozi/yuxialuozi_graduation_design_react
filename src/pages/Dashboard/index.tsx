import { useState, useEffect } from 'react'
import { Row, Col, Card, message, Button } from 'antd'
import { UserOutlined, FileTextOutlined, HomeOutlined, DollarOutlined, ArrowUpOutlined, ArrowDownOutlined, ReloadOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import { getDashboard } from '@/api'
import { formatMoney } from '@/utils'
import './index.less'

const Dashboard = () => {
  const [loading, setLoading] = useState(false)
  const [dashboardData, setDashboardData] = useState<any>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const data = await getDashboard()
      setDashboardData(data)
    } catch (error: unknown) {
      console.error('获取仪表盘数据失败', error)
      const err = error as Error
      if (err.name !== 'ApiError' && err.name !== 'HttpError') {
        message.error(err.message || '获取仪表盘数据失败')
      }
    } finally {
      setLoading(false)
    }
  }

  // 统计卡片配置
  const stats = [
    {
      title: '租户总数',
      value: dashboardData?.totalTenants || 0,
      icon: <UserOutlined />,
      color: '#3182ce',
      trend: '+12%',
      trendUp: true,
    },
    {
      title: '活跃合同',
      value: dashboardData?.activeContracts || 0,
      icon: <FileTextOutlined />,
      color: '#48bb78',
      trend: '+8%',
      trendUp: true,
    },
    {
      title: '房间总数',
      value: dashboardData?.totalRooms || 0,
      icon: <HomeOutlined />,
      color: '#ed8936',
      trend: `${dashboardData?.occupancyRate?.toFixed(1) || 0}%`,
      trendUp: true,
      isPercent: true,
    },
    {
      title: '未缴费金额',
      value: formatMoney(dashboardData?.unpaidAmount || 0),
      icon: <DollarOutlined />,
      color: '#f56565',
      trend: '-5%',
      trendUp: false,
      isMoney: true,
    },
  ]

  const incomeChartData = dashboardData?.incomeChart || []
  const maintenanceStatusData = dashboardData?.maintenanceStatusChart || []
  const feeTypeData = dashboardData?.feeTypeChart || []

  // 维修状态中文映射
  const maintenanceStatusMap: Record<string, string> = {
    pending: '待处理',
    processing: '处理中',
    completed: '已完成',
    cancelled: '已取消'
  }

  // 费用类型中文映射
  const feeTypeMap: Record<string, string> = {
    rent: '租金',
    water: '水费',
    electricity: '电费',
    property: '物业费',
    other: '其他'
  }

  // 收入趋势图配置
  const incomeTrendOption: any = {
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
      data: incomeChartData.length > 0 ? incomeChartData.map((item: any) => item.date) : [''],
      boundaryGap: false,
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
        name: '收入',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        data: incomeChartData.length > 0 ? incomeChartData.map((item: any) => item.amount) : [0],
        itemStyle: { color: '#3182ce' },
        lineStyle: { width: 2 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(49, 130, 206, 0.3)' },
              { offset: 1, color: 'rgba(49, 130, 206, 0.02)' }
            ]
          }
        },
      },
    ],
  }

  // 维修工单状态分布图配置
  const maintenanceStatusOption: any = {
    tooltip: { trigger: 'item', formatter: '{b}: {c}个 ({d}%)' },
    legend: {
      bottom: 0,
      left: 'center'
    },
    series: [
      {
        name: '工单状态',
        type: 'pie',
        radius: ['45%', '70%'],
        center: ['50%', '45%'],
        data: maintenanceStatusData.length > 0 ? maintenanceStatusData.map((item: any) => ({
          value: item.count,
          name: maintenanceStatusMap[item.status] || item.status,
          itemStyle: {
            color: item.status === 'pending' ? '#ed8936' :
                   item.status === 'processing' ? '#3182ce' :
                   item.status === 'completed' ? '#48bb78' : '#a0aec0'
          }
        })) : [{ value: 0, name: '暂无数据' }],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.2)',
          },
        },
        label: {
          formatter: '{b}: {c}个',
        },
      },
    ],
  }

  // 费用类型分布图配置
  const feeTypeOption: any = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: '{b}: {c}元'
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
      data: feeTypeData.length > 0 ? feeTypeData.map((item: any) => feeTypeMap[item.feeType] || item.feeType) : [''],
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
        name: '费用金额',
        type: 'bar',
        barWidth: '50%',
        data: feeTypeData.length > 0 ? feeTypeData.map((item: any) => ({
          value: item.amount,
          itemStyle: { color: '#3182ce' }
        })) : [0],
        itemStyle: {
          borderRadius: [4, 4, 0, 0]
        },
      },
    ],
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h2>管理控制台</h2>
          <p>欢迎回来！这里是您的业务数据概览</p>
        </div>
        <Button icon={<ReloadOutlined />} onClick={fetchDashboardData} loading={loading}>
          刷新数据
        </Button>
      </div>

      <Row gutter={[20, 20]}>
        {stats.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card bordered={false} className="stat-card">
              <div className="stat-icon" style={{ background: stat.color }}>
                {stat.icon}
              </div>
              <div className="stat-content">
                <div className="stat-title">{stat.title}</div>
                <div className="stat-value">{stat.value}</div>
                <div className={`stat-trend ${stat.trendUp ? 'up' : 'down'}`}>
                  {stat.trendUp ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                  <span>{stat.trend}</span>
                  <span style={{ color: '#a0aec0', marginLeft: 4 }}>较上月</span>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[20, 20]} style={{ marginTop: 20 }}>
        <Col xs={24}>
          <Card bordered={false} className="chart-card" title="收入趋势">
            <ReactECharts option={incomeTrendOption} style={{ height: 320 }} notMerge={true} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[20, 20]} style={{ marginTop: 20 }}>
        <Col xs={24} lg={12}>
          <Card bordered={false} className="chart-card" title="维修工单状态分布">
            <ReactECharts option={maintenanceStatusOption} style={{ height: 320 }} notMerge={true} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card bordered={false} className="chart-card" title="费用类型分布">
            <ReactECharts option={feeTypeOption} style={{ height: 320 }} notMerge={true} />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Dashboard