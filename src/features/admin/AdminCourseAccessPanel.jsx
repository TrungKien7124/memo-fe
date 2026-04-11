import { useEffect, useState } from 'react'
import { Alert, Button, Form, Input, Modal, Popconfirm, Space, Table, Tag, Tooltip, message } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import {
  bulkGrantTeachersCourseAccessAPI,
  getCourseEnrollmentsAPI,
  grantCourseAccessAPI,
  revokeCourseAccessAPI,
} from './adminService'
import { AdminListCreateLayout } from '../../components/admin/AdminListCreateLayout'
import { applyFormApiError, parseApiError } from '../../utils/apiError'
import styles from './AdminCoursesPage.module.css'

function sourceColor(source) {
  if (source === 'bulk_teacher_grant') return 'purple'
  if (source === 'admin_grant') return 'blue'
  return 'green'
}

export function AdminCourseAccessPanel({ courseId }) {
  const [loading, setLoading] = useState(false)
  const [enrollments, setEnrollments] = useState([])
  const [loadError, setLoadError] = useState(null)
  const [grantSubmitting, setGrantSubmitting] = useState(false)
  const [bulkSubmitting, setBulkSubmitting] = useState(false)
  const [isGrantModalOpen, setIsGrantModalOpen] = useState(false)
  const [grantForm] = Form.useForm()

  async function loadData() {
    if (!courseId) return
    setLoading(true)
    setLoadError(null)
    try {
      const enrollmentList = await getCourseEnrollmentsAPI(courseId)
      setEnrollments(Array.isArray(enrollmentList) ? enrollmentList : [])
    } catch (error) {
      const parsed = parseApiError(error, 'Failed to load enrollments')
      setLoadError(parsed.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [courseId])

  function handleOpenGrantModal() {
    grantForm.resetFields()
    setIsGrantModalOpen(true)
  }

  function handleCloseGrantModal() {
    setIsGrantModalOpen(false)
    grantForm.resetFields()
  }

  async function handleGrantAccess(values) {
    if (!courseId) return
    setGrantSubmitting(true)
    try {
      await grantCourseAccessAPI(courseId, values.user_id)
      message.success('Course access granted successfully')
      handleCloseGrantModal()
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
    <>
      {loadError && (
        <Alert type="error" showIcon message={loadError} style={{ marginBottom: 16 }} />
      )}

      <AdminListCreateLayout
        title="Enrollments"
        cardClassName={styles.tableCard}
        createLabel="Grant access"
        onCreateClick={handleOpenGrantModal}
        footerExtra={(
          <Button size="large" onClick={handleBulkGrantTeachers} loading={bulkSubmitting}>
            Bulk grant teachers
          </Button>
        )}
      >
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
            { title: 'Enrolled at', dataIndex: 'enrolled_at', key: 'enrolled_at' },
            {
              title: 'Actions',
              key: 'action',
              width: 72,
              align: 'center',
              render: (_, record) => (
                <Tooltip title="Revoke access">
                  <Popconfirm
                    title="Revoke access for this enrollment?"
                    okText="Revoke"
                    cancelText="Cancel"
                    onConfirm={() => handleRevoke(record.id)}
                  >
                    <Button type="text" danger icon={<DeleteOutlined />} aria-label="Revoke access" />
                  </Popconfirm>
                </Tooltip>
              ),
            },
          ]}
        />
      </AdminListCreateLayout>

      <Modal
        title="Grant access"
        open={isGrantModalOpen}
        onCancel={handleCloseGrantModal}
        onOk={() => grantForm.submit()}
        okText="Grant"
        cancelText="Cancel"
        confirmLoading={grantSubmitting}
        destroyOnClose
      >
        <Form form={grantForm} layout="vertical" onFinish={handleGrantAccess} requiredMark={false}>
          <Form.Item
            name="user_id"
            label="User ID"
            rules={[{ required: true, message: 'Please enter user UUID' }]}
          >
            <Input placeholder="User UUID" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
