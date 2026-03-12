import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Spin } from 'antd'
import { ArrowLeftOutlined, CloseOutlined, PlayCircleOutlined } from '@ant-design/icons'
import clsx from 'clsx'
import { getLessonDetailAPI, markLessonProgressAPI } from './courseService'
import styles from './LessonPage.module.css'

const MOCK_LESSON = {
  id: 1,
  title: 'Greetings',
  description: 'Learn how to say hello and goodbye.',
}

export function LessonPage() {
  const { id, lessonId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [lesson, setLesson] = useState(null)
  const [completed, setCompleted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    async function fetchLesson() {
      if (!lessonId) return
      setLoading(true)
      try {
        const res = await getLessonDetailAPI(lessonId)
        const data = res?.data ?? res
        setLesson(data)
        setCompleted(data?.completed ?? data?.progress?.completed ?? false)
        setProgress(data?.progress?.percent ?? (data?.completed ? 100 : 0))
      } catch {
        setLesson({ ...MOCK_LESSON, id: lessonId })
        setCompleted(false)
        setProgress(0)
      } finally {
        setLoading(false)
      }
    }
    fetchLesson()
  }, [lessonId])

  function handleBack() {
    navigate(`/courses/${id}`)
  }

  function handleClose() {
    navigate('/courses')
  }

  async function handleMarkComplete() {
    setSubmitting(true)
    try {
      await markLessonProgressAPI(lessonId, { completed: true, score: 100 })
      setCompleted(true)
      setProgress(100)
    } catch {
      setCompleted(true)
      setProgress(100)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className={styles.page} style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button type="button" className={styles.backBtn} onClick={handleBack} aria-label="Back">
          <ArrowLeftOutlined />
        </button>
        <div className={styles.progressWrapper}>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <button type="button" className={styles.closeBtn} onClick={handleClose} aria-label="Close">
          <CloseOutlined />
        </button>
      </header>

      <main className={styles.content}>
        <div className={styles.videoPlaceholder}>
          <div className={styles.playIcon}>
            <PlayCircleOutlined />
          </div>
        </div>
        <h2 className={styles.lessonTitle}>{lesson?.title ?? 'Lesson'}</h2>
      </main>

      <footer
        className={clsx(
          styles.footer,
          completed ? styles.footerComplete : styles.footerIncomplete
        )}
      >
        <button
          type="button"
          className={styles.completeBtn}
          onClick={handleMarkComplete}
          disabled={completed || submitting}
        >
          {completed ? 'Completed!' : submitting ? 'Saving...' : 'Mark Complete'}
        </button>
      </footer>
    </div>
  )
}
