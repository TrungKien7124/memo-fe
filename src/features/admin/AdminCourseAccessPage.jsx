import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Alert, Button, Card, Form, Input, Popconfirm, Space, Table, Tag, Typography, message } from 'antd'
import {
  bulkGrantTeachersCourseAccessAPI,
  getAdminCourseByIdAPI,
  getCourseEnrollmentsAPI,
  grantCourseAccessAPI,
  revokeCourseAccessAPI,
} from './adminService'
import { applyFormApiError, parseApiError } from '../../utils/apiError'
import styles from './AdminCourseAccessPage.module.css'

const { Title, Text } = Typography

function sourceColor(source) {
  if (source === 'bulk_teacher_grant') return 'purple'
  if (source === 'admin_grant') return 'blue'
  return 'green'
}

export function AdminCourseAccessPage() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [course, setCourse] = useState(null)
  const [enrollments, setEnrollments] = useState([])
  const [loadError, setLoadError] = useState(null)
  const [grantSubmitting, setGrantSubmitting] = useState(false)
  const [bulkSubmitting, setBulkSubmitting] = useState(false)
  const [grantForm] = Form.useForm()

  async function loadData() {
    if (!courseId) return
    setLoading(true)
    setLoadError(null)
    try {
      const [courseData, enrollmentList] = await Promise.all([
        getAdminCourseByIdAPI(courseId),
        getCourseEnrollmentsAPI(courseId),
      ])
      setCourse(courseData)
      setEnrollments(Array.isArray(enrollmentList) ? enrollmentList : [])
    } catch (error) {
      const parsed = parseApiError(error, 'Failed to load course access data')
      setLoadError(parsed.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [courseId])

  async function handleGrantAccess(values) {
    if (!courseId) return
    setGrantSubmitting(true)
    try {
      await grantCourseAccessAPI(courseId, values.user_id)
      message.success('Course access granted successfully')
      grantForm.resetFields()
      loadData()
    } catch (error) {
      const parsed = parseApiError(error, 'Failed to grant course access')
      applyFormApiError(grantForm, parsed)
      message.error(parsed.message)
    } finally {
      setGrantSubmitting(false)
    }
  }

  async function handleBulkGrantTeachers() {
    if (!courseId) return
    setBulkSubmitting(true)
    try {
      const summary = await bulkGrantTeachersCourseAccessAPI(courseId)
      message.success(`Bulk grant done: created ${summary.created_count}, existing ${summary.existing_count}`)
      loadData()
    } catch (error) {
      const parsed = parseApiError(error, 'Failed to bulk grant teachers')
      message.error(parsed.message)
    } finally {
      setBulkSubmitting(false)
    }
  }

  async function handleRevoke(enrollmentId) {
    if (!courseId) return
    try {
      await revokeCourseAccessAPI(courseId, enrollmentId)
      message.success('Course access revoked successfully')
      loadData()
    } catch (error) {
      const parsed = parseApiError(error, 'Failed to revoke course access')
      message.error(parsed.message)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Button onClick={() => navigate('/admin/courses')}>Back to Courses</Button>
        <Title level={2} className={styles.title}>Course Access Management</Title>
        <Text className={styles.subtitle}>
          {course ? `${course.title}` : 'Loading course...'}
        </Text>
      </div>

      {loadError && (
        <Alert type="error" showIcon message={loadError} style={{ marginBottom: 16 }} />
      )}

      <Card title="Grant Access" className={styles.card}>
        <Form form={grantForm} layout="inline" onFinish={handleGrantAccess}>
          <Form.Item
            name="user_id"
            rules={[{ required: true, message: 'Please enter user id' }]}
          >
            <Input placeholder="User UUID" style={{ width: 320 }} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={grantSubmitting}>
              Grant Access
            </Button>
          </Form.Item>
          <Form.Item>
            <Button onClick={handleBulkGrantTeachers} loading={bulkSubmitting}>
              Bulk Grant Teachers
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Card title="Enrollments" className={styles.card}>
        <Table
          rowKey="id"
          loading={loading}
          dataSource={enrollments}
          pagination={{ pageSize: 10 }}
          columns={[
            { title: 'Email', dataIndex: 'email', key: 'email' },
            { title: 'Username', dataIndex: 'username', key: 'username' },
            {
              title: 'Role',
              dataIndex: 'role',
              key: 'role',
              render: (role) => <Tag>{role}</Tag>,
            },
            {
              title: 'Source',
              dataIndex: 'source',
              key: 'source',
              render: (source) => <Tag color={sourceColor(source)}>{source}</Tag>,
            },
            { title: 'Enrolled At', dataIndex: 'enrolled_at', key: 'enrolled_at' },
            {
              title: 'Action',
              key: 'action',
              render: (_, record) => (
                <Space>
                  <Popconfirm
                    title="Revoke access for this enrollment?"
                    okText="Revoke"
                    cancelText="Cancel"
                    onConfirm={() => handleRevoke(record.id)}
                  >
                    <Button danger>Revoke</Button>
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
        />
      </Card>
    </div>
  )
}
