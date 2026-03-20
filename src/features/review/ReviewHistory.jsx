import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button, Spin, message } from 'antd'
import { SyncOutlined } from '@ant-design/icons'
import { getReviewHistoryAPI } from './reviewService'
import { formatDateTime } from '../../utils/formatDate'
import { formatXP } from '../../utils/formatXP'
import { getApiErrorMessage } from '../../utils/apiError'
import styles from './ReviewHistory.module.css'

export function ReviewHistory() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)

  async function loadHistory() {
    setLoading(true)
    try {
      const sessionsData = await getReviewHistoryAPI()
      setSessions(sessionsData)
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Failed to load history')
      message.error(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadHistory()
  }, [])

  return (
    <div className={styles.page}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 className={styles.title}>Review History</h1>
        <Link to="/review">
          <Button type="primary" icon={<SyncOutlined />} size="large">
            Start Review
          </Button>
        </Link>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
          <Spin size="large" />
        </div>
      ) : sessions.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>📊</div>
          <p className={styles.emptyText}>No review sessions yet</p>
          <Link to="/review">
            <Button type="primary" style={{ marginTop: 16 }}>Start Your First Review</Button>
          </Link>
        </div>
      ) : (
        <div className={styles.list}>
          {sessions.map((session) => (
            <div key={session.id} className={styles.card}>
              <div>
                <div className={styles.date}>
                  {formatDateTime(session.createdAt || session.startedAt)}
                </div>
                <div className={styles.meta}>
                  {typeof session.cardsReviewed === 'number' ? session.cardsReviewed : 'N/A'} cards reviewed
                </div>
              </div>
              <div className={styles.right}>
                <div className={styles.score}>
                  {typeof session.xpEarned === 'number' ? `+${formatXP(session.xpEarned)} XP` : 'N/A XP'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
