import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Spin } from 'antd'
import { CheckOutlined, StarOutlined, CrownOutlined, LockOutlined } from '@ant-design/icons'
import clsx from 'clsx'
import { getCourseDetailAPI, getModulesAPI, getLessonsAPI } from './courseService'
import styles from './CourseDetailPage.module.css'

const MOCK_COURSE = {
  id: 1,
  title: 'English Basics',
  description: 'Learn the fundamentals of English: alphabet, numbers, and simple phrases.',
}

const MOCK_MODULES = [
  { id: 1, title: 'Unit 1: Greetings', order: 1 },
  { id: 2, title: 'Unit 2: Numbers', order: 2 },
]

const MOCK_LESSONS = [
  { id: 1, title: 'Hello', status: 'completed', order: 1 },
  { id: 2, title: 'Goodbye', status: 'current', order: 2 },
  { id: 3, title: 'Please & Thanks', status: 'locked', order: 3 },
]

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
  const [modules, setModules] = useState([])
  const [modulesWithLessons, setModulesWithLessons] = useState([])

  useEffect(() => {
    async function fetchData() {
      if (!id) return
      setLoading(true)
      try {
        const [courseRes, modulesRes] = await Promise.allSettled([
          getCourseDetailAPI(id),
          getModulesAPI(id),
        ])

        const courseData = courseRes.status === 'fulfilled'
          ? (courseRes.value?.data ?? courseRes.value)
          : MOCK_COURSE
        setCourse(courseData)

        const modList = modulesRes.status === 'fulfilled'
          ? (modulesRes.value?.data ?? modulesRes.value?.results ?? modulesRes.value)
          : MOCK_MODULES
        const modArray = Array.isArray(modList) ? modList : MOCK_MODULES

        const withLessons = await Promise.all(
          modArray.map(async (mod, idx) => {
            try {
              const lessonsRes = await getLessonsAPI(mod.id)
              const lessons = lessonsRes?.data ?? lessonsRes?.results ?? lessonsRes ?? MOCK_LESSONS
              return {
                ...mod,
                lessons: Array.isArray(lessons) ? lessons : MOCK_LESSONS.map((l, i) => ({ ...l, id: `${mod.id}-${i}` })),
              }
            } catch {
              return { ...mod, lessons: MOCK_LESSONS.map((l, i) => ({ ...l, id: `${mod.id}-${i}` })) }
            }
          })
        )
        setModulesWithLessons(withLessons)
      } catch (err) {
        setCourse(MOCK_COURSE)
        setModulesWithLessons(MOCK_MODULES.map((m) => ({ ...m, lessons: MOCK_LESSONS })))
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
    if (lesson.status === 'locked') return
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
