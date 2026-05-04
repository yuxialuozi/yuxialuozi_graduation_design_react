import { Row, Col, Card } from 'antd'
import AIChat from '@/components/AIChat'
import './index.less'

// 管理员端快捷问题
const adminQuickActions = [
  { key: 'analysis', label: '数据分析', question: '分析一下本月各项费用收入情况' },
  { key: 'contract', label: '合同分析', question: '哪些合同即将到期？需要续签提醒吗？' },
  { key: 'maintenance', label: '维修建议', question: '根据当前维修工单，给出处理优先级建议' },
  { key: 'trend', label: '趋势预测', question: '预测一下下个月的收入趋势' },
  { key: 'risk', label: '风险提示', question: '有哪些潜在的租户流失风险需要注意？' },
  { key: 'recommend', label: '优化建议', question: '基于当前运营数据，有哪些可以优化的地方？' },
]

const AI = () => {
  return (
    <div className="ai-page">
      <Row gutter={24}>
        <Col xs={24} lg={16}>
          <Card title="AI 智能助手" className="ai-chat-card">
            <AIChat
              quickActions={adminQuickActions}
              title="管理端 AI 助手"
              placeholder="输入关于租户管理的问题..."
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="AI 功能说明" className="ai-info-card">
            <div className="ai-feature">
              <h4>数据分析</h4>
              <p>基于历史数据，AI 可以帮您分析收入趋势、租户活跃度、费用构成等</p>
            </div>
            <div className="ai-feature">
              <h4>合同管理</h4>
              <p>智能分析即将到期的合同，提供续签建议和风险提示</p>
            </div>
            <div className="ai-feature">
              <h4>维修建议</h4>
              <p>根据工单数据，AI 可以给出处理优先级和维护计划建议</p>
            </div>
            <div className="ai-feature">
              <h4>趋势预测</h4>
              <p>基于机器学习模型，预测未来几个月的收入和需求趋势</p>
            </div>
            <div className="ai-feature">
              <h4>运营优化</h4>
              <p>发现潜在问题，提供租金定价、房间利用率等方面的优化建议</p>
            </div>
          </Card>

          <Card title="使用提示" className="ai-tips-card">
            <ul>
              <li>可以询问任意关于当前系统数据的问题</li>
              <li>试试点击"快捷问题"快速开始</li>
              <li>AI 会基于系统中的真实数据给出分析</li>
              <li>详细的提问可以获得更准确的回答</li>
            </ul>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default AI