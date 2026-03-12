import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { Button, message } from 'antd'
import { CloseOutlined, SendOutlined, AudioOutlined } from '@ant-design/icons'
import { ChatBubble } from './ChatBubble'
import { endSpeakingSessionAPI } from './speakingService'
import styles from './SpeakingSession.module.css'

function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function SpeakingSession() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [topic] = useState(location.state?.topic ?? 'Speaking')
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [timer, setTimer] = useState(0)
  const [showSummary, setShowSummary] = useState(false)
  const chatRef = useRef(null)

  useEffect(() => {
    const interval = setInterval(() => setTimer((t) => t + 1), 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  async function handleEndSession() {
    try {
      await endSpeakingSessionAPI(sessionId)
    } catch {
      // ignore
    }
    setShowSummary(true)
  }

  function handleSend() {
    if (!input.trim()) return
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: input.trim(), timestamp: formatTime(timer) },
      { role: 'assistant', content: "I'm a placeholder response. Connect to your speaking API for real replies.", timestamp: formatTime(timer) },
    ])
    setInput('')
  }

  if (showSummary) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <button className={styles.exitBtn} onClick={() => navigate('/speaking')} aria-label="Exit">
            <CloseOutlined />
          </button>
        </div>
        <div className={styles.summary}>
          <h2 className={styles.summaryTitle}>Session Ended</h2>
          <p className={styles.summaryText}>Great practice! You spent {formatTime(timer)} in this session.</p>
          <Button type="primary" onClick={() => navigate('/speaking')}>
            Back to Topics
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.exitBtn} onClick={() => navigate('/speaking')} aria-label="Exit">
          <CloseOutlined />
        </button>
        <span className={styles.topic}>{topic}</span>
        <span className={styles.timer}>{formatTime(timer)}</span>
      </div>

      <div ref={chatRef} className={styles.chatArea}>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--color-text-secondary)', padding: 48 }}>
            <p>Start the conversation! Type a message or use the microphone.</p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <ChatBubble key={i} role={msg.role} content={msg.content} timestamp={msg.timestamp} />
          ))
        )}
      </div>

      <div className={styles.inputArea}>
        <input
          className={styles.input}
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button type="button" className={styles.micBtn} title="Record audio">
          <AudioOutlined />
        </button>
        <Button type="primary" icon={<SendOutlined />} onClick={handleSend} className={styles.sendBtn}>
          Send
        </Button>
      </div>

      <div style={{ padding: '0 var(--space-6) var(--space-4)' }}>
        <button type="button" className={styles.endBtn} onClick={handleEndSession}>
          End Session
        </button>
      </div>
    </div>
  )
}
