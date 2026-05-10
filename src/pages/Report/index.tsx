import { useState, useEffect } from 'react'
import { Card, Row, Col, DatePicker, Table, Spin, message } from 'antd'
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
  const [incomeData, setIncomeData] = useState<{ byDay: Array<{ day: string; amount: number }> }>({ byDay: [] })
  const [occupancyData, setOccupancyData] = useState<{ totalRooms: number; occupancyRate: number }>({ totalRooms: 0, occupancyRate: 0 })
  const [feeCompositionData, setFeeCompositionData] = useState<Array<{ feeType: string; amount: number }>>([])
  const [maintenanceStatsData, setMaintenanceStatsData] = useState<{ byStatus: Array<{ status: string; count: number }> }>({ byStatus: [] })
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
    } catch (error: unknown) {
      const err = error as Error
      if (err.name !== 'ApiError' && err.name !== 'HttpError') {
        message.error(err.message || '获取报表数据失败')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDateRangeChange = (dates: any) => {
    if (dates && dates[0] && dates[1]) {
      setDateRange(dates)
    }
  }

  // 收入趋势图配置
  const incomeTrendOption: any = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      formatter: '{b}<br/><span style="display:inline-block;margin-right:4px;border-radius:10px;width:10px;height:10px;background-color:#3182ce;"></span>{c}元'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '20px',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: incomeData?.byDay?.length > 0 ? incomeData.byDay.map((item: any) => item.day) : [''],
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
        data: incomeData?.byDay?.length > 0 ? incomeData.byDay.map((item: any) => item.amount) : [0],
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

  // 房间出租率趋势
  const occupancyTrendOption: any = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}%',
    },
    series: [
      {
        name: '出租率',
        type: 'gauge',
        detail: { formatter: '{value}%', fontSize: 20, fontWeight: 'bold', color: '#3182ce' },
        data: [
          {
            value: occupancyData?.occupancyRate ? Number(occupancyData.occupancyRate.toFixed(2)) : 0,
            name: '当前出租率',
          },
        ],
        itemStyle: { color: '#3182ce' },
        axisLine: {
          lineStyle: {
            width: 20,
            color: [
              [0.3, '#f56565'],
              [0.7, '#ed8936'],
              [1, '#48bb78']
            ]
          }
        },
      },
    ],
  }

  // 费用构成图配置
  const feeCompositionOption: any = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
    },
    legend: { bottom: 0, left: 'center' },
    series: [
      {
        name: '费用构成',
        type: 'pie',
        radius: ['45%', '70%'],
        center: ['50%', '45%'],
        data: feeCompositionData.length > 0 ? feeCompositionData.map((item: any) => ({
          value: item.amount,
          name: item.feeType === 'rent' ? '租金' :
                item.feeType === 'water' ? '水费' :
                item.feeType === 'electricity' ? '电费' :
                item.feeType === 'property' ? '物业费' : '其他',
          itemStyle: {
            color: item.feeType === 'rent' ? '#3182ce' :
                   item.feeType === 'water' ? '#13c2c2' :
                   item.feeType === 'electricity' ? '#ed8936' :
                   item.feeType === 'property' ? '#722ed1' : '#8c8c8c'
          }
        })) : [{ value: 0, name: '暂无数据' }],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.2)',
          },
        },
      },
    ],
  }

  // 维修统计图配置
  const maintenanceStatsOption: any = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '20px',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: maintenanceStatsData?.byStatus?.length > 0 ? maintenanceStatsData.byStatus.map((item: any) =>
        item.status === 'pending' ? '待处理' :
        item.status === 'processing' ? '处理中' :
        item.status === 'completed' ? '已完成' :
        item.status === 'cancelled' ? '已取消' : item.status
      ) : [''],
      axisLine: { lineStyle: { color: '#e2e8f0' } },
      axisLabel: { color: '#718096' }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: '#f0f0f0' } },
      axisLabel: { color: '#718096' }
    },
    series: [
      {
        name: '工单数量',
        type: 'bar',
        barWidth: '50%',
        data: maintenanceStatsData?.byStatus?.length > 0 ? maintenanceStatsData.byStatus.map((item: any) => ({
          value: item.count,
          itemStyle: {
            color: item.status === 'pending' ? '#ed8936' :
                   item.status === 'processing' ? '#3182ce' :
                   item.status === 'completed' ? '#48bb78' : '#a0aec0',
            borderRadius: [4, 4, 0, 0]
          }
        })) : [0],
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
        <div className="page-header">
          <div className="page-title">
            <h2>数据报表</h2>
            <p>查看各项业务数据统计和分析报表</p>
          </div>
        </div>

        <Card bordered={false} className="filter-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ color: '#1a365d', fontWeight: 500 }}>统计时间：</span>
            <RangePicker
              value={dateRange}
              onChange={handleDateRangeChange}
              format="YYYY-MM-DD"
              allowClear={false}
            />
          </div>
        </Card>

        <Row gutter={[20, 20]}>
          <Col xs={24} lg={12}>
            <Card bordered={false} className="chart-card" title="收入趋势">
              <ReactECharts option={incomeTrendOption} style={{ height: 350 }} notMerge={true} />
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card bordered={false} className="chart-card" title="房间出租率">
              <ReactECharts option={occupancyTrendOption} style={{ height: 350 }} notMerge={true} />
            </Card>
          </Col>
        </Row>

        <Row gutter={[20, 20]} style={{ marginTop: 20 }}>
          <Col xs={24} lg={12}>
            <Card bordered={false} className="chart-card" title="费用构成">
              <ReactECharts option={feeCompositionOption} style={{ height: 350 }} notMerge={true} />
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card bordered={false} className="chart-card" title="维修工单统计">
              <ReactECharts option={maintenanceStatsOption} style={{ height: 350 }} notMerge={true} />
            </Card>
          </Col>
        </Row>

        <Row gutter={[20, 20]} style={{ marginTop: 20 }}>
          <Col xs={24}>
            <Card bordered={false} className="table-card" title="租户费用排名">
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