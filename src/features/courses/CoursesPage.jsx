import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Spin } from 'antd'
import { getCoursesAPI } from './courseService'
import styles from './CoursesPage.module.css'

export function CoursesPage() {
  const [loading, setLoading] = useState(true)
  const [courses, setCourses] = useState([])
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    async function fetchCourses() {
      setLoading(true)
      setError(null)
      try {
        const coursesData = await getCoursesAPI()
        setCourses(Array.isArray(coursesData) ? coursesData : [])
      } catch (err) {
        setError(err?.message || 'Failed to load courses')
        setCourses([])
      } finally {
        setLoading(false)
      }
    }
    fetchCourses()
  }, [])

  if (loading) {
    return (
      <div className={styles.page} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Courses</h1>
      {error && <p style={{ color: 'var(--color-error)', marginBottom: 'var(--space-4)' }}>{error}</p>}
      {courses.length === 0 ? (
        <p style={{ color: 'var(--color-text-secondary)' }}>No courses are available right now.</p>
      ) : (
      <div className={styles.grid}>
        {courses.map((course) => (
          <div
            key={course.id}
            className={styles.card}
            onClick={() => navigate(`/courses/${course.id}`)}
          >
            <div className={styles.imagePlaceholder}>📚</div>
            <h2 className={styles.cardTitle}>{course.title}</h2>
            <p className={styles.cardDescription}>
              {course.description || 'Start learning today.'}
            </p>
            <p className={styles.cardMeta}>
              {course.lesson_count ?? 0} lessons
            </p>
          </div>
        ))}
      </div>
      )}
    </div>
  )
}
