import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button, Spin, message } from 'antd'
import { SyncOutlined } from '@ant-design/icons'
import { getReviewHistoryAPI } from './reviewService'
import { formatDate, formatDateTime } from '../../utils/formatDate'
import { formatXP } from '../../utils/formatXP'
import { getApiErrorMessage } from '../../utils/apiError'
import styles from './ReviewHistory.module.css'

export function ReviewHistory() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)

  async function loadHistory() {
    setLoading(true)
    try {
      const data = await getReviewHistoryAPI()
      setSessions(Array.isArray(data) ? data : data?.results || [])
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
                  {formatDateTime(session.created_at ?? session.started_at ?? session.date)}
                </div>
                <div className={styles.meta}>
                  {session.cards_reviewed ?? session.reviewed_count ?? 0} cards reviewed
                </div>
              </div>
              <div className={styles.right}>
                <div className={styles.score}>
                  +{formatXP(session.xp_earned ?? session.xp ?? 0)} XP
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
