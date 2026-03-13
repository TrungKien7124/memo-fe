import { useEffect, useState } from 'react'
import { Button, Card, Form, Input, Modal, Popconfirm, Select, Space, Table, Tag, Typography, message } from 'antd'
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import {
  createAdminCourseAPI,
  deleteAdminCourseAPI,
  getAdminCoursesAPI,
  updateAdminCourseAPI,
} from './adminService'
import { applyFormApiError, parseApiError } from '../../utils/apiError'
import styles from './AdminCoursesPage.module.css'

const { Title, Text } = Typography

function normalizeListResponse(data) {
  if (Array.isArray(data))
    return data
  if (Array.isArray(data?.data))
    return data.data
  if (Array.isArray(data?.results))
    return data.results
  if (Array.isArray(data?.data?.results))
    return data.data.results
  return []
}

function statusColor(status) {
  if (status === 'published')
    return 'green'
  if (status === 'archived')
    return 'default'
  return 'blue'
}

export function AdminCoursesPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [courses, setCourses] = useState([])
  const [editingCourse, setEditingCourse] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const [courseForm] = Form.useForm()
  const [editCourseForm] = Form.useForm()

  async function loadCourses() {
    setLoading(true)
    try {
      const coursesData = await getAdminCoursesAPI()
      setCourses(normalizeListResponse(coursesData))
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

  async function handleCreateCourse(values) {
    try {
      await createAdminCourseAPI(values)
      message.success('Course created successfully')
      courseForm.resetFields()
      loadCourses()
    } catch (error) {
      const parsed = parseApiError(error, 'Failed to create course')
      applyFormApiError(courseForm, parsed)
      message.error(parsed.message)
    }
  }

  function handleOpenEditCourseModal(course) {
    setEditingCourse(course)
    editCourseForm.setFieldsValue({
      title: course.title,
      description: course.description,
      thumbnail_url: course.thumbnail_url,
      status: course.status,
    })
    setIsEditModalOpen(true)
  }

  function handleCloseEditCourseModal() {
    setEditingCourse(null)
    setIsEditModalOpen(false)
    editCourseForm.resetFields()
  }

  async function handleUpdateCourse(values) {
    if (!editingCourse?.id) return

    try {
      await updateAdminCourseAPI(editingCourse.id, values)
      message.success('Course updated successfully')
      handleCloseEditCourseModal()
      loadCourses()
    } catch (error) {
      const parsed = parseApiError(error, 'Failed to update course')
      applyFormApiError(editCourseForm, parsed)
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
          Create courses, then drill into each course to manage modules and lessons.
        </Text>
      </div>

      <Card title="Create New Course" className={styles.formCard}>
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
          <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
            Create Course
          </Button>
        </Form>
      </Card>

      <Card title="Course List" className={styles.tableCard}>
        <Table
          rowKey="id"
          loading={loading}
          dataSource={courses}
          pagination={{ pageSize: 8 }}
          columns={[
            { title: 'Title', dataIndex: 'title', key: 'title' },
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
              width: 320,
              render: (_, record) => (
                <Space>
                  <Button onClick={() => navigate(`/admin/courses/${record.id}/modules`)}>
                    Manage Modules
                  </Button>
                  <Button icon={<EditOutlined />} onClick={() => handleOpenEditCourseModal(record)}>
                    Edit
                  </Button>
                  <Popconfirm
                    title="Delete this course?"
                    description="This action cannot be undone."
                    okText="Delete"
                    cancelText="Cancel"
                    onConfirm={() => handleDeleteCourse(record.id)}
                  >
                    <Button danger icon={<DeleteOutlined />}>
                      Delete
                    </Button>
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        title="Edit Course"
        open={isEditModalOpen}
        onCancel={handleCloseEditCourseModal}
        onOk={() => editCourseForm.submit()}
        okText="Save"
        cancelText="Cancel"
      >
        <Form form={editCourseForm} layout="vertical" onFinish={handleUpdateCourse} requiredMark={false}>
          <Form.Item name="title" label="Title" rules={[{ required: true, message: 'Please enter the course title' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="thumbnail_url" label="Thumbnail URL">
            <Input />
          </Form.Item>
          <Form.Item name="status" label="Status" rules={[{ required: true, message: 'Please select a status' }]}>
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
