import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Spin } from 'antd'
import { CheckOutlined, StarOutlined, CrownOutlined, LockOutlined } from '@ant-design/icons'
import clsx from 'clsx'
import { getCourseDetailAPI, getModulesAPI, getLessonsAPI } from './courseService'
import styles from './CourseDetailPage.module.css'

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
  const [errorMessages, setErrorMessages] = useState([])
  const [course, setCourse] = useState(null)
  const [modulesWithLessons, setModulesWithLessons] = useState([])

  useEffect(() => {
    async function fetchData() {
      if (!id) return
      setLoading(true)
      setErrorMessages([])
      try {
        const [courseRes, modulesRes] = await Promise.all([
          getCourseDetailAPI(id),
          getModulesAPI(id),
        ])
        setCourse(courseRes)
        const nextErrors = []

        const withLessons = await Promise.all(
          modulesRes.map(async (mod) => {
            try {
              const lessons = await getLessonsAPI(mod.id)
              return {
                ...mod,
                lessons,
              }
            } catch {
              nextErrors.push(`Lessons are unavailable for module "${mod.title}".`)
              return {
                ...mod,
                lessons: [],
                lessons_error: 'Lessons are unavailable for this module.',
              }
            }
          })
        )
        setModulesWithLessons(withLessons)
        setErrorMessages(nextErrors)
      } catch (err) {
        setCourse(null)
        setModulesWithLessons([])
        setErrorMessages([err?.message || 'Failed to load course details.'])
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
    return <p style={{ color: 'var(--color-error)', padding: 'var(--space-6)' }}>{errorMessages[0] || 'Course not found.'}</p>
  }

  function handleLessonClick(lesson, mod) {
    const isAllowedLesson = lesson.status === 'current' || lesson.status === 'completed'
    if (!isAllowedLesson || mod?.is_unlocked === false) return
    navigate(`/courses/${id}/lessons/${lesson.id}`)
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>{course.title}</h1>
        <p className={styles.description}>{course.description || 'Start your learning journey.'}</p>
      </header>
      {errorMessages.length > 0 && (
        <p style={{ color: 'var(--color-error)', marginBottom: 'var(--space-4)' }}>
          {errorMessages.join(' ')}
        </p>
      )}

      {modulesWithLessons.map((mod) => (
        <section key={mod.id} className={styles.moduleSection}>
          <div className={styles.moduleBanner}>{mod.title}</div>
          {mod.lessons_error && (
            <p style={{ color: 'var(--color-error)', marginBottom: 'var(--space-4)' }}>
              {mod.lessons_error}
            </p>
          )}
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
