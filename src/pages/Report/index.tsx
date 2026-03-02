import { useState, useEffect } from 'react'
import { Card, Row, Col, DatePicker, Select, Statistic, Table, Spin } from 'antd'
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import type { ColumnsType } from 'antd/es/table'
import { formatMoney } from '@/utils'
import { getIncomeReport, getOccupancyReport, getFeeComposition, getMaintenanceStats, getTenantRanking } from '@/api'
import './index.less'

const { RangePicker } = DatePicker

const Report = () => {
  const [loading, setLoading] = useState(false)
  const [incomeData, setIncomeData] = useState<{ byMonth: Array<{ month: string; amount: number }> }>({})
  const [occupancyData, setOccupancyData] = useState<{ totalRooms: number; occupancyRate: number }>({})
  const [feeCompositionData, setFeeCompositionData] = useState<Array<{ feeType: string; amount: number }>>([])
  const [maintenanceStatsData, setMaintenanceStatsData] = useState<{ byStatus: Array<{ status: string; count: number }> }>({})
  const [tenantRankingData, setTenantRankingData] = useState<Array<{ tenantId: number; tenantName: string; amount: number }>>([])

  useEffect(() => {
    fetchAllReports()
  }, [])

  const fetchAllReports = async () => {
    try {
      setLoading(true)
      const [income, occupancy, feeComp, maintenance, ranking] = await Promise.all([
        getIncomeReport(),
        getOccupancyReport(),
        getFeeComposition(),
        getMaintenanceStats(),
        getTenantRanking(),
      ])

      setIncomeData(income || { byMonth: [] })
      setOccupancyData(occupancy || { totalRooms: 0, occupancyRate: 0 })
      setFeeCompositionData(feeComp || [])
      setMaintenanceStatsData(maintenance || { byStatus: [] })
      setTenantRankingData(ranking || [])
    } catch (error) {
      console.error('获取报表数据失败', error)
    } finally {
      setLoading(false)
    }
  }

  // 收入趋势图配置
  const incomeTrendOption: any = {
    title: { text: '收入趋势分析', left: 'center' },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' }
    },
    legend: { bottom: 10, data: ['收入'] },
    xAxis: {
      type: 'category',
      data: incomeData?.byMonth?.length > 0 ? incomeData.byMonth.map((item: any) => item.month) : [''],
    },
    yAxis: { type: 'value', axisLabel: { formatter: '¥{value}' } },
    series: [
      {
        name: '收入',
        type: 'line',
        smooth: true,
        data: incomeData?.byMonth?.length > 0 ? incomeData.byMonth.map((item: any) => item.amount) : [0],
        itemStyle: { color: '#1890ff' },
      },
    ],
  }

  // 房间出租率趋势
  const occupancyTrendOption: any = {
    title: { text: '房间出租率统计', left: 'center' },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}%',
    },
    series: [
      {
        name: '出租率',
        type: 'gauge',
        detail: { formatter: '{value}%' },
        data: [
          {
            value: occupancyData?.occupancyRate ? Number(occupancyData.occupancyRate.toFixed(2)) : 0,
            name: '当前出租率',
          },
        ],
        itemStyle: { color: '#52c41a' },
      },
    ],
  }

  // 费用构成图配置
  const feeCompositionOption: any = {
    title: { text: '费用构成分析', left: 'center' },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
    },
    legend: { bottom: 10 },
    series: [
      {
        name: '费用构成',
        type: 'pie',
        radius: ['40%', '70%'],
        data: feeCompositionData.length > 0 ? feeCompositionData.map((item: any) => ({
          value: item.amount,
          name: item.feeType,
        })) : [{ value: 0, name: '暂无数据' }],
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

  // 维修统计图配置
  const maintenanceStatsOption: any = {
    title: { text: '维修工单统计', left: 'center' },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    xAxis: {
      type: 'category',
      data: maintenanceStatsData?.byStatus?.length > 0 ? maintenanceStatsData.byStatus.map((item: any) => item.status) : [''],
    },
    yAxis: { type: 'value' },
    series: [
      {
        name: '工单数量',
        type: 'bar',
        data: maintenanceStatsData?.byStatus?.length > 0 ? maintenanceStatsData.byStatus.map((item: any) => item.count) : [0],
        itemStyle: { color: '#1890ff' },
      },
    ],
  }

  // 租户排名表格配置
  const rankingColumns: ColumnsType<any> = [
    { title: '排名', dataIndex: 'rank', key: 'rank', width: 80, render: (_: any, __: any, index: number) => index + 1 },
    { title: '租户名称', dataIndex: 'tenantName', key: 'tenantName' },
    {
      title: '累计费用',
      dataIndex: 'amount',
      key: 'amount',
      render: (fee: number) => formatMoney(fee),
    },
  ]

  return (
    <Spin spinning={loading}>
      <div className="report">
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="收入趋势" bordered={false}>
              <ReactECharts option={incomeTrendOption} style={{ height: 350 }} />
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="房间出租率" bordered={false}>
              <ReactECharts option={occupancyTrendOption} style={{ height: 350 }} />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24} lg={12}>
            <Card title="费用构成" bordered={false}>
              <ReactECharts option={feeCompositionOption} style={{ height: 350 }} />
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="维修工单统计" bordered={false}>
              <ReactECharts option={maintenanceStatsOption} style={{ height: 350 }} />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24}>
            <Card title="租户费用排名" bordered={false}>
              <Table
                columns={rankingColumns}
                dataSource={tenantRankingData}
                rowKey="rank"
                pagination={false}
                size="small"
              />
            </Card>
          </Col>
        </Row>
      </div>
    </Spin>
  )
}

export default Report
