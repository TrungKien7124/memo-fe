import { useEffect, useState } from 'react'
import { Button, Form, Input, Modal, Select, Table, Tag, Typography, message } from 'antd'
import { useNavigate } from 'react-router-dom'
import { AdminListCreateLayout } from '../../components/admin/AdminListCreateLayout'
import { TableEditDeleteActions } from '../../components/admin/TableEditDeleteActions'
import {
  createAdminCourseAPI,
  deleteAdminCourseAPI,
  getAdminCoursesAPI,
} from './adminService'
import { applyFormApiError, parseApiError } from '../../utils/apiError'
import styles from './AdminCoursesPage.module.css'

const { Title, Text } = Typography

function statusColor(status) {
  if (status === 'published')
    return 'green'
  if (status === 'archived')
    return 'default'
  return 'blue'
}

function courseDetailUrl(courseId, { sub } = {}) {
  const base = `/admin/course/detail/${courseId}`
  if (sub === 'modules' || sub === 'access')
    return `${base}?sub=${sub}`
  return base
}

export function AdminCoursesPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [courses, setCourses] = useState([])
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const [courseForm] = Form.useForm()

  async function loadCourses() {
    setLoading(true)
    try {
      const coursesData = await getAdminCoursesAPI()
      setCourses(Array.isArray(coursesData) ? coursesData : [])
    } catch (error) {
      const parsed = parseApiError(error, 'Failed to load courses')
      message.error(parsed.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCourses()
  }, [])

  function handleOpenCreateModal() {
    courseForm.resetFields()
    courseForm.setFieldsValue({ status: 'draft' })
    setIsCreateModalOpen(true)
  }

  function handleCloseCreateModal() {
    setIsCreateModalOpen(false)
    courseForm.resetFields()
  }

  async function handleCreateCourse(values) {
    try {
      await createAdminCourseAPI(values)
      message.success('Course created successfully')
      handleCloseCreateModal()
      loadCourses()
    } catch (error) {
      const parsed = parseApiError(error, 'Failed to create course')
      applyFormApiError(courseForm, parsed)
      message.error(parsed.message)
    }
  }

  async function handleDeleteCourse(courseId) {
    try {
      await deleteAdminCourseAPI(courseId)
      message.success('Course deleted successfully')
      loadCourses()
    } catch (error) {
      const parsed = parseApiError(error, 'Failed to delete course')
      message.error(parsed.message)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Title level={2} className={styles.title}>Course Management</Title>
        <Text className={styles.subtitle}>
          Click a title to open modules and access. Use the pencil to edit course information, or the trash icon to delete.
        </Text>
      </div>

      <AdminListCreateLayout
        title="Course List"
        cardClassName={styles.tableCard}
        createLabel="Create new course"
        onCreateClick={handleOpenCreateModal}
      >
        <Table
          rowKey="id"
          loading={loading}
          dataSource={courses}
          pagination={{ pageSize: 8 }}
          columns={[
            {
              title: 'Title',
              dataIndex: 'title',
              key: 'title',
              render: (title, record) => (
                <Button
                  type="link"
                  className={styles.courseTitleLink}
                  onClick={() => navigate(courseDetailUrl(record.id, { tab: 'lists', sub: 'modules' }))}
                >
                  {title}
                </Button>
              ),
            },
            { title: 'Description', dataIndex: 'description', key: 'description', ellipsis: true },
            {
              title: 'Status',
              dataIndex: 'status',
              key: 'status',
              render: (status) => <Tag color={statusColor(status)}>{status}</Tag>,
            },
            {
              title: 'Actions',
              key: 'actions',
              width: 88,
              align: 'center',
              render: (_, record) => (
                <TableEditDeleteActions
                  onEdit={() => navigate(courseDetailUrl(record.id))}
                  onDelete={() => handleDeleteCourse(record.id)}
                  editLabel="Edit course"
                  deleteLabel="Delete course"
                  deleteTitle="Delete this course?"
                  deleteDescription="This action cannot be undone."
                />
              ),
            },
          ]}
        />
      </AdminListCreateLayout>

      <Modal
        title="Create Course"
        open={isCreateModalOpen}
        onCancel={handleCloseCreateModal}
        onOk={() => courseForm.submit()}
        okText="Create"
        cancelText="Cancel"
        destroyOnClose
      >
        <Form form={courseForm} layout="vertical" onFinish={handleCreateCourse} requiredMark={false}>
          <Form.Item name="title" label="Title" rules={[{ required: true, message: 'Please enter the course title' }]}>
            <Input placeholder="English Basics" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} placeholder="Short description of this course" />
          </Form.Item>
          <Form.Item name="thumbnail_url" label="Thumbnail URL">
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item name="status" label="Status" initialValue="draft">
            <Select
              options={[
                { value: 'draft', label: 'Draft' },
                { value: 'published', label: 'Published' },
                { value: 'archived', label: 'Archived' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
