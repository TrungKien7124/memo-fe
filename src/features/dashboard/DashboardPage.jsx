import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Spin } from 'antd'
import { TrophyOutlined, SyncOutlined } from '@ant-design/icons'
import clsx from 'clsx'
import { DailyGoalWidget } from './DailyGoalWidget'
import { StreakWidget } from './StreakWidget'
import { RecentActivity } from './RecentActivity'
import { getXPSummaryAPI, getDueCardsAPI } from './dashboardService'
import { getCoursesAPI } from '../courses/courseService'
import styles from './DashboardPage.module.css'

export function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [errorMessages, setErrorMessages] = useState([])
  const [xpSummary, setXpSummary] = useState(null)
  const [dueCount, setDueCount] = useState(null)
  const [recentCourses, setRecentCourses] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setErrorMessages([])
      try {
        const [xpRes, dueRes, coursesRes] = await Promise.allSettled([
          getXPSummaryAPI(),
          getDueCardsAPI(),
          getCoursesAPI(),
        ])
        const nextErrors = []

        if (xpRes.status === 'fulfilled') {
          setXpSummary(xpRes.value)
        } else {
          setXpSummary(null)
          nextErrors.push('XP summary is unavailable.')
        }

        if (dueRes.status === 'fulfilled') {
          const count = dueRes.value.length
          setDueCount(count)
        } else {
          setDueCount(null)
          nextErrors.push('Due cards count is unavailable.')
        }

        if (coursesRes.status === 'fulfilled') {
          setRecentCourses(coursesRes.value.slice(0, 6))
        } else {
          setRecentCourses([])
          nextErrors.push('Recent courses are unavailable.')
        }

        setErrorMessages(nextErrors)
      } catch (err) {
        setErrorMessages([err?.message || 'Failed to load dashboard.'])
        setXpSummary(null)
        setDueCount(null)
        setRecentCourses([])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className={styles.page} style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Spin size="large" />
      </div>
    )
  }

  const totalXp = xpSummary?.totalXp ?? null
  const goal = xpSummary?.dailyGoal ?? null
  const streak = xpSummary?.streak ?? null
  const lastSeven = xpSummary?.lastSevenDays ?? []

  return (
    <div className={styles.page}>
      <div className={styles.feedWrapper}>
        <h1 className={styles.feedTitle}>Learn</h1>
        {errorMessages.length > 0 && (
          <div className={styles.errorBanner}>
            {errorMessages.join(' ')}
          </div>
        )}
        <div className={styles.feedCard}>
          <div className={styles.welcomeSection}>
            <p className={styles.welcomeText}>Welcome back! Ready to learn?</p>
            <div className={styles.statsRow}>
              <div className={clsx(styles.statItem, styles.statItemXp)}>
                <TrophyOutlined /> {totalXp == null ? 'XP unavailable' : `${totalXp} total XP`}
              </div>
              <div className={clsx(styles.statItem, styles.statItemDue)}>
                <SyncOutlined /> {dueCount == null ? 'Due count unavailable' : `${dueCount} cards due`}
              </div>
            </div>
          </div>
          <h3 className={styles.sectionTitle}>Continue Learning</h3>
          <div className={styles.courseGrid}>
            {recentCourses.length === 0 ? (
              <p className={styles.welcomeText}>No course data is available right now.</p>
            ) : (
              recentCourses.map((course) => (
                <div
                  key={course.id}
                  className={styles.courseCard}
                  onClick={() => navigate(`/courses/${course.id}`)}
                >
                  <div className={styles.courseCardImage}>📖</div>
                  <p className={styles.courseCardTitle}>{course.title}</p>
                  <p className={styles.courseCardMeta}>
                    {course.lesson_count ?? 0} lessons
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <aside className={styles.stickyWrapper}>
        <DailyGoalWidget
          currentXP={xpSummary?.todayXp ?? null}
          targetXP={goal}
          isUnavailable={!xpSummary || goal == null}
        />
        <StreakWidget streak={streak} lastSevenDays={lastSeven} isUnavailable={!xpSummary || streak == null} />
        <RecentActivity activities={[]} isUnavailable />
      </aside>
    </div>
  )
}
