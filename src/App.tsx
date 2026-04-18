import { KeyboardEvent, useState } from 'react'
import { Banner, Button, Card, Empty, Space, Tag, TextArea, Typography } from '@douyinfe/semi-ui'
import './App.css'

type ChatRole = 'user' | 'assistant'

interface ChatItem {
  role: ChatRole
  content: string
}

type PageView = 'home' | 'llmDebug'

const DEFAULT_SYSTEM_PROMPT = '你是一个简洁、可靠的中文 AI 助手。'

function App() {
  const [view, setView] = useState<PageView>('home')
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_SYSTEM_PROMPT)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatItem[]>([])
  const [loading, setLoading] = useState(false)
  const [model, setModel] = useState('')
  const [error, setError] = useState('')

  const sendMessage = async () => {
    if (loading) {
      return
    }

    const text = input.trim()
    if (!text) {
      return
    }

    setMessages((prev) => [...prev, { role: 'user', content: text }])
    setInput('')
    setError('')
    setLoading(true)

    try {
      const result = await window.llm.chat(text, systemPrompt.trim())
      setModel(result.model)
      setMessages((prev) => [...prev, { role: 'assistant', content: result.reply }])
    } catch (err) {
      setError(err instanceof Error ? err.message : '调用失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const onUserInputEnter = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (!event.shiftKey) {
      event.preventDefault()
      void sendMessage()
    }
  }

  if (view === 'home') {
    return (
      <div className="app-shell">
        <Typography.Title heading={3}>Agent Flow Studio</Typography.Title>
        <Typography.Text type="tertiary">选择功能入口</Typography.Text>
        <div className="entry-grid">
          <Card
            title="LLM 调试对话"
            shadows="hover"
            className="entry-card"
            footerLine={true}
            footer={
              <Button type="primary" onClick={() => setView('llmDebug')}>
                进入
              </Button>
            }
          >
            <Space spacing={8}>
              <Tag color="blue">SiliconFlow</Tag>
              <Tag color="green">Chat</Tag>
            </Space>
            <Typography.Paragraph className="entry-desc">
              用于测试对话模型输入输出，不走 rerank。
            </Typography.Paragraph>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <div className="chat-header">
        <Space spacing={8}>
          <Button onClick={() => setView('home')}>返回入口</Button>
          <Typography.Title heading={4}>LLM 调试对话</Typography.Title>
        </Space>
        {model ? <Tag color="blue">当前模型: {model}</Tag> : null}
      </div>

      <Card className="messages-card" bodyStyle={{ padding: 16 }}>
        {messages.length === 0 ? (
          <div className="empty-wrap">
            <Empty description="输入问题后开始对话" />
          </div>
        ) : (
          messages.map((item, index) => (
            <div key={`${item.role}-${index}`} className={`message ${item.role}`}>
              <div className="message-role">{item.role === 'user' ? '你' : '助手'}</div>
              <div className="message-content">{item.content}</div>
            </div>
          ))
        )}
      </Card>

      <Card bodyStyle={{ padding: 16 }}>
        <div className="composer">
          <Typography.Text strong={true}>System Prompt</Typography.Text>
          <TextArea
            rows={2}
            value={systemPrompt}
            onChange={setSystemPrompt}
            disabled={loading}
            showClear={true}
          />
          <Typography.Text strong={true}>用户输入</Typography.Text>
          <TextArea
            rows={4}
            value={input}
            onChange={setInput}
            onEnterPress={onUserInputEnter}
            disabled={loading}
            placeholder="请输入你要发送给模型的问题（Enter 发送，Shift+Enter 换行）"
            showClear={true}
          />
        </div>
        <Space className="actions" spacing={8}>
          <Button type="primary" onClick={() => void sendMessage()} loading={loading} disabled={!input.trim()}>
            发送
          </Button>
          <Button
            onClick={() => setMessages([])}
            disabled={loading}
          >
            清空会话
          </Button>
        </Space>
      </Card>

      {error ? (
        <Banner type="danger" description={error} closeIcon={null} />
      ) : null}
    </div>
  )
}

export default App
