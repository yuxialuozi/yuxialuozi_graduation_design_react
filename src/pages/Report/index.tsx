import { useState } from 'react'
import { Card, Row, Col, DatePicker, Select, Statistic, Table } from 'antd'
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import type { ColumnsType } from 'antd/es/table'
import { formatMoney } from '@/utils'
import './index.less'

const { RangePicker } = DatePicker

const Report = () => {
  const [dateRange] = useState<string>('month')

  // 收入趋势图配置
  const incomeTrendOption = {
    title: { text: '收入趋势分析', left: 'center' },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' }
    },
    legend: { bottom: 10, data: ['租金收入', '其他收入', '总收入'] },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    },
    yAxis: { type: 'value', axisLabel: { formatter: '¥{value}' } },
    series: [
      {
        name: '租金收入',
        type: 'bar',
        data: [95000, 98000, 102000, 105000, 108000, 112000, 115000, 118000, 120000, 122000, 125000, 128000],
        itemStyle: { color: '#1890ff' },
      },
      {
        name: '其他收入',
        type: 'bar',
        data: [8000, 8500, 9200, 9800, 10500, 11000, 11500, 12000, 12500, 13000, 13500, 14000],
        itemStyle: { color: '#52c41a' },
      },
      {
        name: '总收入',
        type: 'line',
        data: [103000, 106500, 111200, 114800, 118500, 123000, 126500, 130000, 132500, 135000, 138500, 142000],
        itemStyle: { color: '#faad14' },
      },
    ],
  }

  // 房间出租率趋势
  const occupancyTrendOption = {
    title: { text: '房间出租率趋势', left: 'center' },
    tooltip: {
      trigger: 'axis',
      formatter: '{b}: {c}%'
    },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLabel: { formatter: '{value}%' }
    },
    series: [
      {
        name: '出租率',
        type: 'line',
        smooth: true,
        data: [85, 87, 88, 90, 92, 93, 94, 95, 94, 93, 92, 91],
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(24, 144, 255, 0.5)' },
              { offset: 1, color: 'rgba(24, 144, 255, 0.05)' },
            ],
          },
        },
        markLine: {
          data: [{ type: 'average', name: '平均值' }]
        }
      },
    ],
  }

  // 费用构成饼图
  const feeCompositionOption = {
    title: { text: '费用构成分析', left: 'center' },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: { bottom: 10 },
    series: [
      {
        type: 'pie',
        radius: ['35%', '60%'],
        label: {
          show: true,
          formatter: '{b}\n{d}%'
        },
        data: [
          { value: 128000, name: '租金', itemStyle: { color: '#1890ff' } },
          { value: 8500, name: '水费', itemStyle: { color: '#13c2c2' } },
          { value: 15200, name: '电费', itemStyle: { color: '#faad14' } },
          { value: 12000, name: '物业费', itemStyle: { color: '#722ed1' } },
          { value: 3800, name: '其他', itemStyle: { color: '#eb2f96' } },
        ],
      },
    ],
  }

  // 维修工单统计
  const maintenanceStatsOption = {
    title: { text: '维修工单统计', left: 'center' },
    tooltip: { trigger: 'axis' },
    legend: { bottom: 10, data: ['新建工单', '已完成'] },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月'],
    },
    yAxis: { type: 'value' },
    series: [
      {
        name: '新建工单',
        type: 'bar',
        data: [12, 15, 10, 18, 14, 16],
        itemStyle: { color: '#1890ff' },
      },
      {
        name: '已完成',
        type: 'bar',
        data: [10, 14, 11, 16, 13, 15],
        itemStyle: { color: '#52c41a' },
      },
    ],
  }

  // 租户排名数据
  const tenantRankingData = [
    { rank: 1, name: '张三', roomNo: 'A-101', totalPaid: 32500, onTimeRate: 100 },
    { rank: 2, name: '李四', roomNo: 'A-201', totalPaid: 38000, onTimeRate: 95 },
    { rank: 3, name: '王五', roomNo: 'B-101', totalPaid: 28000, onTimeRate: 90 },
    { rank: 4, name: '赵六', roomNo: 'B-201', totalPaid: 35000, onTimeRate: 85 },
    { rank: 5, name: '钱七', roomNo: 'C-101', totalPaid: 30000, onTimeRate: 80 },
  ]

  const rankingColumns: ColumnsType<typeof tenantRankingData[0]> = [
    { title: '排名', dataIndex: 'rank', key: 'rank', width: 80 },
    { title: '租户', dataIndex: 'name', key: 'name' },
    { title: '房间号', dataIndex: 'roomNo', key: 'roomNo' },
    {
      title: '累计缴费',
      dataIndex: 'totalPaid',
      key: 'totalPaid',
      render: (val: number) => formatMoney(val)
    },
    {
      title: '按时缴费率',
      dataIndex: 'onTimeRate',
      key: 'onTimeRate',
      render: (val: number) => `${val}%`
    },
  ]

  return (
    <div className="report-page">
      {/* 筛选条件 */}
      <Card className="filter-card">
        <Row gutter={16} align="middle">
          <Col>
            <span>时间范围：</span>
            <Select
              value={dateRange}
              style={{ width: 120, marginRight: 16 }}
              options={[
                { label: '本月', value: 'month' },
                { label: '本季度', value: 'quarter' },
                { label: '本年', value: 'year' },
                { label: '自定义', value: 'custom' },
              ]}
            />
          </Col>
          <Col>
            <RangePicker />
          </Col>
        </Row>
      </Card>

      {/* 关键指标 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="本月总收入"
              value={142000}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#3f8600' }}
              suffix={
                <span style={{ fontSize: 14, marginLeft: 8 }}>
                  <ArrowUpOutlined /> 8.5%
                </span>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="待收费用"
              value={15680}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#cf1322' }}
              suffix={
                <span style={{ fontSize: 14, marginLeft: 8, color: '#52c41a' }}>
                  <ArrowDownOutlined /> 12%
                </span>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="当前出租率"
              value={91}
              suffix="%"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="待处理工单"
              value={5}
              valueStyle={{ color: '#faad14' }}
              suffix="件"
            />
          </Card>
        </Col>
      </Row>

      {/* 图表区域 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card>
            <ReactECharts option={incomeTrendOption} style={{ height: 350 }} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card>
            <ReactECharts option={occupancyTrendOption} style={{ height: 350 }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card>
            <ReactECharts option={feeCompositionOption} style={{ height: 350 }} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card>
            <ReactECharts option={maintenanceStatsOption} style={{ height: 350 }} />
          </Card>
        </Col>
      </Row>

      {/* 租户排名 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24}>
          <Card title="租户缴费排名">
            <Table
              columns={rankingColumns}
              dataSource={tenantRankingData}
              rowKey="rank"
              pagination={false}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Report
