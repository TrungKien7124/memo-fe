import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Alert, Button, Card, Spin, Typography, message } from 'antd'
import { enrollCourseAPI, getCourseDetailAPI } from './courseService'
import { getApiErrorMessage } from '../../utils/apiError'
import styles from './CourseCheckoutPage.module.css'

const { Paragraph, Title, Text } = Typography

export function CourseCheckoutPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [course, setCourse] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadCourse() {
      if (!id) return
      setLoading(true)
      setError(null)
      try {
        const detail = await getCourseDetailAPI(id)
        if (detail.isEnrolled) {
          navigate(`/courses/${id}`, { replace: true })
          return
        }
        setCourse(detail)
      } catch (err) {
        setCourse(null)
        setError(getApiErrorMessage(err, 'Không tải được thông tin khóa học'))
      } finally {
        setLoading(false)
      }
    }
    loadCourse()
  }, [id, navigate])

  async function handleConfirmPayment() {
    if (!id) return
    setSubmitting(true)
    setError(null)
    try {
      await enrollCourseAPI(id)
      message.success('Thanh toán demo thành công. Bạn đã được cấp quyền học.')
      navigate(`/courses/${id}`, { replace: true })
    } catch (err) {
      setError(getApiErrorMessage(err, 'Không thể xác nhận thanh toán demo'))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <Spin size="large" />
      </div>
    )
  }

  if (!course) {
    return (
      <div className={styles.page}>
        <Alert type="error" showIcon message={error || 'Không tìm thấy khóa học'} />
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <Card className={styles.card}>
        <Title level={3} className={styles.title}>
          Xác nhận thanh toán demo
        </Title>
        <Paragraph className={styles.description}>
          Bạn đang đăng ký khóa học <Text strong>{course.title}</Text>.
        </Paragraph>
        <Paragraph className={styles.description}>
          Đây là bước mô phỏng thanh toán dành cho demo, không tích hợp cổng thanh toán thật.
        </Paragraph>
        {course.description && (
          <Paragraph className={styles.courseDescription}>{course.description}</Paragraph>
        )}
        {error && (
          <Alert
            type="error"
            showIcon
            message={error}
            style={{ marginBottom: 16 }}
          />
        )}
        <Button
          type="primary"
          size="large"
          loading={submitting}
          onClick={handleConfirmPayment}
          block
        >
          Xác nhận thanh toán
        </Button>
      </Card>
    </div>
  )
}
