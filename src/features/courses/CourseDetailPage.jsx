import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Spin } from 'antd'
import { CheckOutlined, StarOutlined, CrownOutlined, LockOutlined } from '@ant-design/icons'
import clsx from 'clsx'
import { getCourseDetailAPI, getModulesAPI, getLessonsAPI } from './courseService'
import styles from './CourseDetailPage.module.css'

function normalizeListResponse(payload) {
  if (Array.isArray(payload))
    return payload
  if (Array.isArray(payload?.data))
    return payload.data
  if (Array.isArray(payload?.results))
    return payload.results
  if (Array.isArray(payload?.data?.results))
    return payload.data.results
  return []
}

function normalizeDetailResponse(payload) {
  if (payload?.data && !Array.isArray(payload.data))
    return payload.data
  return payload
}

function withFallbackLessonStatus(lessons) {
  let hasCurrent = false

  return lessons.map((lesson, index) => {
    if (lesson.status === 'completed')
      return lesson
    if (lesson.status === 'current') {
      hasCurrent = true
      return lesson
    }
    if (lesson.status === 'locked')
      return lesson

    if (!hasCurrent) {
      hasCurrent = true
      return { ...lesson, status: 'current' }
    }
    return { ...lesson, status: index === 0 ? 'current' : 'locked' }
  })
}

function LessonIcon({ status }) {
  if (status === 'completed') return <CheckOutlined />
  if (status === 'current') return <StarOutlined />
  if (status === 'locked') return <LockOutlined />
  return <CrownOutlined />
}

export function CourseDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [course, setCourse] = useState(null)
  const [modulesWithLessons, setModulesWithLessons] = useState([])

  useEffect(() => {
    async function fetchData() {
      if (!id) return
      setLoading(true)
      try {
        const [courseRes, modulesRes] = await Promise.all([
          getCourseDetailAPI(id),
          getModulesAPI(id),
        ])
        const courseData = normalizeDetailResponse(courseRes)
        setCourse(courseData)

        const modArray = normalizeListResponse(modulesRes)

        const withLessons = await Promise.all(
          modArray.map(async (mod) => {
            try {
              const lessonsRes = await getLessonsAPI(mod.id)
              const lessons = normalizeListResponse(lessonsRes)
              return {
                ...mod,
                lessons: withFallbackLessonStatus(lessons),
              }
            } catch {
              return { ...mod, lessons: [] }
            }
          })
        )
        setModulesWithLessons(withLessons)
      } catch {
        setCourse(null)
        setModulesWithLessons([])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400, padding: 'var(--space-6)' }}>
        <Spin size="large" />
      </div>
    )
  }

  if (!course) {
    return <p>Course not found.</p>
  }

  function handleLessonClick(lesson, mod) {
    if (lesson.status === 'locked' || mod?.is_unlocked === false) return
    navigate(`/courses/${id}/lessons/${lesson.id}`)
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>{course.title}</h1>
        <p className={styles.description}>{course.description || 'Start your learning journey.'}</p>
      </header>

      {modulesWithLessons.map((mod, modIdx) => (
        <section key={mod.id} className={styles.moduleSection}>
          <div className={styles.moduleBanner}>{mod.title}</div>
          <div className={styles.lessonsPath}>
            {(mod.lessons || []).map((lesson, idx) => (
              <div key={lesson.id}>
                {idx > 0 && (
                  <div className={clsx(styles.connector, idx % 2 === 1 && styles.connectorAlt)} />
                )}
                <div className={clsx(styles.lessonRow, idx % 2 === 1 && styles.lessonRowAlt)}>
                  <button
                    type="button"
                    className={clsx(
                      styles.lessonButton,
                      lesson.status === 'completed' && styles.lessonButtonCompleted,
                      lesson.status === 'current' && styles.lessonButtonCurrent,
                      lesson.status === 'locked' && styles.lessonButtonLocked
                    )}
                    onClick={() => handleLessonClick(lesson, mod)}
                  >
                    <LessonIcon status={lesson.status} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
