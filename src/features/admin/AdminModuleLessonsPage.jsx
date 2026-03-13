import { useEffect, useState } from 'react'
import { Button, Card, Form, Input, InputNumber, Modal, Space, Table, Typography, message } from 'antd'
import { ArrowLeftOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import {
  createAdminLessonAPI,
  getAdminLessonsAPI,
  getAdminModuleByIdAPI,
  updateAdminLessonAPI,
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

export function AdminModuleLessonsPage() {
  const { moduleId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [module, setModule] = useState(null)
  const [lessons, setLessons] = useState([])
  const [editingLesson, setEditingLesson] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const [createForm] = Form.useForm()
  const [editForm] = Form.useForm()

  async function loadData() {
    if (!moduleId) return

    setLoading(true)
    try {
      const [moduleData, lessonsData] = await Promise.all([
        getAdminModuleByIdAPI(moduleId),
        getAdminLessonsAPI(moduleId),
      ])
      setModule(moduleData?.data || moduleData)
      setLessons(normalizeListResponse(lessonsData))
    } catch (error) {
      const parsed = parseApiError(error, 'Failed to load lessons')
      message.error(parsed.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [moduleId])

  async function handleCreateLesson(values) {
    try {
      await createAdminLessonAPI({ ...values, module: Number(moduleId) || moduleId })
      message.success('Tao bai giang thanh cong')
      createForm.resetFields()
      loadData()
    } catch (error) {
      const parsed = parseApiError(error, 'Failed to create lesson')
      applyFormApiError(createForm, parsed)
      message.error(parsed.message)
    }
  }

  function handleOpenEditLessonModal(lesson) {
    setEditingLesson(lesson)
    editForm.setFieldsValue({
      title: lesson.title,
      video_url: lesson.video_url,
      min_watch_time: lesson.min_watch_time,
      order_index: lesson.order_index,
    })
    setIsEditModalOpen(true)
  }

  function handleCloseEditLessonModal() {
    setEditingLesson(null)
    setIsEditModalOpen(false)
    editForm.resetFields()
  }

  async function handleUpdateLesson(values) {
    if (!editingLesson?.id) return

    try {
      await updateAdminLessonAPI(editingLesson.id, values)
      message.success('Cap nhat bai giang thanh cong')
      handleCloseEditLessonModal()
      loadData()
    } catch (error) {
      const parsed = parseApiError(error, 'Failed to update lesson')
      applyFormApiError(editForm, parsed)
      message.error(parsed.message)
    }
  }

  function handleBackToModules() {
    const courseId = module?.course
    if (!courseId) {
      navigate('/admin/courses')
      return
    }
    navigate(`/admin/courses/${courseId}/modules`)
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={handleBackToModules}>
            Quay lai module
          </Button>
        </Space>
        <Title level={2} className={styles.title}>Quan ly bai giang</Title>
        <Text className={styles.subtitle}>
          Module: <strong>{module?.title || `#${moduleId}`}</strong>
        </Text>
      </div>

      <Card title="Tao bai giang moi" className={styles.formCard}>
        <Form form={createForm} layout="vertical" onFinish={handleCreateLesson} requiredMark={false}>
          <Form.Item name="title" label="Tieu de bai giang" rules={[{ required: true, message: 'Vui long nhap tieu de bai giang' }]}>
            <Input placeholder="Lesson 1: Hello and Goodbye" />
          </Form.Item>
          <Form.Item name="video_url" label="Video URL" rules={[{ required: true, message: 'Vui long nhap video URL' }]}>
            <Input placeholder="https://youtube.com/..." />
          </Form.Item>
          <Form.Item name="min_watch_time" label="Thoi gian xem toi thieu (giay)" initialValue={120}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="order_index" label="Thu tu" initialValue={0}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
            Tao bai giang
          </Button>
        </Form>
      </Card>

      <Card title="Danh sach bai giang" className={styles.tableCard}>
        <Table
          rowKey="id"
          loading={loading}
          dataSource={lessons}
          pagination={{ pageSize: 12 }}
          columns={[
            { title: 'Tieu de', dataIndex: 'title', key: 'title' },
            { title: 'Video', dataIndex: 'video_url', key: 'video_url', ellipsis: true },
            { title: 'Watch Time', dataIndex: 'min_watch_time', key: 'min_watch_time', width: 140 },
            { title: 'Thu tu', dataIndex: 'order_index', key: 'order_index', width: 100 },
            {
              title: 'Hanh dong',
              key: 'actions',
              width: 140,
              render: (_, record) => (
                <Button icon={<EditOutlined />} onClick={() => handleOpenEditLessonModal(record)}>
                  Chinh sua
                </Button>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        title="Chinh sua bai giang"
        open={isEditModalOpen}
        onCancel={handleCloseEditLessonModal}
        onOk={() => editForm.submit()}
        okText="Luu"
        cancelText="Huy"
      >
        <Form form={editForm} layout="vertical" onFinish={handleUpdateLesson} requiredMark={false}>
          <Form.Item name="title" label="Tieu de bai giang" rules={[{ required: true, message: 'Vui long nhap tieu de bai giang' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="video_url" label="Video URL" rules={[{ required: true, message: 'Vui long nhap video URL' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="min_watch_time" label="Thoi gian xem toi thieu (giay)" rules={[{ required: true, message: 'Vui long nhap watch time' }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="order_index" label="Thu tu" rules={[{ required: true, message: 'Vui long nhap thu tu' }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
