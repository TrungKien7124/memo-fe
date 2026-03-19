import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Alert, Card, Radio, Space, Spin, Typography } from 'antd'
import { ArrowLeftOutlined, CloseOutlined, PlayCircleOutlined } from '@ant-design/icons'
import clsx from 'clsx'
import { getLessonDetailAPI, markLessonProgressAPI, submitQuizAnswerAPI } from './courseService'
import styles from './LessonPage.module.css'

const { Paragraph, Text } = Typography
const QUIZ_MAX_HEARTS = 5

function normalizeQuizQuestions(lesson) {
  if (!Array.isArray(lesson?.quiz_questions))
    return []
  return lesson.quiz_questions
}

export function LessonPage() {
  const { id, lessonId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lesson, setLesson] = useState(null)
  const [completed, setCompleted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [quizResult, setQuizResult] = useState(null)
  const [quizRuntime, setQuizRuntime] = useState({
    hearts_left: QUIZ_MAX_HEARTS,
    current_question_index: 0,
    correct_count: 0,
    total_questions: 0,
    max_hearts: QUIZ_MAX_HEARTS,
  })

  useEffect(() => {
    async function fetchLesson() {
      if (!lessonId) return
      setLoading(true)
      setError(null)
      try {
        const lessonData = await getLessonDetailAPI(lessonId)
        const questions = normalizeQuizQuestions(lessonData)
        const totalQuestions = questions.length
        setLesson(lessonData)
        const isCompleted = lessonData?.status === 'completed'
        setCompleted(isCompleted)
        setProgress(isCompleted ? 100 : 0)
        setQuizRuntime({
          hearts_left: QUIZ_MAX_HEARTS,
          current_question_index: 0,
          correct_count: 0,
          total_questions: totalQuestions,
          max_hearts: QUIZ_MAX_HEARTS,
        })
        setSelectedAnswer(null)
        setQuizResult(null)
      } catch (err) {
        setLesson(null)
        setCompleted(false)
        setProgress(0)
        setError(err?.message || 'Failed to load lesson.')
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
    setError(null)
    try {
      if (lesson.lesson_type === 'quiz') {
        const currentQuestionIndex = quizRuntime.current_question_index ?? 0
        const totalQuestions = quizRuntime.total_questions || normalizeQuizQuestions(lesson).length
        if (currentQuestionIndex >= totalQuestions) {
          navigate(`/courses/${id}`)
          return
        }
        if (!Number.isInteger(selectedAnswer))
          return

        const { progress: updatedProgress, quizRuntime: runtime } = await submitQuizAnswerAPI(lessonId, {
          question_index: currentQuestionIndex,
          selected_answer: selectedAnswer,
        })
        setQuizResult(runtime)
        const nextRuntime = {
          hearts_left: runtime?.hearts_left ?? quizRuntime.hearts_left,
          current_question_index: runtime?.current_question_index ?? quizRuntime.current_question_index,
          correct_count: runtime?.correct_count ?? quizRuntime.correct_count,
          total_questions: runtime?.total_questions ?? totalQuestions,
          max_hearts: runtime?.max_hearts ?? QUIZ_MAX_HEARTS,
        }
        setQuizRuntime(nextRuntime)
        const isCompleted = Boolean(updatedProgress?.completed)
        setCompleted(isCompleted)
        if (nextRuntime.total_questions > 0) {
          const percentage = Math.round((nextRuntime.correct_count / nextRuntime.total_questions) * 100)
          setProgress(isCompleted ? 100 : percentage)
        } else {
          setProgress(isCompleted ? 100 : 0)
        }
        setSelectedAnswer(null)
        return
      }

      if (lesson.lesson_type === 'text') {
        const { progress: updatedProgress } = await markLessonProgressAPI(lessonId, { completed: true })
        const isCompleted = Boolean(updatedProgress?.completed)
        setCompleted(isCompleted)
        setProgress(isCompleted ? 100 : 0)
        return
      }

      const watchedSeconds = lesson.min_watch_time || 120
      const { progress: updatedProgress } = await markLessonProgressAPI(lessonId, { watched_seconds: watchedSeconds })
      const isCompleted = Boolean(updatedProgress?.completed)
      setCompleted(isCompleted)
      setProgress(isCompleted ? 100 : progress)
    } catch (err) {
      setError(err?.message || 'Failed to save lesson progress.')
    } finally {
      setSubmitting(false)
    }
  }

  function renderLessonBody() {
    if (!lesson)
      return <Alert type="error" showIcon message={error || 'Lesson not found.'} />

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
      const totalQuestions = quizRuntime.total_questions || questions.length
      const currentQuestionIndex = quizRuntime.current_question_index || 0
      const hasCurrentQuestion = currentQuestionIndex < questions.length
      const currentQuestion = hasCurrentQuestion ? questions[currentQuestionIndex] : null
      const heartsLeft = quizRuntime.hearts_left ?? QUIZ_MAX_HEARTS
      return (
        <div style={{ width: '100%', maxWidth: 900 }}>
          {quizResult && (
            <Alert
              type={quizResult.completed ? 'success' : quizResult.failed ? 'error' : quizResult.is_correct ? 'success' : 'warning'}
              showIcon
              style={{ marginBottom: 16 }}
              message={
                quizResult.completed
                  ? 'Quiz completed'
                  : quizResult.failed
                    ? 'Out of hearts. Quiz restarted.'
                    : quizResult.is_correct
                      ? 'Correct answer'
                      : 'Wrong answer'
              }
              description={`Hearts: ${heartsLeft}/${quizRuntime.max_hearts || QUIZ_MAX_HEARTS} · Progress: ${quizRuntime.correct_count}/${totalQuestions}`}
            />
          )}

          <Alert
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
            message={`Hearts: ${heartsLeft}/${quizRuntime.max_hearts || QUIZ_MAX_HEARTS}`}
            description={`Question ${Math.min(currentQuestionIndex + 1, totalQuestions || 1)}/${totalQuestions || questions.length || 1}`}
          />

          {currentQuestion ? (
            <Card title={`Question ${currentQuestionIndex + 1}`}>
              <Paragraph>{currentQuestion.question}</Paragraph>
              <Radio.Group
                value={selectedAnswer}
                onChange={(event) => setSelectedAnswer(event.target.value)}
              >
                <Space direction="vertical">
                  {(currentQuestion.options || []).map((option, optionIndex) => (
                    <Radio key={`${lesson.id}-${currentQuestionIndex}-${optionIndex}`} value={optionIndex}>
                      {option}
                    </Radio>
                  ))}
                </Space>
              </Radio.Group>
            </Card>
          ) : (
            <Alert
              type="success"
              showIcon
              message="Quiz completed"
              description="All questions are answered correctly."
            />
          )}
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
        {error && lesson && (
          <Alert
            type="error"
            showIcon
            message={error}
            style={{ width: '100%', maxWidth: 900, marginBottom: 16 }}
          />
        )}
        {renderLessonBody()}
        <h2 className={styles.lessonTitle}>{lesson?.title ?? 'Lesson'}</h2>
        {lesson?.lesson_type === 'quiz' && (
          <Text type="secondary" style={{ marginTop: 8 }}>
            Answer each question one-by-one. You have 5 hearts for wrong answers.
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
          disabled={
            submitting
            || (
              lesson?.lesson_type === 'quiz'
              && quizRuntime.current_question_index < (quizRuntime.total_questions || normalizeQuizQuestions(lesson).length)
              && !Number.isInteger(selectedAnswer)
            )
            || (lesson?.lesson_type === 'quiz' && !normalizeQuizQuestions(lesson).length)
          }
        >
          {completed
            ? lesson?.lesson_type === 'quiz'
              ? 'Back to Course'
              : 'Completed!'
            : submitting
              ? 'Saving...'
              : lesson?.lesson_type === 'quiz'
                ? 'Submit Answer'
                : 'Mark Complete'}
        </button>
      </footer>
    </div>
  )
}
