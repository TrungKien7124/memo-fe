import { useEffect, useMemo, useState } from 'react'
import { Button, Card, Form, Input, InputNumber, Modal, Space, Table, Typography, message } from 'antd'
import { ArrowLeftOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import {
  createAdminModuleAPI,
  getAdminCourseByIdAPI,
  getAdminModulesAPI,
  updateAdminModuleAPI,
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

export function AdminCourseModulesPage() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [course, setCourse] = useState(null)
  const [modules, setModules] = useState([])
  const [editingModule, setEditingModule] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const [createForm] = Form.useForm()
  const [editForm] = Form.useForm()

  const parsedCourseId = useMemo(() => Number(courseId), [courseId])

  async function loadData() {
    if (!courseId) return

    setLoading(true)
    try {
      const [courseData, modulesData] = await Promise.all([
        getAdminCourseByIdAPI(courseId),
        getAdminModulesAPI(courseId),
      ])
      setCourse(courseData?.data || courseData)
      setModules(normalizeListResponse(modulesData))
    } catch (error) {
      const parsed = parseApiError(error, 'Failed to load modules')
      message.error(parsed.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [courseId])

  async function handleCreateModule(values) {
    try {
      await createAdminModuleAPI({ ...values, course: parsedCourseId || courseId })
      message.success('Module created successfully')
      createForm.resetFields()
      loadData()
    } catch (error) {
      const parsed = parseApiError(error, 'Failed to create module')
      applyFormApiError(createForm, parsed)
      message.error(parsed.message)
    }
  }

  function handleOpenEditModuleModal(module) {
    setEditingModule(module)
    editForm.setFieldsValue({
      title: module.title,
      order_index: module.order_index,
    })
    setIsEditModalOpen(true)
  }

  function handleCloseEditModuleModal() {
    setEditingModule(null)
    setIsEditModalOpen(false)
    editForm.resetFields()
  }

  async function handleUpdateModule(values) {
    if (!editingModule?.id) return

    try {
      await updateAdminModuleAPI(editingModule.id, values)
      message.success('Module updated successfully')
      handleCloseEditModuleModal()
      loadData()
    } catch (error) {
      const parsed = parseApiError(error, 'Failed to update module')
      applyFormApiError(editForm, parsed)
      message.error(parsed.message)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/courses')}>
            Back to Courses
          </Button>
        </Space>
        <Title level={2} className={styles.title}>Module Management</Title>
        <Text className={styles.subtitle}>
          Course: <strong>{course?.title || `#${courseId}`}</strong>
        </Text>
      </div>

      <Card title="Create New Module" className={styles.formCard}>
        <Form form={createForm} layout="vertical" onFinish={handleCreateModule} requiredMark={false}>
          <Form.Item name="title" label="Module Title" rules={[{ required: true, message: 'Please enter the module title' }]}>
            <Input placeholder="Module 1: Greetings" />
          </Form.Item>
          <Form.Item name="order_index" label="Order" initialValue={0}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
            Create Module
          </Button>
        </Form>
      </Card>

      <Card title="Module List" className={styles.tableCard}>
        <Table
          rowKey="id"
          loading={loading}
          dataSource={modules}
          pagination={{ pageSize: 10 }}
          columns={[
            { title: 'Title', dataIndex: 'title', key: 'title' },
            { title: 'Order', dataIndex: 'order_index', key: 'order_index', width: 120 },
            {
              title: 'Actions',
              key: 'actions',
              width: 340,
              render: (_, record) => (
                <Space>
                  <Button onClick={() => navigate(`/admin/modules/${record.id}/lessons`)}>
                    Manage Lessons
                  </Button>
                  <Button icon={<EditOutlined />} onClick={() => handleOpenEditModuleModal(record)}>
                    Edit
                  </Button>
                </Space>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        title="Edit Module"
        open={isEditModalOpen}
        onCancel={handleCloseEditModuleModal}
        onOk={() => editForm.submit()}
        okText="Save"
        cancelText="Cancel"
      >
        <Form form={editForm} layout="vertical" onFinish={handleUpdateModule} requiredMark={false}>
          <Form.Item name="title" label="Module Title" rules={[{ required: true, message: 'Please enter the module title' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="order_index" label="Order" rules={[{ required: true, message: 'Please enter the module order' }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
