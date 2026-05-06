import { useEffect, useState } from 'react'
import {
  Card,
  Table,
  Tag,
  Button,
  Modal,
  message,
  Spin,
  Select,
  Space,
  Steps,
  Descriptions,
  Radio,
  Row,
  Col,
  Statistic,
  Divider,
  Alert,
  Timeline,
  QRCode,
} from 'antd'
import {
  CreditCardOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WechatOutlined,
  BankOutlined,
  MoneyCollectOutlined,
  DollarOutlined,
} from '@ant-design/icons'
import { getTenantFees, payTenantFee } from '@/api/user'
import type { Fee } from '@/types'
import dayjs from 'dayjs'
import './index.less'

interface PaymentRecord extends Fee {
  paymentMethod?: 'wechat' | 'alipay' | 'bank' | 'cash'
  paymentTime?: string
  receiptNo?: string
}

const UserFee = () => {
  const [loading, setLoading] = useState(true)
  const [fees, setFees] = useState<Fee[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [feeTypeFilter, setFeeTypeFilter] = useState<string>('')

  // Payment modal states
  const [paymentModalVisible, setPaymentModalVisible] = useState(false)
  const [receiptModalVisible, setReceiptModalVisible] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<PaymentRecord | null>(null)
  const [paymentStep, setPaymentStep] = useState(0)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('wechat')
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [paidRecords, setPaidRecords] = useState<Map<number, PaymentRecord>>(new Map())

  const fetchFees = async () => {
    try {
      setLoading(true)
      const result = await getTenantFees({ page, pageSize, status: statusFilter, feeType: feeTypeFilter })
      setFees(result.list || [])
      setTotal(result.total || 0)
    } catch (error: unknown) {
      const err = error as unknown as { name?: string; message?: string }
      if (err.name !== 'ApiError' && err.name !== 'HttpError') {
        message.error(err.message || '获取账单列表失败')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFees()
  }, [page, pageSize, statusFilter, feeTypeFilter])

  const generateReceiptNo = () => {
    const date = dayjs().format('YYYYMMDD')
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `RC${date}${random}`
  }

  const handlePaymentClick = (record: Fee) => {
    setSelectedRecord(record as PaymentRecord)
    setPaymentStep(0)
    setSelectedPaymentMethod('wechat')
    setPaymentModalVisible(true)
  }

  const handleNextStep = () => {
    if (paymentStep === 0) {
      setPaymentStep(1)
    } else if (paymentStep === 1) {
      handleConfirmPayment()
    }
  }

  const handleConfirmPayment = async () => {
    if (!selectedRecord) return

    setPaymentLoading(true)
    try {
      await payTenantFee(selectedRecord.id)

      const receiptNo = generateReceiptNo()
      const paidRecord: PaymentRecord = {
        ...selectedRecord,
        paymentMethod: selectedPaymentMethod as PaymentRecord['paymentMethod'],
        paymentTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        receiptNo,
      }

      setPaidRecords(new Map(paidRecords.set(selectedRecord.id, paidRecord)))
      setPaymentStep(2)
      fetchFees()
    } catch (error: unknown) {
      const err = error as unknown as { name?: string; message?: string }
      if (err.name !== 'ApiError' && err.name !== 'HttpError') {
        message.error(err.message || '付款失败')
      }
    } finally {
      setPaymentLoading(false)
    }
  }

  const handleViewReceipt = () => {
    if (selectedRecord) {
      const paidRecord = paidRecords.get(selectedRecord.id)
      if (paidRecord) {
        setSelectedRecord(paidRecord)
        setReceiptModalVisible(true)
      }
    }
  }

  const getFeeTypeName = (type: string) => {
    const typeMap: Record<string, string> = {
      rent: '租金',
      water: '水费',
      electricity: '电费',
      property: '物业费',
      other: '其他',
    }
    return typeMap[type] || type
  }

  const getFeeTypeColor = (type: string) => {
    const colorMap: Record<string, string> = {
      rent: 'blue',
      water: 'cyan',
      electricity: 'orange',
      property: 'purple',
      other: 'default',
    }
    return colorMap[type] || 'default'
  }

  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      paid: { color: 'success', text: '已缴' },
      unpaid: { color: 'error', text: '待付款' },
      overdue: { color: 'warning', text: '已逾期' },
    }
    const s = statusMap[status] || { color: 'default', text: status }
    return <Tag color={s.color}>{s.text}</Tag>
  }

  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case 'wechat':
        return '微信支付'
      case 'alipay':
        return '支付宝'
      case 'bank':
        return '银行转账'
      case 'cash':
        return '现金支付'
      default:
        return method
    }
  }

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'wechat':
        return <WechatOutlined style={{ fontSize: 20, color: '#07C160' }} />
      case 'alipay':
        return <span style={{ fontSize: 16, fontWeight: 'bold', color: '#1677FF' }}>支</span>
      case 'bank':
        return <BankOutlined style={{ fontSize: 20, color: '#722ED1' }} />
      case 'cash':
        return <MoneyCollectOutlined style={{ fontSize: 20, color: '#D46B08' }} />
      default:
        return null
    }
  }

  const formatMoney = (amount: number) => `¥${amount.toFixed(2)}`

  // Calculate statistics
  const unpaidFees = fees.filter(f => f.status === 'unpaid' || f.status === 'overdue')
  const totalUnpaid = unpaidFees.reduce((sum, f) => sum + f.amount, 0)
  const paidFees = fees.filter(f => f.status === 'paid')
  const totalPaid = paidFees.reduce((sum, f) => sum + f.amount, 0)

  const columns = [
    {
      title: '房间号',
      dataIndex: 'roomNo',
      key: 'roomNo',
    },
    {
      title: '费用类型',
      dataIndex: 'feeType',
      key: 'feeType',
      render: (type: string) => (
        <Tag color={getFeeTypeColor(type)}>{getFeeTypeName(type)}</Tag>
      ),
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => (
        <span style={{ fontWeight: 600, color: '#1a365d' }}>{formatMoney(amount)}</span>
      ),
    },
    {
      title: '账期',
      dataIndex: 'period',
      key: 'period',
    },
    {
      title: '到期日期',
      dataIndex: 'dueDate',
      key: 'dueDate',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: unknown, record: Fee) =>
        record.status === 'unpaid' || record.status === 'overdue' ? (
          <Button
            type="primary"
            icon={<CreditCardOutlined />}
            onClick={() => handlePaymentClick(record)}
          >
            立即付款
          </Button>
        ) : (
          <Tag color="success" icon={<CheckCircleOutlined />}>已完成</Tag>
        ),
    },
  ]

  return (
    <div className="user-fee">
      <div className="page-header">
        <h2>我的账单</h2>
        <p>查看和管理您的所有费用账单，支持多种支付方式</p>
      </div>

      {/* Statistics Cards */}
      <Row gutter={16} className="stats-row">
        <Col span={8}>
          <Card bordered={false} className="stat-card">
            <Statistic
              title="待付款笔数"
              value={unpaidFees.length}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false} className="stat-card">
            <Statistic
              title="待付款金额"
              value={totalUnpaid}
              prefix={<DollarOutlined />}
              precision={2}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false} className="stat-card">
            <Statistic
              title="已付款金额"
              value={totalPaid}
              prefix={<CheckCircleOutlined />}
              precision={2}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Card bordered={false} className="content-card">
        <div className="filter-bar">
          <Space>
            <Select
              placeholder="费用状态"
              allowClear
              style={{ width: 120 }}
              value={statusFilter || undefined}
              onChange={(v) => {
                setStatusFilter(v || '')
                setPage(1)
              }}
              options={[
                { label: '全部', value: '' },
                { label: '待付款', value: 'unpaid' },
                { label: '已付款', value: 'paid' },
                { label: '已逾期', value: 'overdue' },
              ]}
            />
            <Select
              placeholder="费用类型"
              allowClear
              style={{ width: 120 }}
              value={feeTypeFilter || undefined}
              onChange={(v) => {
                setFeeTypeFilter(v || '')
                setPage(1)
              }}
              options={[
                { label: '全部', value: '' },
                { label: '租金', value: 'rent' },
                { label: '水费', value: 'water' },
                { label: '电费', value: 'electricity' },
                { label: '物业费', value: 'property' },
                { label: '其他', value: 'other' },
              ]}
            />
          </Space>
        </div>

        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={fees}
            rowKey="id"
            pagination={{
              current: page,
              pageSize,
              total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (t) => `共 ${t} 条`,
              onChange: (p, ps) => {
                setPage(p)
                setPageSize(ps)
              },
            }}
            locale={fees.length === 0 ? { emptyText: '暂无账单数据' } : undefined}
          />
        </Spin>
      </Card>

      {/* Payment Flow Modal */}
      <Modal
        title="付款流程"
        open={paymentModalVisible}
        onCancel={() => setPaymentModalVisible(false)}
        footer={null}
        width={650}
        destroyOnClose
        className="payment-modal"
      >
        <Steps
          current={paymentStep}
          items={[
            { title: '确认账单', description: '核对付款信息' },
            { title: '选择支付方式', description: '选择付款渠道' },
            { title: '付款成功', description: '查看收据' },
          ]}
          style={{ marginBottom: 24 }}
        />

        {paymentStep === 0 && selectedRecord && (
          <div className="payment-step-content">
            <Alert
              message="请确认以下付款信息"
              description="核对账单详情，确保信息准确后点击下一步"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="房间号" span={2}>
                <strong>{selectedRecord.roomNo}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="费用类型">
                <Tag color={getFeeTypeColor(selectedRecord.feeType)}>
                  {getFeeTypeName(selectedRecord.feeType)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="账期">{selectedRecord.period}</Descriptions.Item>
              <Descriptions.Item label="到期日期">{selectedRecord.dueDate}</Descriptions.Item>
              <Descriptions.Item label="应付金额" span={2}>
                <span style={{ fontSize: 24, fontWeight: 'bold', color: '#f5222d' }}>
                  {formatMoney(selectedRecord.amount)}
                </span>
              </Descriptions.Item>
            </Descriptions>
            <div style={{ textAlign: 'right', marginTop: 24 }}>
              <Button onClick={() => setPaymentModalVisible(false)}>取消</Button>
              <Button type="primary" onClick={handleNextStep} style={{ marginLeft: 8 }}>
                下一步
              </Button>
            </div>
          </div>
        )}

        {paymentStep === 1 && selectedRecord && (
          <div className="payment-step-content">
            <Alert
              message="请选择支付方式"
              description="支持多种支付方式，请选择您偏好的付款渠道"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <Radio.Group
              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
              value={selectedPaymentMethod}
              className="payment-methods"
            >
              <Radio value="wechat" className="payment-method-item">
                <Card size="small" className="method-card">
                  <WechatOutlined style={{ fontSize: 28, color: '#07C160', marginBottom: 6 }} />
                  <div>微信支付</div>
                </Card>
              </Radio>
              <Radio value="alipay" className="payment-method-item">
                <Card size="small" className="method-card">
                  <span style={{ fontSize: 24, fontWeight: 'bold', color: '#1677FF', marginBottom: 6 }}>支</span>
                  <div>支付宝</div>
                </Card>
              </Radio>
              <Radio value="bank" className="payment-method-item">
                <Card size="small" className="method-card">
                  <BankOutlined style={{ fontSize: 28, color: '#722ED1', marginBottom: 6 }} />
                  <div>银行转账</div>
                </Card>
              </Radio>
              <Radio value="cash" className="payment-method-item">
                <Card size="small" className="method-card">
                  <MoneyCollectOutlined style={{ fontSize: 28, color: '#D46B08', marginBottom: 6 }} />
                  <div>现金支付</div>
                </Card>
              </Radio>
            </Radio.Group>

            {selectedPaymentMethod === 'wechat' && (
              <div className="qrcode-container">
                <QRCode value="weixin://wxpay/bizpayurl?pr=xxxxxx" size={140} />
                <p style={{ marginTop: 12, color: '#666', fontSize: 13 }}>
                  请使用微信扫描二维码完成付款
                </p>
              </div>
            )}

            {selectedPaymentMethod === 'alipay' && (
              <div className="qrcode-container">
                <QRCode value="alipay://xxxxxx" size={140} />
                <p style={{ marginTop: 12, color: '#666', fontSize: 13 }}>
                  请使用支付宝扫描二维码完成付款
                </p>
              </div>
            )}

            {selectedPaymentMethod === 'bank' && (
              <div className="bank-info">
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="收款单位">物业管理有限公司</Descriptions.Item>
                  <Descriptions.Item label="银行账号">6222 **** **** 8888</Descriptions.Item>
                  <Descriptions.Item label="开户行">中国工商银行XX支行</Descriptions.Item>
                </Descriptions>
              </div>
            )}

            {selectedPaymentMethod === 'cash' && (
              <div className="cash-info">
                <Alert
                  message="请到前台现金缴费"
                  description="缴费完成后，请将付款凭证交由前台工作人员确认"
                  type="warning"
                  showIcon
                />
              </div>
            )}

            <div style={{ textAlign: 'right', marginTop: 24 }}>
              <Button onClick={() => setPaymentStep(0)}>上一步</Button>
              <Button
                type="primary"
                loading={paymentLoading}
                onClick={handleConfirmPayment}
                style={{ marginLeft: 8 }}
              >
                确认付款 {formatMoney(selectedRecord.amount)}
              </Button>
            </div>
          </div>
        )}

        {paymentStep === 2 && selectedRecord && (
          <div className="payment-step-content">
            <div className="success-container">
              <CheckCircleOutlined style={{ fontSize: 56, color: '#52c41a', marginBottom: 12 }} />
              <h3 style={{ color: '#52c41a', marginBottom: 8 }}>付款成功！</h3>
              <p style={{ color: '#666', marginBottom: 16 }}>
                您的付款已成功受理，收据正在生成中...
              </p>

              <Timeline
                items={[
                  {
                    color: 'green',
                    children: `付款金额：${formatMoney(selectedRecord.amount)}`,
                  },
                  {
                    color: 'green',
                    children: `支付方式：${getPaymentMethodName(selectedPaymentMethod)}`,
                  },
                  {
                    color: 'green',
                    children: `付款时间：${dayjs().format('YYYY-MM-DD HH:mm:ss')}`,
                  },
                  {
                    color: 'green',
                    children: `收据单号：${paidRecords.get(selectedRecord.id)?.receiptNo}`,
                  },
                ]}
              />

              <Divider />

              <Space>
                <Button type="primary" onClick={handleViewReceipt}>
                  查看收据
                </Button>
                <Button onClick={() => setPaymentModalVisible(false)}>
                  完成
                </Button>
              </Space>
            </div>
          </div>
        )}
      </Modal>

      {/* Receipt Modal */}
      <Modal
        title="付款收据"
        open={receiptModalVisible}
        onCancel={() => setReceiptModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setReceiptModalVisible(false)}>
            关闭
          </Button>,
        ]}
        width={450}
      >
        {selectedRecord && (
          <div className="receipt-container">
            <div className="receipt-header">
              <h3>收款收据</h3>
              <p>RECEIPT</p>
            </div>

            <div className="receipt-info">
              <Descriptions column={2} size="small">
                <Descriptions.Item label="收据编号" span={2}>
                  <strong style={{ fontFamily: 'monospace' }}>
                    {paidRecords.get(selectedRecord.id)?.receiptNo}
                  </strong>
                </Descriptions.Item>
                <Descriptions.Item label="开票日期">
                  {dayjs().format('YYYY-MM-DD')}
                </Descriptions.Item>
                <Descriptions.Item label="支付方式">
                  {getPaymentMethodIcon(selectedPaymentMethod)}
                  <span style={{ marginLeft: 6 }}>
                    {getPaymentMethodName(selectedPaymentMethod)}
                  </span>
                </Descriptions.Item>
              </Descriptions>
            </div>

            <Divider style={{ margin: '10px 0' }} />

            <div className="receipt-details">
              <Descriptions column={2} size="small">
                <Descriptions.Item label="房间号">{selectedRecord.roomNo}</Descriptions.Item>
                <Descriptions.Item label="费用类型">
                  <Tag color={getFeeTypeColor(selectedRecord.feeType)}>
                    {getFeeTypeName(selectedRecord.feeType)}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="账期">{selectedRecord.period}</Descriptions.Item>
              </Descriptions>
            </div>

            <Divider style={{ margin: '10px 0' }} />

            <div className="receipt-amount">
              <Descriptions column={1} size="small">
                <Descriptions.Item label="实收金额">
                  <span style={{ fontSize: 24, fontWeight: 'bold', color: '#f5222d' }}>
                    ¥{selectedRecord.amount.toFixed(2)}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="大写">
                  {toChineseCurrency(selectedRecord.amount)}
                </Descriptions.Item>
              </Descriptions>
            </div>

            <Divider style={{ margin: '10px 0' }} />

            <div className="receipt-footer">
              <Descriptions column={2} size="small">
                <Descriptions.Item label="收款人">系统管理员</Descriptions.Item>
                <Descriptions.Item label="复核人">-</Descriptions.Item>
              </Descriptions>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

// 金额转中文大写
function toChineseCurrency(num: number): string {
  const fraction = ['角', '分']
  const digit = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖']
  const unit = [
    ['元', '万', '亿'],
    ['', '拾', '佰', '仟'],
  ]

  const s = num.toFixed(2)
  let result = ''

  const [intPart, decPart] = s.split('.')
  const intLen = intPart.length

  for (let i = 0; i < intLen; i++) {
    const n = parseInt(intPart[i], 10)
    if (n !== 0) {
      result += digit[n] + unit[1][intLen - i - 1]
    } else if (i === intLen - 1) {
      result += '元'
    }
  }

  if (decPart) {
    for (let i = 0; i < 2; i++) {
      const n = parseInt(decPart[i], 10)
      if (n !== 0) {
        result += digit[n] + fraction[i]
      }
    }
  }

  return result || '零元'
}

export default UserFee