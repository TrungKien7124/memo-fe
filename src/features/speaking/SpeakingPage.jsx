import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Spin, message } from 'antd'
import { createSpeakingSessionAPI } from './speakingService'
import styles from './SpeakingPage.module.css'

const TOPICS = [
  {
    id: 'daily',
    title: 'Daily Conversation',
    description: 'Practice everyday phrases like greetings, shopping, and small talk.',
    icon: '🗣️',
  },
  {
    id: 'travel',
    title: 'Travel & Tourism',
    description: 'Learn useful phrases for airports, hotels, and asking for directions.',
    icon: '✈️',
  },
  {
    id: 'work',
    title: 'Work & Business',
    description: 'Professional vocabulary for meetings, emails, and presentations.',
    icon: '💼',
  },
  {
    id: 'food',
    title: 'Food & Restaurants',
    description: 'Order food, discuss recipes, and talk about your favorite cuisines.',
    icon: '🍽️',
  },
  {
    id: 'hobby',
    title: 'Hobbies & Free Time',
    description: 'Discuss sports, movies, music, and other leisure activities.',
    icon: '🎮',
  },
]

export function SpeakingPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  async function handleTopicClick(topic) {
    setLoading(true)
    try {
      const session = await createSpeakingSessionAPI({ topic: topic.id, title: topic.title })
      const sessionId = session?.id ?? session
      navigate(`/speaking/${sessionId}`, { state: { topic: topic.title } })
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to create session'
      message.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Speaking Practice</h1>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
          <Spin size="large" />
        </div>
      ) : (
        <div className={styles.grid}>
          {TOPICS.map((topic) => (
            <button
              key={topic.id}
              type="button"
              className={styles.card}
              onClick={() => handleTopicClick(topic)}
              disabled={loading}
            >
              <span className={styles.cardIcon}>{topic.icon}</span>
              <h3 className={styles.cardTitle}>{topic.title}</h3>
              <p className={styles.cardDesc}>{topic.description}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
