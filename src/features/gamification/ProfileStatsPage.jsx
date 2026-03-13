import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Spin, message } from 'antd'
import { getProfileStatsAPI } from './gamificationService'
import { formatXP } from '../../utils/formatXP'
import { getApiErrorMessage } from '../../utils/apiError'
import styles from './ProfileStatsPage.module.css'

function getInitials(user) {
  if (!user) return '?'
  const name = user.display_name ?? user.name ?? user.email ?? ''
  return name
    .split(/\s+/)
    .map((s) => s[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?'
}

export function ProfileStatsPage() {
  const currentUser = useSelector((state) => state.auth?.user)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  async function loadStats() {
    setLoading(true)
    try {
      const data = await getProfileStatsAPI()
      setStats(data)
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Failed to load stats')
      message.error(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
  }, [])

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
        <Spin size="large" />
      </div>
    )
  }

  const displayName = currentUser?.display_name ?? currentUser?.name ?? currentUser?.email ?? 'Learner'
  const totalXP = stats?.total_xp ?? stats?.xp ?? 0
  const streak = stats?.streak ?? stats?.current_streak ?? 0
  const cardsReviewed = stats?.cards_reviewed ?? stats?.reviews_count ?? 0
  const coursesEnrolled = stats?.courses_enrolled ?? stats?.courses_count ?? 0

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.avatar}>{getInitials(currentUser)}</div>
        <div className={styles.info}>
          <h1 className={styles.name}>{displayName}</h1>
          <p className={styles.role}>English Learner</p>
        </div>
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Stats</h2>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{formatXP(totalXP)}</div>
            <div className={styles.statLabel}>Total XP</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{streak}</div>
            <div className={styles.statLabel}>Day Streak</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{cardsReviewed}</div>
            <div className={styles.statLabel}>Cards Reviewed</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{coursesEnrolled}</div>
            <div className={styles.statLabel}>Courses Enrolled</div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>XP History</h2>
        <div className={styles.chartPlaceholder}>Chart placeholder – connect your analytics</div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Achievements</h2>
        <div className={styles.badgesPlaceholder}>
          <div className={styles.badge} title="First steps">🎯</div>
          <div className={styles.badge} title="Streak master">🔥</div>
          <div className={styles.badge} title="Vocabulary builder">📚</div>
          <div className={styles.badge} title="Coming soon">🏆</div>
        </div>
      </section>
    </div>
  )
}
