import { Row, Col, Card, Statistic } from 'antd'
import { UserOutlined, FileTextOutlined, HomeOutlined, DollarOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import './index.less'

const Dashboard = () => {
  // 统计数据
  const statistics = [
    { title: '租户总数', value: 128, icon: <UserOutlined />, color: '#1890ff' },
    { title: '合同数量', value: 95, icon: <FileTextOutlined />, color: '#52c41a' },
    { title: '房间总数', value: 256, icon: <HomeOutlined />, color: '#faad14' },
    { title: '本月收入', value: 125600, icon: <DollarOutlined />, color: '#f5222d', prefix: '¥' },
  ]

  // 租户增长趋势图配置
  const tenantTrendOption = {
    title: { text: '租户增长趋势', left: 'center' },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月'],
    },
    yAxis: { type: 'value' },
    series: [
      {
        name: '新增租户',
        type: 'line',
        smooth: true,
        data: [12, 19, 15, 25, 22, 30],
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(24, 144, 255, 0.3)' },
              { offset: 1, color: 'rgba(24, 144, 255, 0.05)' },
            ],
          },
        },
      },
    ],
  }

  // 收入统计图配置
  const incomeOption = {
    title: { text: '月度收入统计', left: 'center' },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月'],
    },
    yAxis: { type: 'value', axisLabel: { formatter: '¥{value}' } },
    series: [
      {
        name: '收入',
        type: 'bar',
        data: [98000, 102000, 115000, 108000, 120000, 125600],
        itemStyle: { color: '#52c41a' },
      },
    ],
  }

  // 房间使用率饼图
  const roomUsageOption = {
    title: { text: '房间使用情况', left: 'center' },
    tooltip: { trigger: 'item' },
    legend: { bottom: 10 },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        data: [
          { value: 180, name: '已出租', itemStyle: { color: '#52c41a' } },
          { value: 56, name: '空置', itemStyle: { color: '#faad14' } },
          { value: 20, name: '维修中', itemStyle: { color: '#f5222d' } },
        ],
      },
    ],
  }

  return (
    <div className="dashboard">
      <Row gutter={[16, 16]}>
        {statistics.map((item, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: item.color }}>
                {item.icon}
              </div>
              <Statistic
                title={item.title}
                value={item.value}
                prefix={item.prefix}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card>
            <ReactECharts option={tenantTrendOption} style={{ height: 300 }} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card>
            <ReactECharts option={incomeOption} style={{ height: 300 }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card>
            <ReactECharts option={roomUsageOption} style={{ height: 300 }} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="待办事项">
            <ul className="todo-list">
              <li>3 份合同即将到期</li>
              <li>5 条维修工单待处理</li>
              <li>2 位租户费用待缴纳</li>
              <li>本月账单待生成</li>
            </ul>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Dashboard
