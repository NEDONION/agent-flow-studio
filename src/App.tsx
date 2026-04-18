import { FormEvent, useState } from 'react'
import './App.css'

type ChatRole = 'user' | 'assistant'

interface ChatItem {
  role: ChatRole
  content: string
}

const DEFAULT_SYSTEM_PROMPT = '你是一个简洁、可靠的中文 AI 助手。'

function App() {
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_SYSTEM_PROMPT)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatItem[]>([])
  const [loading, setLoading] = useState(false)
  const [model, setModel] = useState('')
  const [error, setError] = useState('')

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
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

  return (
    <div className="chat-page">
      <header className="header">
        <h1>Agent Flow Studio</h1>
        <p>SiliconFlow 对话调试</p>
        {model ? <small>当前模型: {model}</small> : null}
      </header>

      <section className="messages">
        {messages.length === 0 ? (
          <div className="empty">输入问题后开始对话。</div>
        ) : (
          messages.map((item, index) => (
            <div key={`${item.role}-${index}`} className={`message ${item.role}`}>
              <div className="message-role">{item.role === 'user' ? '你' : '助手'}</div>
              <div className="message-content">{item.content}</div>
            </div>
          ))
        )}
      </section>

      <form className="composer" onSubmit={onSubmit}>
        <label>
          System Prompt
          <textarea
            rows={2}
            value={systemPrompt}
            onChange={(event) => setSystemPrompt(event.target.value)}
          />
        </label>
        <label>
          用户输入
          <textarea
            rows={4}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="请输入你要发送给模型的问题"
          />
        </label>
        <div className="actions">
          <button type="submit" disabled={loading || !input.trim()}>
            {loading ? '请求中...' : '发送'}
          </button>
          <button type="button" className="secondary" onClick={() => setMessages([])} disabled={loading}>
            清空会话
          </button>
        </div>
      </form>

      {error ? (
        <div className="error">
          {error}
        </div>
      ) : null}
    </div>
  )
}

export default App
