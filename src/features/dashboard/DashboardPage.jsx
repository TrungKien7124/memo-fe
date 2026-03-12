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

const MOCK_ACTIVITIES = [
  { type: 'lesson', text: 'Completed "Greetings" lesson', time: '2 hours ago' },
  { type: 'flashcard', text: 'Reviewed 15 flashcards', time: '5 hours ago' },
  { type: 'streak', text: 'Maintained 3-day streak!', time: 'Yesterday' },
]

export function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [xpSummary, setXpSummary] = useState(null)
  const [dueCount, setDueCount] = useState(0)
  const [recentCourses, setRecentCourses] = useState([])
  const [activities, setActivities] = useState(MOCK_ACTIVITIES)
  const navigate = useNavigate()

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)
      try {
        const [xpRes, dueRes, coursesRes] = await Promise.allSettled([
          getXPSummaryAPI(),
          getDueCardsAPI(),
          getCoursesAPI(),
        ])

        if (xpRes.status === 'fulfilled') {
          const data = xpRes.value?.data ?? xpRes.value
          setXpSummary({
            today_xp: data.today_xp ?? data.todayXp ?? 0,
            daily_goal: data.daily_goal ?? data.dailyGoal ?? 50,
            streak: data.streak ?? 0,
            last_seven_days: data.last_seven_days ?? data.lastSevenDays ?? [],
          })
        } else {
          setXpSummary({
            today_xp: 25,
            daily_goal: 50,
            streak: 3,
            last_seven_days: [true, true, false, true, true, true, true],
          })
        }

        if (dueRes.status === 'fulfilled') {
          const data = dueRes.value?.data ?? dueRes.value
          const count = Array.isArray(data) ? data.length : data?.count ?? data?.results?.length ?? 0
          setDueCount(count)
        } else {
          setDueCount(12)
        }

        if (coursesRes.status === 'fulfilled') {
          const data = coursesRes.value?.data ?? coursesRes.value?.results ?? coursesRes.value
          const list = Array.isArray(data) ? data : []
          setRecentCourses(list.slice(0, 6))
        } else {
          setRecentCourses([
            { id: 1, title: 'English Basics', description: 'Start here', lesson_count: 12 },
            { id: 2, title: 'Daily Conversations', description: 'Everyday phrases', lesson_count: 24 },
          ])
        }
      } catch (err) {
        setError(err?.message || 'Failed to load dashboard')
        setXpSummary({ today_xp: 25, daily_goal: 50, streak: 3, last_seven_days: [true, true, false, true, true, true, true] })
        setDueCount(12)
        setRecentCourses([
          { id: 1, title: 'English Basics', description: 'Start here', lesson_count: 12 },
          { id: 2, title: 'Daily Conversations', description: 'Everyday phrases', lesson_count: 24 },
        ])
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

  const xp = xpSummary?.today_xp ?? 0
  const goal = xpSummary?.daily_goal ?? 50
  const streak = xpSummary?.streak ?? 0
  const lastSeven = xpSummary?.last_seven_days ?? []

  return (
    <div className={styles.page}>
      <div className={styles.feedWrapper}>
        <h1 className={styles.feedTitle}>Learn</h1>
        {error && <div className={styles.errorBanner}>{error}</div>}
        <div className={styles.feedCard}>
          <div className={styles.welcomeSection}>
            <p className={styles.welcomeText}>Welcome back! Ready to learn?</p>
            <div className={styles.statsRow}>
              <div className={clsx(styles.statItem, styles.statItemXp)}>
                <TrophyOutlined /> {xp} XP today
              </div>
              <div className={clsx(styles.statItem, styles.statItemDue)}>
                <SyncOutlined /> {dueCount} cards due
              </div>
            </div>
          </div>
          <h3 className={styles.sectionTitle}>Continue Learning</h3>
          <div className={styles.courseGrid}>
            {recentCourses.map((course) => (
              <div
                key={course.id}
                className={styles.courseCard}
                onClick={() => navigate(`/courses/${course.id}`)}
              >
                <div className={styles.courseCardImage}>📖</div>
                <p className={styles.courseCardTitle}>{course.title}</p>
                <p className={styles.courseCardMeta}>
                  {course.lesson_count ?? course.lessonCount ?? 0} lessons
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <aside className={styles.stickyWrapper}>
        <DailyGoalWidget currentXP={xp} targetXP={goal} />
        <StreakWidget streak={streak} lastSevenDays={lastSeven} />
        <RecentActivity activities={activities} />
      </aside>
    </div>
  )
}
