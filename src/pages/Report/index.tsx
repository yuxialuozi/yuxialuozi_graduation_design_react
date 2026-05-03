import { useState, useEffect } from 'react'
import { Card, Row, Col, DatePicker, Select, Statistic, Table, Spin } from 'antd'
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import type { ColumnsType } from 'antd/es/table'
import dayjs, { Dayjs } from 'dayjs'
import { formatMoney } from '@/utils'
import { getIncomeReport, getOccupancyReport, getFeeComposition, getMaintenanceStats, getTenantRanking } from '@/api'
import './index.less'

const { RangePicker } = DatePicker

const Report = () => {
  const [loading, setLoading] = useState(false)
  const currentYear = dayjs().year()
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs(`${currentYear}-01-01`),
    dayjs(`${currentYear}-12-31`),
  ])
  const [incomeData, setIncomeData] = useState<{ byDay: Array<{ day: string; amount: number }> }>({})
  const [occupancyData, setOccupancyData] = useState<{ totalRooms: number; occupancyRate: number }>({})
  const [feeCompositionData, setFeeCompositionData] = useState<Array<{ feeType: string; amount: number }>>([])
  const [maintenanceStatsData, setMaintenanceStatsData] = useState<{ byStatus: Array<{ status: string; count: number }> }>({})
  const [tenantRankingData, setTenantRankingData] = useState<Array<{ tenantId: number; tenantName: string; amount: number }>>([])

  useEffect(() => {
    fetchAllReports()
  }, [dateRange])

  const fetchAllReports = async () => {
    try {
      setLoading(true)
      const [income, occupancy, feeComp, maintenance, ranking] = await Promise.all([
        getIncomeReport({
          start: dateRange[0].format('YYYY-MM-DD'),
          end: dateRange[1].format('YYYY-MM-DD'),
        }),
        getOccupancyReport({
          start: dateRange[0].format('YYYY-MM-DD'),
          end: dateRange[1].format('YYYY-MM-DD'),
        }),
        getFeeComposition({
          start: dateRange[0].format('YYYY-MM-DD'),
          end: dateRange[1].format('YYYY-MM-DD'),
        }),
        getMaintenanceStats({
          start: dateRange[0].format('YYYY-MM-DD'),
          end: dateRange[1].format('YYYY-MM-DD'),
        }),
        getTenantRanking({
          start: dateRange[0].format('YYYY-MM-DD'),
          end: dateRange[1].format('YYYY-MM-DD'),
        }),
      ])

      setIncomeData(income || { byDay: [] })
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

  const handleDateRangeChange = (dates: [Dayjs, Dayjs] | null) => {
    if (dates && dates[0] && dates[1]) {
      setDateRange(dates)
    }
  }

  // 收入趋势图配置
  const incomeTrendOption: any = {
    title: { text: '收入趋势分析', left: 'center' },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      formatter: '{b}<br/>{c}元'
    },
    legend: { bottom: 10, data: ['收入'] },
    xAxis: {
      type: 'category',
      data: incomeData?.byDay?.length > 0 ? incomeData.byDay.map((item: any) => item.day) : [''],
      name: '日期',
      nameLocation: 'middle',
      nameTextStyle: { fontSize: 14, fontWeight: 'bold' }
    },
    yAxis: {
      type: 'value',
      name: '金额（元）',
      nameLocation: 'middle',
      nameTextStyle: { fontSize: 14, fontWeight: 'bold' },
      axisLabel: { formatter: '¥{value}' }
    },
    series: [
      {
        name: '收入',
        type: 'line',
        smooth: true,
        data: incomeData?.byDay?.length > 0 ? incomeData.byDay.map((item: any) => item.amount) : [0],
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
          name: item.feeType === 'rent' ? '租金' :
                item.feeType === 'water' ? '水费' :
                item.feeType === 'electricity' ? '电费' :
                item.feeType === 'property' ? '物业费' : '其他'
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
      data: maintenanceStatsData?.byStatus?.length > 0 ? maintenanceStatsData.byStatus.map((item: any) =>
        item.status === 'pending' ? '待处理' :
        item.status === 'processing' ? '处理中' :
        item.status === 'completed' ? '已完成' :
        item.status === 'cancelled' ? '已取消' : item.status
      ) : [''],
      name: '工单状态',
      nameLocation: 'middle',
      nameTextStyle: { fontSize: 14, fontWeight: 'bold' }
    },
    yAxis: {
      type: 'value',
      name: '工单数量',
      nameLocation: 'middle',
      nameTextStyle: { fontSize: 14, fontWeight: 'bold' }
    },
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
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24}>
            <Card bordered={false}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span>统计时间：</span>
                <RangePicker
                  value={dateRange}
                  onChange={handleDateRangeChange}
                  format="YYYY-MM-DD"
                  allowClear={false}
                />
              </div>
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="收入趋势" bordered={false}>
              <ReactECharts option={incomeTrendOption} style={{ height: 350 }} notMerge={true} />
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="房间出租率" bordered={false}>
              <ReactECharts option={occupancyTrendOption} style={{ height: 350 }} notMerge={true} />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24} lg={12}>
            <Card title="费用构成" bordered={false}>
              <ReactECharts option={feeCompositionOption} style={{ height: 350 }} notMerge={true} />
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="维修工单统计" bordered={false}>
              <ReactECharts option={maintenanceStatsOption} style={{ height: 350 }} notMerge={true} />
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