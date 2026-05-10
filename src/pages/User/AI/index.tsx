import { Row, Col, Card } from 'antd'
import AIChat from '@/components/AIChat'
import './index.less'

// 租户端快捷问题
const tenantQuickActions = [
  { key: 'fee', label: '费用说明', question: '我的账单是怎么计算的？' },
  { key: 'contract', label: '合同咨询', question: '我想了解一下我的合同条款' },
  { key: 'maintenance', label: '维修指引', question: '如何提交维修申请？' },
  { key: 'payment', label: '缴费方式', question: '我可以通过哪些方式缴纳费用？' },
  { key: 'renew', label: '续租咨询', question: '如果我想续租，需要提前多久申请？' },
  { key: 'policy', label: '政策了解', question: '租金调整一般是什么规则？' },
]

const UserAI = () => {
  return (
    <div className="user-ai-page">
      <div className="page-header">
        <h2>AI 助手</h2>
        <p>智能解答您的租房相关问题</p>
      </div>

      <Row gutter={24}>
        <Col xs={24} lg={16}>
          <Card
            bordered={false}
            className="ai-chat-card"
            title="AI 助手"
            style={{ display: 'flex', flexDirection: 'column' }}
            styles={{
              body: {
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                padding: 0,
                overflow: 'hidden',
              },
            }}
          >
            <AIChat
              quickActions={tenantQuickActions}
              title="租户端 AI 助手"
              placeholder="输入关于租房的问题..."
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card bordered={false} className="ai-info-card">
            <div className="ai-feature">
              <h4>费用咨询</h4>
              <p>解答关于租金、水电费、物业费等各项费用的计算和缴纳问题</p>
            </div>
            <div className="ai-feature">
              <h4>合同解读</h4>
              <p>帮助您理解租房合同的各项条款和您的权益</p>
            </div>
            <div className="ai-feature">
              <h4>维修指引</h4>
              <p>指导您如何提交维修申请，以及查询维修进度</p>
            </div>
            <div className="ai-feature">
              <h4>政策说明</h4>
              <p>解释租金调整、押金退还、续租等相关政策</p>
            </div>
            <div className="ai-feature">
              <h4>常见问题</h4>
              <p>回答租户日常遇到的各种问题和疑虑</p>
            </div>
          </Card>

          <Card bordered={false} className="ai-tips-card">
            <ul>
              <li>可以询问任意关于您的租房相关问题</li>
              <li>试试点击快捷问题快速获取答案</li>
              <li>AI 会用通俗易懂的语言为您解答</li>
              <li>如有紧急问题，建议直接联系物业</li>
            </ul>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default UserAI