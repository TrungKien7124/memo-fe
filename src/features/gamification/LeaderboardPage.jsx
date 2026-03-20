import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Button, Spin, message } from 'antd'
import clsx from 'clsx'
import { getLeaderboardAPI, getProfileStatsAPI } from './gamificationService'
import { formatXP } from '../../utils/formatXP'
import { getApiErrorMessage } from '../../utils/apiError'
import styles from './LeaderboardPage.module.css'

function getInitials(name) {
  if (!name) return '?'
  return name
    .split(/\s+/)
    .map((s) => s[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function LeaderboardPage() {
  const currentUser = useSelector((state) => state.auth?.user)
  const [leaderboard, setLeaderboard] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)

  async function loadData() {
    setLoading(true)
    setLoadError(null)
    try {
      const [boardData, statsData] = await Promise.all([
        getLeaderboardAPI(),
        getProfileStatsAPI(),
      ])
      setLeaderboard(boardData)
      setStats(statsData)
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Failed to load leaderboard')
      setLoadError(msg)
      message.error(msg)
      setLeaderboard([])
      setStats(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
        <Spin size="large" />
      </div>
    )
  }

  if (loadError) {
    return (
      <div className={styles.page}>
        <div style={{ gridColumn: '1 / -1' }}>
          <div className={styles.loadErrorBanner} role="alert">
            <p className={styles.loadErrorText}>{loadError}</p>
            <Button type="primary" onClick={loadData} className={styles.retryBtn}>
              Retry
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const userStats = stats
  const totalXP = userStats?.totalXp ?? null
  const streak = userStats?.streak ?? null

  return (
    <div className={styles.page}>
      <div className={styles.feed}>
        <h1 className={styles.title}>Leaderboard</h1>
        {leaderboard.map((entry, index) => {
          const rank = index + 1
          const name = entry.username ?? entry.email ?? 'Anonymous'
          const xp = entry.xp ?? entry.totalXp ?? 0
          const isCurrentUser =
            currentUser &&
            (String(entry.id) === String(currentUser.id) || (entry.email && entry.email === currentUser.email))
          return (
            <div
              key={entry.id ?? index}
              className={clsx(styles.row, isCurrentUser && styles.rowCurrent)}
            >
              <span className={clsx(styles.rank, rank === 1 && styles.rank1, rank === 2 && styles.rank2, rank === 3 && styles.rank3)}>
                #{rank}
              </span>
              <div className={styles.avatar}>{getInitials(name)}</div>
              <span className={styles.name}>{name}</span>
              <span className={styles.xp}>{formatXP(xp)} XP</span>
            </div>
          )
        })}
        {leaderboard.length === 0 && (
          <div style={{ textAlign: 'center', padding: 48, color: 'var(--color-text-secondary)' }}>
            No leaderboard data yet. Keep learning!
          </div>
        )}
      </div>

      <aside className={styles.sidebar}>
        <div className={styles.sidebarCard}>
          <h3 className={styles.sidebarTitle}>Your Stats</h3>
          <div className={styles.userStats}>
            <div className={styles.statRow}>
              <span className={styles.statLabel}>Total XP</span>
              <span className={clsx(styles.statValue, styles.xpValue)}>
                {totalXP == null ? 'XP unavailable' : formatXP(totalXP)}
              </span>
            </div>
            <div className={styles.statRow}>
              <span className={styles.statLabel}>Streak</span>
              <span className={styles.statValue}>
                {streak == null ? 'Streak unavailable' : `${streak} days`}
              </span>
            </div>
          </div>
        </div>
        <div className={styles.sidebarCard}>
          <h3 className={styles.sidebarTitle}>Quests</h3>
          <p className={styles.quests}>Complete reviews and lessons to earn more XP and complete daily quests!</p>
        </div>
      </aside>
    </div>
  )
}
