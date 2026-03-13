import { useEffect, useMemo, useState } from 'react'
import { Button, Card, Col, Divider, Form, Input, InputNumber, Row, Select, Table, Tag, Typography, message } from 'antd'
import { BookOutlined, PlusOutlined, ReadOutlined, UnorderedListOutlined } from '@ant-design/icons'
import {
  createAdminCourseAPI,
  createAdminLessonAPI,
  createAdminModuleAPI,
  getAdminCoursesAPI,
  getAdminLessonsAPI,
  getAdminModulesAPI,
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
  const [loading, setLoading] = useState(false)
  const [courses, setCourses] = useState([])
  const [modules, setModules] = useState([])
  const [lessons, setLessons] = useState([])

  const [courseForm] = Form.useForm()
  const [moduleForm] = Form.useForm()
  const [lessonForm] = Form.useForm()

  async function loadData() {
    setLoading(true)
    try {
      const [coursesData, modulesData, lessonsData] = await Promise.all([
        getAdminCoursesAPI(),
        getAdminModulesAPI(),
        getAdminLessonsAPI(),
      ])

      setCourses(normalizeListResponse(coursesData))
      setModules(normalizeListResponse(modulesData))
      setLessons(normalizeListResponse(lessonsData))
    } catch (error) {
      const parsed = parseApiError(error, 'Failed to load admin data')
      message.error(parsed.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const courseOptions = useMemo(
    () => courses.map((course) => ({ value: course.id, label: course.title })),
    [courses]
  )

  const moduleOptions = useMemo(
    () =>
      modules.map((module) => ({
        value: module.id,
        label: `${module.title} (${courses.find((course) => course.id === module.course)?.title || 'Unknown course'})`,
      })),
    [modules, courses]
  )

  async function handleCreateCourse(values) {
    try {
      await createAdminCourseAPI(values)
      message.success('Course created')
      courseForm.resetFields()
      loadData()
    } catch (error) {
      const parsed = parseApiError(error, 'Failed to create course')
      applyFormApiError(courseForm, parsed)
      message.error(parsed.message)
    }
  }

  async function handleCreateModule(values) {
    try {
      await createAdminModuleAPI(values)
      message.success('Module created')
      moduleForm.resetFields()
      loadData()
    } catch (error) {
      const parsed = parseApiError(error, 'Failed to create module')
      applyFormApiError(moduleForm, parsed)
      message.error(parsed.message)
    }
  }

  async function handleCreateLesson(values) {
    try {
      await createAdminLessonAPI(values)
      message.success('Lesson created')
      lessonForm.resetFields()
      loadData()
    } catch (error) {
      const parsed = parseApiError(error, 'Failed to create lesson')
      applyFormApiError(lessonForm, parsed)
      message.error(parsed.message)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Title level={2} className={styles.title}>Admin Course Management</Title>
        <Text className={styles.subtitle}>
          Create and manage courses, modules, and lessons from the frontend admin panel.
        </Text>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Card title={<span><BookOutlined /> Create Course</span>} className={styles.formCard}>
            <Form form={courseForm} layout="vertical" onFinish={handleCreateCourse} requiredMark={false}>
              <Form.Item name="title" label="Title" rules={[{ required: true, message: 'Course title is required' }]}>
                <Input placeholder="English Basics" />
              </Form.Item>
              <Form.Item name="description" label="Description">
                <Input.TextArea rows={3} placeholder="Brief description of the course" />
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
              <Button type="primary" htmlType="submit" icon={<PlusOutlined />} block>
                Create Course
              </Button>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title={<span><UnorderedListOutlined /> Create Module</span>} className={styles.formCard}>
            <Form form={moduleForm} layout="vertical" onFinish={handleCreateModule} requiredMark={false}>
              <Form.Item name="course" label="Course" rules={[{ required: true, message: 'Please select a course' }]}>
                <Select showSearch options={courseOptions} placeholder="Select course" optionFilterProp="label" />
              </Form.Item>
              <Form.Item name="title" label="Module Title" rules={[{ required: true, message: 'Module title is required' }]}>
                <Input placeholder="Module 1: Greetings" />
              </Form.Item>
              <Form.Item name="order_index" label="Order Index" initialValue={0}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
              <Button type="primary" htmlType="submit" icon={<PlusOutlined />} block>
                Create Module
              </Button>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title={<span><ReadOutlined /> Create Lesson</span>} className={styles.formCard}>
            <Form form={lessonForm} layout="vertical" onFinish={handleCreateLesson} requiredMark={false}>
              <Form.Item name="module" label="Module" rules={[{ required: true, message: 'Please select a module' }]}>
                <Select showSearch options={moduleOptions} placeholder="Select module" optionFilterProp="label" />
              </Form.Item>
              <Form.Item name="title" label="Lesson Title" rules={[{ required: true, message: 'Lesson title is required' }]}>
                <Input placeholder="Lesson 1: Hello and Goodbye" />
              </Form.Item>
              <Form.Item name="video_url" label="Video URL" rules={[{ required: true, message: 'Video URL is required' }]}>
                <Input placeholder="https://youtube.com/..." />
              </Form.Item>
              <Form.Item name="min_watch_time" label="Min Watch Time (seconds)" initialValue={120}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="order_index" label="Order Index" initialValue={0}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
              <Button type="primary" htmlType="submit" icon={<PlusOutlined />} block>
                Create Lesson
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>

      <Divider />

      <Card title="Courses" className={styles.tableCard}>
        <Table
          rowKey="id"
          loading={loading}
          dataSource={courses}
          pagination={{ pageSize: 5 }}
          columns={[
            { title: 'Title', dataIndex: 'title', key: 'title' },
            { title: 'Description', dataIndex: 'description', key: 'description', ellipsis: true },
            {
              title: 'Status',
              dataIndex: 'status',
              key: 'status',
              render: (status) => <Tag color={statusColor(status)}>{status}</Tag>,
            },
          ]}
        />
      </Card>

      <Card title="Modules" className={styles.tableCard}>
        <Table
          rowKey="id"
          loading={loading}
          dataSource={modules}
          pagination={{ pageSize: 6 }}
          columns={[
            { title: 'Title', dataIndex: 'title', key: 'title' },
            {
              title: 'Course',
              dataIndex: 'course',
              key: 'course',
              render: (courseId) => courses.find((course) => course.id === courseId)?.title || courseId,
            },
            { title: 'Order', dataIndex: 'order_index', key: 'order_index', width: 100 },
          ]}
        />
      </Card>

      <Card title="Lessons" className={styles.tableCard}>
        <Table
          rowKey="id"
          loading={loading}
          dataSource={lessons}
          pagination={{ pageSize: 8 }}
          columns={[
            { title: 'Title', dataIndex: 'title', key: 'title' },
            {
              title: 'Module',
              dataIndex: 'module',
              key: 'module',
              render: (moduleId) => modules.find((module) => module.id === moduleId)?.title || moduleId,
            },
            { title: 'Watch Time', dataIndex: 'min_watch_time', key: 'min_watch_time', width: 140 },
            { title: 'Order', dataIndex: 'order_index', key: 'order_index', width: 90 },
          ]}
        />
      </Card>
    </div>
  )
}
