import { useState, useRef, useEffect } from 'react'
import { Input, Button, Spin } from 'antd'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  SendOutlined,
  RobotOutlined,
  UserOutlined,
  ClearOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'
import './index.less'

const { TextArea } = Input

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface AIMessage {
  role: 'user' | 'assistant'
  content: string
}

interface AIChatProps {
  quickActions?: { key: string; label: string; question: string }[]
  title?: string
  placeholder?: string
}

const AIChat = ({
  quickActions = [],
  title = 'AI 智能助手',
  placeholder = '输入您的问题...',
}: AIChatProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  // 初始化欢迎消息
  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: `您好！我是 ${title}，基于智谱 AI 大模型和租户管理系统知识库。\n\n我可以帮您解答关于费用、合同、维修、房间等方面的业务问题。请问有什么可以帮您的？`,
        timestamp: new Date(),
      },
    ])
  }, [title])

  // 自动滚动到底部
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages, streamingContent])

  // 调用后端 AI 接口
  const callBackendAI = async (chatMessages: AIMessage[]): Promise<string> => {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('未登录，请先登录')
    }

    const response = await fetch('/api/ai/chat?stream=true', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ messages: chatMessages }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `请求失败: ${response.status}`)
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('无法读取响应流')
    }

    const decoder = new TextDecoder()
    let fullContent = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      const lines = chunk.split('\n').filter(line => line.trim() !== '')

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          if (data === '[DONE]') continue

          try {
            const parsed = JSON.parse(data)
            const delta = parsed.choices?.[0]?.delta?.content
            if (delta) {
              fullContent += delta
              setStreamingContent(fullContent)
            }
          } catch {
            // 忽略解析错误
          }
        }
      }
    }

    return fullContent
  }

  // 发送消息
  const handleSend = async (content?: string) => {
    const text = content || inputValue.trim()
    if (!text) return

    // 添加用户消息
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMessage])
    if (!content) setInputValue('')
    setLoading(true)
    setStreamingContent('')

    // 准备发送的消息历史（不包含系统提示，后端根据 JWT role 添加）
    const chatMessages: AIMessage[] = messages
      .filter(m => m.id !== 'welcome' || messages.length > 1)
      .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }))
      .concat([{ role: 'user' as const, content: text }])

    // 添加 AI 消息占位
    const aiMessageId = (Date.now() + 1).toString()
    setMessages(prev => [
      ...prev,
      { id: aiMessageId, role: 'assistant', content: '', timestamp: new Date() },
    ])

    try {
      let fullContent = ''

      await callBackendAI(chatMessages).then(result => {
        fullContent = result
      }).catch(err => {
        throw err
      })

      // 更新最终消息
      setMessages(prev =>
        prev.map(m =>
          m.id === aiMessageId ? { ...m, content: fullContent || '（AI 服务未返回有效响应）' } : m
        )
      )
    } catch (error) {
      const err = error as Error
      const errorMsg = err.message || 'AI 服务暂时不可用，请稍后重试'

      // 更新错误消息
      setMessages(prev =>
        prev.map(m =>
          m.id === aiMessageId
            ? { ...m, content: `⚠️ ${errorMsg}` }
            : m
        )
      )
    } finally {
      setLoading(false)
      setStreamingContent('')
    }
  }

  // 清空聊天
  const handleClear = () => {
    setMessages([])
    setInputValue('')
  }

  // 格式化时间
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="ai-chat">
      {/* 头部 */}
      <div className="ai-chat-header">
        <div className="ai-chat-title">
          <ThunderboltOutlined style={{ color: '#1890ff', marginRight: 8 }} />
          <span>{title}</span>
        </div>
        <div className="ai-chat-actions">
          <Button
            type="text"
            icon={<ClearOutlined />}
            onClick={handleClear}
            disabled={messages.length === 0}
            title="清空聊天"
          />
        </div>
      </div>

      {/* 消息列表 */}
      <div className="ai-chat-messages" ref={chatContainerRef}>
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`ai-chat-message ${msg.role === 'user' ? 'user' : 'assistant'}`}
          >
            <div className="message-avatar">
              {msg.role === 'user' ? <UserOutlined /> : <RobotOutlined />}
            </div>
            <div className="message-content">
              <div className={`message-bubble ${msg.role === 'assistant' ? 'markdown-body' : ''}`}>
                {msg.role === 'assistant' ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                ) : (
                  msg.content
                )}
              </div>
              <div className="message-time">{formatTime(msg.timestamp)}</div>
            </div>
          </div>
        ))}

        {/* 加载指示器 */}
        {loading && streamingContent === '' && (
          <div className="ai-chat-message assistant">
            <div className="message-avatar">
              <RobotOutlined />
            </div>
            <div className="message-content">
              <div className="message-bubble loading">
                <Spin size="small" /> 正在思考...
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 快捷问题 */}
      {quickActions.length > 0 && messages.length <= 2 && (
        <div className="ai-chat-quick-actions">
          <div className="quick-actions-title">快捷问题</div>
          <div className="quick-actions-list">
            {quickActions.map(action => (
              <Button
                key={action.key}
                size="small"
                onClick={() => handleSend(action.question)}
                disabled={loading}
              >
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* 输入区域 */}
      <div className="ai-chat-input">
        <TextArea
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onPressEnter={e => {
            if (!e.shiftKey) {
              e.preventDefault()
              handleSend()
            }
          }}
          placeholder={placeholder}
          autoSize={{ minRows: 1, maxRows: 4 }}
          disabled={loading}
        />
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={() => handleSend()}
          loading={loading}
          disabled={!inputValue.trim()}
        >
          发送
        </Button>
      </div>
    </div>
  )
}

export default AIChat