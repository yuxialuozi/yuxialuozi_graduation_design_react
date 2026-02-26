import { useState, useEffect } from 'react'
import { Row, Col, Card, Statistic } from 'antd'
import { UserOutlined, FileTextOutlined, HomeOutlined, DollarOutlined } from '@ant-design/icons'
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
    } catch (error) {
      console.error('获取仪表盘数据失败', error)
    } finally {
      setLoading(false)
    }
  }

  // 如果没有数据，使用默认值
  const stats = dashboardData ? [
    { title: '租户总数', value: dashboardData.totalTenants, icon: <UserOutlined />, color: '#1890ff' },
    { title: '合同数量', value: dashboardData.activeContracts, icon: <FileTextOutlined />, color: '#52c41a' },
    { title: '房间总数', value: dashboardData.totalRooms, icon: <HomeOutlined />, color: '#faad14' },
    { title: '本月收入', value: dashboardData.monthlyIncome || 0, icon: <DollarOutlined />, color: '#f5222d', prefix: '¥' },
  ] : [
    { title: '租户总数', value: 128, icon: <UserOutlined />, color: '#1890ff' },
    { title: '合同数量', value: 95, icon: <FileTextOutlined />, color: '#52c41a' },
    { title: '房间总数', value: 256, icon: <HomeOutlined />, color: '#faad14' },
    { title: '本月收入', value: 125600, icon: <DollarOutlined />, color: '#f5222d', prefix: '¥' },
  ]

  const incomeChartData = dashboardData?.incomeChart || []
  const maintenanceStatusData = dashboardData?.maintenanceStatusChart || []
  const feeTypeData = dashboardData?.feeTypeChart || []

  // 收入趋势图配置
  const incomeTrendOption: any = {
    title: { text: '收入趋势', left: 'center' },
    tooltip: { trigger: 'axis' },
   xAxis: {
      type: 'category',
      data: incomeChartData.length > 0 ? incomeChartData.map((item: any) => item.date) : [''],
    },
    yAxis: { type: 'value', name: '金额' },
    series: [
      {
        name: '收入',
        type: 'line',
        smooth: true,
        data: incomeChartData.length > 0 ? incomeChartData.map((item: any) => item.amount) : [0],
        itemStyle: { color: '#1890ff' },
        lineStyle: { width: 2 },
      },
    ],
  }

  // 维修工单状态分布图配置
  const maintenanceStatusOption: any = {
    title: { text: '维修工单状态分布', left: 'center' },
    tooltip: { trigger: 'item' },
    legend: { top: 'bottom' },
    series: [
      {
        name: '工单状态',
        type: 'pie',
        radius: ['40%', '70%'],
        data: maintenanceStatusData.length > 0 ? maintenanceStatusData.map((item: any) => ({
          value: item.count,
          name: item.status,
        })) : [{ value: 0, name: '暂无数据' }],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
        label: {
          formatter: '{b}: {c} ({d}%)',
        },
      },
    ],
  }

  // 费用类型分布图配置
  const feeTypeOption: any = {
    title: { text: '费用类型分布', left: 'center' },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    xAxis: {
      type: 'category',
      data: feeTypeData.length > 0 ? feeTypeData.map((item: any) => item.feeType) : [''],
    },
    yAxis: { type: 'value', name: '金额' },
    series: [
      {
        name: '费用金额',
        type: 'bar',
        data: feeTypeData.length > 0 ? feeTypeData.map((item: any) => item.amount) : [0],
        itemStyle: { color: '#1890ff' },
      },
    ],
  }

  return (
    <div className="dashboard">
      <Row gutter={[16, 16]}>
        {stats.map((stat, index) => (
          <Col xs={24} sm={12} md={6} key={index}>
            <Card bordered={false}>
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={stat.prefix || stat.icon}
                valueStyle={{ color: stat.color }}
                formatter={(value) => {
                  if (stat.prefix === '¥') {
                    return formatMoney(Number(value))
                  }
                  return value
                }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={24}>
          <Card title="收入趋势" loading={loading} bordered={false}>
            <ReactECharts option={incomeTrendOption} style={{ height: 300 }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="维修工单状态分布" loading={loading} bordered={false}>
            <ReactECharts option={maintenanceStatusOption} style={{ height: 300 }} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="费用类型分布" loading={loading} bordered={false}>
            <ReactECharts option={feeTypeOption} style={{ height: 300 }} />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Dashboard
