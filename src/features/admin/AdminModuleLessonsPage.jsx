import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Radio,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
  message,
} from 'antd'
import { ArrowLeftOutlined, DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import {
  createAdminLessonAPI,
  deleteAdminLessonAPI,
  getAdminLessonsAPI,
  getAdminModuleByIdAPI,
  updateAdminLessonAPI,
} from './adminService'
import { applyFormApiError, parseApiError } from '../../utils/apiError'
import styles from './AdminCoursesPage.module.css'

const { Title, Text } = Typography
const LESSON_TYPES = ['video', 'text', 'quiz']

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

function normalizeQuizQuestion(item) {
  const options = Array.isArray(item?.options) ? item.options.slice(0, 4) : []
  while (options.length < 4)
    options.push('')

  return {
    question: item?.question || '',
    options,
    correct_index: Number.isInteger(item?.correct_index) ? item.correct_index : 0,
  }
}

function normalizeLessonPayload(values) {
  const lessonType = values.lesson_type || 'video'
  const quizQuestions = Array.isArray(values.quiz_questions)
    ? values.quiz_questions.map(normalizeQuizQuestion)
    : []

  if (lessonType === 'video') {
    return {
      ...values,
      lesson_type: 'video',
      content_markdown: '',
      quiz_questions: [],
      is_final: false,
    }
  }

  if (lessonType === 'text') {
    return {
      ...values,
      lesson_type: 'text',
      video_url: '',
      min_watch_time: 0,
      quiz_questions: [],
      is_final: false,
    }
  }

  return {
    ...values,
    lesson_type: 'quiz',
    video_url: '',
    content_markdown: '',
    min_watch_time: 0,
    quiz_questions: quizQuestions,
  }
}

function lessonTypeLabel(lessonType) {
  if (lessonType === 'text')
    return 'Text'
  if (lessonType === 'quiz')
    return 'Quiz'
  return 'Video'
}

function lessonTypeColor(lessonType) {
  if (lessonType === 'text')
    return 'purple'
  if (lessonType === 'quiz')
    return 'orange'
  return 'blue'
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
  const createLessonType = Form.useWatch('lesson_type', createForm)
  const editLessonType = Form.useWatch('lesson_type', editForm)
  const createMarkdown = Form.useWatch('content_markdown', createForm)
  const editMarkdown = Form.useWatch('content_markdown', editForm)

  const lessonTypeOptions = useMemo(
    () => LESSON_TYPES.map((value) => ({ value, label: lessonTypeLabel(value) })),
    []
  )

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
      const payload = normalizeLessonPayload(values)
      await createAdminLessonAPI({ ...payload, module: Number(moduleId) || moduleId })
      message.success('Lesson created successfully')
      createForm.resetFields()
      createForm.setFieldsValue({
        lesson_type: 'video',
        min_watch_time: 120,
        order_index: 0,
        is_final: false,
        quiz_questions: [{ question: '', options: ['', '', '', ''], correct_index: 0 }],
      })
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
      lesson_type: lesson.lesson_type || 'video',
      video_url: lesson.video_url,
      content_markdown: lesson.content_markdown,
      quiz_questions: Array.isArray(lesson.quiz_questions)
        ? lesson.quiz_questions.map(normalizeQuizQuestion)
        : [{ question: '', options: ['', '', '', ''], correct_index: 0 }],
      is_final: !!lesson.is_final,
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
      const payload = normalizeLessonPayload(values)
      await updateAdminLessonAPI(editingLesson.id, payload)
      message.success('Lesson updated successfully')
      handleCloseEditLessonModal()
      loadData()
    } catch (error) {
      const parsed = parseApiError(error, 'Failed to update lesson')
      applyFormApiError(editForm, parsed)
      message.error(parsed.message)
    }
  }

  async function handleDeleteLesson(lessonId) {
    try {
      await deleteAdminLessonAPI(lessonId)
      message.success('Lesson deleted successfully')
      loadData()
    } catch (error) {
      const parsed = parseApiError(error, 'Failed to delete lesson')
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
            Back to Modules
          </Button>
        </Space>
        <Title level={2} className={styles.title}>Lesson Management</Title>
        <Text className={styles.subtitle}>
          Module: <strong>{module?.title || `#${moduleId}`}</strong>
        </Text>
      </div>

      <Card title="Create New Lesson" className={styles.formCard}>
        <Alert
          type="info"
          showIcon
          message="Lesson Types"
          description="Video: URL + watch time. Text: markdown content. Quiz: multiple-choice questions with one correct answer."
          style={{ marginBottom: 16 }}
        />
        <Form form={createForm} layout="vertical" onFinish={handleCreateLesson} requiredMark={false}>
          <Form.Item name="title" label="Lesson Title" rules={[{ required: true, message: 'Please enter the lesson title' }]}>
            <Input placeholder="Lesson 1: Hello and Goodbye" />
          </Form.Item>

          <Form.Item name="lesson_type" label="Lesson Type" initialValue="video">
            <Select options={lessonTypeOptions} />
          </Form.Item>

          {createLessonType === 'video' && (
            <>
              <Form.Item name="video_url" label="Video URL" rules={[{ required: true, message: 'Please enter a video URL' }]}>
                <Input placeholder="https://youtube.com/..." />
              </Form.Item>
              <Form.Item name="min_watch_time" label="Minimum Watch Time (seconds)" initialValue={120}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </>
          )}

          {createLessonType === 'text' && (
            <>
              <Form.Item
                name="content_markdown"
                label="Markdown Content"
                rules={[{ required: true, message: 'Please enter lesson content' }]}
              >
                <Input.TextArea rows={10} placeholder="# Lesson title&#10;Write markdown content here..." />
              </Form.Item>
              <Card title="Preview" size="small">
                <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{createMarkdown || 'Nothing to preview yet.'}</pre>
              </Card>
            </>
          )}

          {createLessonType === 'quiz' && (
            <>
              <Text strong>Quiz Questions</Text>
              <div style={{ marginTop: 8, marginBottom: 12 }}>
                <Form.List name="quiz_questions">
                  {(fields, { add, remove }) => (
                    <Space direction="vertical" style={{ width: '100%' }} size={16}>
                      {fields.map(({ key, name, ...restField }, questionIndex) => (
                        <Card
                          key={key}
                          size="small"
                          title={`Question ${questionIndex + 1}`}
                          extra={fields.length > 1
                            ? (
                                <Button type="link" danger onClick={() => remove(name)}>
                                  Remove
                                </Button>
                              )
                            : null}
                        >
                          <Form.Item
                            {...restField}
                            name={[name, 'question']}
                            label="Question"
                            rules={[{ required: true, message: 'Please enter question text' }]}
                          >
                            <Input.TextArea rows={2} />
                          </Form.Item>

                          {[0, 1, 2, 3].map((optionIndex) => (
                            <Form.Item
                              key={`${key}-${optionIndex}`}
                              {...restField}
                              name={[name, 'options', optionIndex]}
                              label={`Option ${optionIndex + 1}`}
                              rules={[{ required: true, message: 'Please enter option text' }]}
                            >
                              <Input />
                            </Form.Item>
                          ))}

                          <Form.Item
                            {...restField}
                            name={[name, 'correct_index']}
                            label="Correct Answer"
                            rules={[{ required: true, message: 'Please choose the correct answer' }]}
                          >
                            <Radio.Group
                              options={[
                                { label: 'Option 1', value: 0 },
                                { label: 'Option 2', value: 1 },
                                { label: 'Option 3', value: 2 },
                                { label: 'Option 4', value: 3 },
                              ]}
                            />
                          </Form.Item>
                        </Card>
                      ))}

                      <Button
                        type="dashed"
                        onClick={() => add({ question: '', options: ['', '', '', ''], correct_index: 0 })}
                        block
                        icon={<PlusOutlined />}
                      >
                        Add Question
                      </Button>
                    </Space>
                  )}
                </Form.List>
              </div>

              <Form.Item name="is_final" label="Final Module Quiz" valuePropName="checked" initialValue={false}>
                <Switch />
              </Form.Item>
            </>
          )}

          <Form.Item name="order_index" label="Order" initialValue={0}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
            Create Lesson
          </Button>
        </Form>
      </Card>

      <Card title="Lesson List" className={styles.tableCard}>
        <Table
          rowKey="id"
          loading={loading}
          dataSource={lessons}
          pagination={{ pageSize: 12 }}
          columns={[
            { title: 'Title', dataIndex: 'title', key: 'title' },
            {
              title: 'Type',
              dataIndex: 'lesson_type',
              key: 'lesson_type',
              width: 120,
              render: (lessonType) => <Tag color={lessonTypeColor(lessonType)}>{lessonTypeLabel(lessonType)}</Tag>,
            },
            {
              title: 'Final Quiz',
              dataIndex: 'is_final',
              key: 'is_final',
              width: 120,
              render: (isFinal) => (isFinal ? <Tag color="green">Final</Tag> : '-'),
            },
            {
              title: 'Content',
              key: 'content',
              ellipsis: true,
              render: (_, record) => {
                if (record.lesson_type === 'video')
                  return record.video_url || '-'
                if (record.lesson_type === 'text')
                  return record.content_markdown ? 'Markdown content' : '-'
                if (Array.isArray(record.quiz_questions))
                  return `${record.quiz_questions.length} question(s)`
                return '-'
              },
            },
            { title: 'Watch Time', dataIndex: 'min_watch_time', key: 'min_watch_time', width: 120 },
            { title: 'Order', dataIndex: 'order_index', key: 'order_index', width: 100 },
            {
              title: 'Actions',
              key: 'actions',
              width: 260,
              render: (_, record) => (
                <Space>
                  <Button icon={<EditOutlined />} onClick={() => handleOpenEditLessonModal(record)}>
                    Edit
                  </Button>
                  <Popconfirm
                    title="Delete this lesson?"
                    description="This action cannot be undone."
                    okText="Delete"
                    cancelText="Cancel"
                    onConfirm={() => handleDeleteLesson(record.id)}
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
        title="Edit Lesson"
        open={isEditModalOpen}
        onCancel={handleCloseEditLessonModal}
        onOk={() => editForm.submit()}
        okText="Save"
        cancelText="Cancel"
      >
        <Form form={editForm} layout="vertical" onFinish={handleUpdateLesson} requiredMark={false}>
          <Form.Item name="title" label="Lesson Title" rules={[{ required: true, message: 'Please enter the lesson title' }]}>
            <Input />
          </Form.Item>

          <Form.Item name="lesson_type" label="Lesson Type">
            <Select options={lessonTypeOptions} />
          </Form.Item>

          {editLessonType === 'video' && (
            <>
              <Form.Item name="video_url" label="Video URL" rules={[{ required: true, message: 'Please enter a video URL' }]}>
                <Input />
              </Form.Item>
              <Form.Item name="min_watch_time" label="Minimum Watch Time (seconds)" rules={[{ required: true, message: 'Please enter minimum watch time' }]}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </>
          )}

          {editLessonType === 'text' && (
            <>
              <Form.Item
                name="content_markdown"
                label="Markdown Content"
                rules={[{ required: true, message: 'Please enter lesson content' }]}
              >
                <Input.TextArea rows={10} />
              </Form.Item>
              <Card title="Preview" size="small">
                <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{editMarkdown || 'Nothing to preview yet.'}</pre>
              </Card>
            </>
          )}

          {editLessonType === 'quiz' && (
            <>
              <Form.List name="quiz_questions">
                {(fields, { add, remove }) => (
                  <Space direction="vertical" style={{ width: '100%' }} size={16}>
                    {fields.map(({ key, name, ...restField }, questionIndex) => (
                      <Card
                        key={key}
                        size="small"
                        title={`Question ${questionIndex + 1}`}
                        extra={fields.length > 1
                          ? (
                              <Button type="link" danger onClick={() => remove(name)}>
                                Remove
                              </Button>
                            )
                          : null}
                      >
                        <Form.Item
                          {...restField}
                          name={[name, 'question']}
                          label="Question"
                          rules={[{ required: true, message: 'Please enter question text' }]}
                        >
                          <Input.TextArea rows={2} />
                        </Form.Item>

                        {[0, 1, 2, 3].map((optionIndex) => (
                          <Form.Item
                            key={`${key}-${optionIndex}`}
                            {...restField}
                            name={[name, 'options', optionIndex]}
                            label={`Option ${optionIndex + 1}`}
                            rules={[{ required: true, message: 'Please enter option text' }]}
                          >
                            <Input />
                          </Form.Item>
                        ))}

                        <Form.Item
                          {...restField}
                          name={[name, 'correct_index']}
                          label="Correct Answer"
                          rules={[{ required: true, message: 'Please choose the correct answer' }]}
                        >
                          <Radio.Group
                            options={[
                              { label: 'Option 1', value: 0 },
                              { label: 'Option 2', value: 1 },
                              { label: 'Option 3', value: 2 },
                              { label: 'Option 4', value: 3 },
                            ]}
                          />
                        </Form.Item>
                      </Card>
                    ))}

                    <Button
                      type="dashed"
                      onClick={() => add({ question: '', options: ['', '', '', ''], correct_index: 0 })}
                      block
                      icon={<PlusOutlined />}
                    >
                      Add Question
                    </Button>
                  </Space>
                )}
              </Form.List>

              <Form.Item name="is_final" label="Final Module Quiz" valuePropName="checked">
                <Switch />
              </Form.Item>
            </>
          )}

          <Form.Item name="order_index" label="Order" rules={[{ required: true, message: 'Please enter lesson order' }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
