import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Alert, Card, Radio, Space, Spin, Typography } from 'antd'
import { ArrowLeftOutlined, CloseOutlined, PlayCircleOutlined } from '@ant-design/icons'
import clsx from 'clsx'
import { getLessonDetailAPI, markLessonProgressAPI } from './courseService'
import styles from './LessonPage.module.css'

const { Paragraph, Text } = Typography

function normalizeDetailResponse(payload) {
  if (payload?.data && !Array.isArray(payload.data))
    return payload.data
  return payload
}

function normalizeQuizQuestions(lesson) {
  if (!Array.isArray(lesson?.quiz_questions))
    return []
  return lesson.quiz_questions
}

export function LessonPage() {
  const { id, lessonId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [lesson, setLesson] = useState(null)
  const [completed, setCompleted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState([])
  const [quizResult, setQuizResult] = useState(null)

  useEffect(() => {
    async function fetchLesson() {
      if (!lessonId) return
      setLoading(true)
      try {
        const res = await getLessonDetailAPI(lessonId)
        const data = normalizeDetailResponse(res)
        setLesson(data)
        setCompleted(data?.completed ?? data?.progress?.completed ?? false)
        setProgress(data?.progress?.percent ?? (data?.completed ? 100 : 0))
      } catch {
        setLesson(null)
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
    if (!lesson) return

    setSubmitting(true)
    try {
      if (lesson.lesson_type === 'quiz') {
        const response = await markLessonProgressAPI(lessonId, { selected_answers: selectedAnswers })
        const parsed = normalizeDetailResponse(response)
        const result = response?.quiz_result || parsed?.quiz_result || null
        setQuizResult(result)
        const isPassed = Boolean(result?.passed)
        setCompleted(isPassed)
        setProgress(isPassed ? 100 : 0)
        return
      }

      if (lesson.lesson_type === 'text') {
        await markLessonProgressAPI(lessonId, { completed: true })
        setCompleted(true)
        setProgress(100)
        return
      }

      const watchedSeconds = lesson.min_watch_time || 120
      await markLessonProgressAPI(lessonId, { watched_seconds: watchedSeconds })
      setCompleted(true)
      setProgress(100)
    } catch {
      if (lesson.lesson_type !== 'quiz') {
        setCompleted(true)
        setProgress(100)
      }
    } finally {
      setSubmitting(false)
    }
  }

  function renderLessonBody() {
    if (!lesson)
      return <Alert type="error" showIcon message="Lesson not found." />

    if (lesson.lesson_type === 'text') {
      return (
        <Card style={{ width: '100%', maxWidth: 900 }}>
          <Paragraph style={{ whiteSpace: 'pre-wrap', marginBottom: 0 }}>
            {lesson.content_markdown || 'No content available for this text lesson.'}
          </Paragraph>
        </Card>
      )
    }

    if (lesson.lesson_type === 'quiz') {
      const questions = normalizeQuizQuestions(lesson)
      return (
        <div style={{ width: '100%', maxWidth: 900 }}>
          {lesson.is_final && (
            <Alert
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
              message="Final Quiz"
              description="You must pass this quiz to unlock the next module."
            />
          )}

          {quizResult && (
            <Alert
              type={quizResult.passed ? 'success' : 'error'}
              showIcon
              style={{ marginBottom: 16 }}
              message={quizResult.passed ? 'Passed' : 'Not passed yet'}
              description={`Score: ${quizResult.score}/${quizResult.total_questions} · Required: ${quizResult.pass_threshold_percent || 80}%`}
            />
          )}

          <Space direction="vertical" style={{ width: '100%' }} size={16}>
            {questions.map((question, index) => (
              <Card key={`${lesson.id}-${index}`} title={`Question ${index + 1}`}>
                <Paragraph>{question.question}</Paragraph>
                <Radio.Group
                  value={selectedAnswers[index]}
                  onChange={(event) => {
                    const next = [...selectedAnswers]
                    next[index] = event.target.value
                    setSelectedAnswers(next)
                  }}
                >
                  <Space direction="vertical">
                    {(question.options || []).map((option, optionIndex) => (
                      <Radio key={`${lesson.id}-${index}-${optionIndex}`} value={optionIndex}>
                        {option}
                      </Radio>
                    ))}
                  </Space>
                </Radio.Group>
              </Card>
            ))}
          </Space>
        </div>
      )
    }

    return (
      <div className={styles.videoPlaceholder}>
        <div className={styles.playIcon}>
          <PlayCircleOutlined />
        </div>
      </div>
    )
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
        {renderLessonBody()}
        <h2 className={styles.lessonTitle}>{lesson?.title ?? 'Lesson'}</h2>
        {lesson?.lesson_type === 'quiz' && (
          <Text type="secondary" style={{ marginTop: 8 }}>
            Choose one answer for each question, then submit.
          </Text>
        )}
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
          disabled={completed || submitting || (lesson?.lesson_type === 'quiz' && !normalizeQuizQuestions(lesson).length)}
        >
          {completed
            ? 'Completed!'
            : submitting
              ? 'Saving...'
              : lesson?.lesson_type === 'quiz'
                ? 'Submit Quiz'
                : 'Mark Complete'}
        </button>
      </footer>
    </div>
  )
}
