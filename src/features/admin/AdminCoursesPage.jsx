import { useEffect, useState } from 'react'
import { Button, Card, Form, Input, Modal, Select, Space, Table, Tag, Typography, message } from 'antd'
import { EditOutlined, PlusOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import {
  createAdminCourseAPI,
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
      message.success('Tao khoa hoc thanh cong')
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
      message.success('Cap nhat khoa hoc thanh cong')
      handleCloseEditCourseModal()
      loadCourses()
    } catch (error) {
      const parsed = parseApiError(error, 'Failed to update course')
      applyFormApiError(editCourseForm, parsed)
      message.error(parsed.message)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Title level={2} className={styles.title}>Quan ly khoa hoc</Title>
        <Text className={styles.subtitle}>
          Tao khoa hoc, sau do di sau vao tung khoa hoc de quan ly module va bai giang.
        </Text>
      </div>

      <Card title="Tao khoa hoc moi" className={styles.formCard}>
        <Form form={courseForm} layout="vertical" onFinish={handleCreateCourse} requiredMark={false}>
          <Form.Item name="title" label="Tieu de" rules={[{ required: true, message: 'Vui long nhap tieu de khoa hoc' }]}>
            <Input placeholder="English Basics" />
          </Form.Item>
          <Form.Item name="description" label="Mo ta">
            <Input.TextArea rows={3} placeholder="Mo ta ngan ve khoa hoc" />
          </Form.Item>
          <Form.Item name="thumbnail_url" label="Thumbnail URL">
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item name="status" label="Trang thai" initialValue="draft">
            <Select
              options={[
                { value: 'draft', label: 'Draft' },
                { value: 'published', label: 'Published' },
                { value: 'archived', label: 'Archived' },
              ]}
            />
          </Form.Item>
          <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
            Tao khoa hoc
          </Button>
        </Form>
      </Card>

      <Card title="Danh sach khoa hoc" className={styles.tableCard}>
        <Table
          rowKey="id"
          loading={loading}
          dataSource={courses}
          pagination={{ pageSize: 8 }}
          columns={[
            { title: 'Tieu de', dataIndex: 'title', key: 'title' },
            { title: 'Mo ta', dataIndex: 'description', key: 'description', ellipsis: true },
            {
              title: 'Trang thai',
              dataIndex: 'status',
              key: 'status',
              render: (status) => <Tag color={statusColor(status)}>{status}</Tag>,
            },
            {
              title: 'Hanh dong',
              key: 'actions',
              width: 320,
              render: (_, record) => (
                <Space>
                  <Button onClick={() => navigate(`/admin/courses/${record.id}/modules`)}>
                    Quan ly module
                  </Button>
                  <Button icon={<EditOutlined />} onClick={() => handleOpenEditCourseModal(record)}>
                    Chinh sua
                  </Button>
                </Space>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        title="Chinh sua khoa hoc"
        open={isEditModalOpen}
        onCancel={handleCloseEditCourseModal}
        onOk={() => editCourseForm.submit()}
        okText="Luu"
        cancelText="Huy"
      >
        <Form form={editCourseForm} layout="vertical" onFinish={handleUpdateCourse} requiredMark={false}>
          <Form.Item name="title" label="Tieu de" rules={[{ required: true, message: 'Vui long nhap tieu de khoa hoc' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Mo ta">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="thumbnail_url" label="Thumbnail URL">
            <Input />
          </Form.Item>
          <Form.Item name="status" label="Trang thai" rules={[{ required: true, message: 'Vui long chon trang thai' }]}>
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
