import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Radio,
  Select,
  Space,
  Upload,
  message,
} from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { AdminEntityDetailFrame } from '../../components/admin/AdminEntityDetailFrame'
import {
  createAdminLessonAPI,
  getAdminLessonByIdAPI,
  updateAdminLessonAPI,
} from './adminService'
import { applyFormApiError, parseApiError } from '../../utils/apiError'
import styles from './AdminCoursesPage.module.css'
import detailStyles from './AdminCourseDetailPage.module.css'

const LESSON_TYPES = ['lesson', 'quiz']
const LESSON_AUTO_TRANSCRIBE_ENABLED = false

function toNativeFile(uploadValue) {
  const firstEntry = Array.isArray(uploadValue) ? uploadValue[0] : uploadValue
  if (!firstEntry)
    return null
  if (firstEntry.originFileObj instanceof File)
    return firstEntry.originFileObj
  if (firstEntry instanceof File)
    return firstEntry
  return null
}

function lessonTypeLabel(lessonType) {
  if (lessonType === 'lesson')
    return 'Lesson'
  if (lessonType === 'quiz')
    return 'Quiz'
  return 'Lesson'
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
  const lessonType = values.lesson_type || 'lesson'
  const quizQuestions = Array.isArray(values.quiz_questions)
    ? values.quiz_questions.map(normalizeQuizQuestion)
    : []
  const transcriptFileList = Array.isArray(values.transcript_file) ? values.transcript_file : []
  const firstTranscriptFile = toNativeFile(transcriptFileList)
  const transcriptText = typeof values.transcript_text === 'string'
    ? values.transcript_text.trim()
    : ''

  if (lessonType === 'lesson') {
    const fileList = Array.isArray(values.video_file) ? values.video_file : []
    const firstFile = toNativeFile(fileList)
    return {
      ...values,
      lesson_type: 'lesson',
      video_file: firstFile,
      transcript_file: firstTranscriptFile,
      transcript_text: transcriptText,
      quiz_questions: [],
    }
  }

  return {
    ...values,
    lesson_type: 'quiz',
    video_url: '',
    video_file: null,
    transcript_file: undefined,
    transcript_text: undefined,
    content_markdown: '',
    min_watch_time: 0,
    quiz_questions: quizQuestions,
  }
}

export function AdminLessonDetailPage() {
  const { lessonId } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [lesson, setLesson] = useState(null)
  const [resolvedModuleId, setResolvedModuleId] = useState(searchParams.get('moduleId') || null)
  const lessonType = Form.useWatch('lesson_type', form)
  const lessonVideoFile = Form.useWatch('video_file', form)
  const markdownValue = Form.useWatch('content_markdown', form)
  const isCreateMode = lessonId === 'new'

  const lessonTypeOptions = useMemo(
    () => LESSON_TYPES.map((value) => ({ value, label: lessonTypeLabel(value) })),
    []
  )

  useEffect(() => {
    async function loadLessonDetail() {
      if (isCreateMode) {
        form.setFieldsValue({
          lesson_type: 'lesson',
          min_watch_time: 120,
          order_index: 0,
          transcript_text: '',
          transcript_file: [],
          quiz_questions: [{ question: '', options: ['', '', '', ''], correct_index: 0 }],
        })
        return
      }

      setLoading(true)
      try {
        const lessonDetail = await getAdminLessonByIdAPI(lessonId)
        setLesson(lessonDetail)
        setResolvedModuleId(String(lessonDetail.module))
        form.setFieldsValue({
          title: lessonDetail.title,
          lesson_type: lessonDetail.lesson_type || 'lesson',
          video_url: lessonDetail.video_url,
          video_file: [],
          transcript_text: lessonDetail.transcript_text || '',
          transcript_file: [],
          content_markdown: lessonDetail.content_markdown,
          quiz_questions: Array.isArray(lessonDetail.quiz_questions)
            ? lessonDetail.quiz_questions.map(normalizeQuizQuestion)
            : [{ question: '', options: ['', '', '', ''], correct_index: 0 }],
          min_watch_time: lessonDetail.min_watch_time,
          order_index: lessonDetail.order_index,
        })
      }
      catch (error) {
        const parsed = parseApiError(error, 'Failed to load lesson detail')
        message.error(parsed.message)
      }
      finally {
        setLoading(false)
      }
    }

    loadLessonDetail()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId, isCreateMode])

  async function handleSubmit(values) {
    const moduleIdValue = resolvedModuleId || searchParams.get('moduleId')
    if (!moduleIdValue) {
      message.error('Missing moduleId. Open this screen from module detail.')
      return
    }

    setSubmitting(true)
    try {
      const videoFileList = Array.isArray(values.video_file) ? values.video_file : []
      const transcriptFileList = Array.isArray(values.transcript_file) ? values.transcript_file : []
      const transcriptText = (values.transcript_text || '').trim()
      const hasVideoFile = Boolean(toNativeFile(videoFileList))
      const hasTranscriptFile = Boolean(toNativeFile(transcriptFileList))
      const hasTranscriptText = Boolean(transcriptText)
      if (lessonType === 'lesson') {
        if (!LESSON_AUTO_TRANSCRIBE_ENABLED && hasVideoFile && !hasTranscriptFile && !hasTranscriptText) {
          message.error('Transcript text or transcript .txt file is required when uploading video.')
          setSubmitting(false)
          return
        }
      }

      const payload = normalizeLessonPayload(values)
      if (isCreateMode) {
        await createAdminLessonAPI({ ...payload, module: Number(moduleIdValue) || moduleIdValue })
        message.success('Lesson created successfully')
      } else {
        await updateAdminLessonAPI(lessonId, payload)
        message.success('Lesson updated successfully')
      }
      navigate(`/admin/module/detail/${moduleIdValue}?sub=lessons`)
    }
    catch (error) {
      const parsed = parseApiError(error, isCreateMode ? 'Failed to create lesson' : 'Failed to update lesson')
      applyFormApiError(form, parsed)
      message.error(parsed.message)
    }
    finally {
      setSubmitting(false)
    }
  }

  const backModuleId = resolvedModuleId || searchParams.get('moduleId')
  const hasSelectedVideoFile = Array.isArray(lessonVideoFile) && lessonVideoFile.length > 0
  const shouldShowTranscriptSection = lessonType === 'lesson'
  return (
    <AdminEntityDetailFrame
      backPath={backModuleId ? `/admin/module/detail/${backModuleId}?sub=lessons` : '/admin/courses'}
      backLabel="Back to module lessons"
      title={isCreateMode ? 'Create lesson' : (lesson?.title || 'Lesson detail')}
      subtitle={!isCreateMode && lessonId ? `ID: ${lessonId}` : null}
    >
      <Card
        title="Lesson information"
        className={`${styles.formCard} ${detailStyles.infoCard}`}
        loading={loading}
      >
        <Alert
          type="info"
          showIcon
          message="Lesson Types"
          description="Lesson: video URL + summary + watch time. Quiz: multiple-choice questions with one correct answer."
          style={{ marginBottom: 16 }}
        />
        <Form form={form} layout="vertical" onFinish={handleSubmit} requiredMark={false}>
          <Form.Item name="title" label="Lesson Title" rules={[{ required: true, message: 'Please enter the lesson title' }]}>
            <Input placeholder="Lesson 1: Hello and Goodbye" />
          </Form.Item>

          <Form.Item name="lesson_type" label="Lesson Type" initialValue="lesson">
            <Select options={lessonTypeOptions} />
          </Form.Item>

          {lessonType === 'lesson' && (
            <>
              <Form.Item name="video_url" label="Video URL (optional if uploading file)">
                <Input placeholder="https://youtube.com/..." />
              </Form.Item>
              <Form.Item
                name="video_file"
                label="Video File Upload"
                valuePropName="fileList"
                getValueFromEvent={(event) => (Array.isArray(event) ? event : event?.fileList)}
              >
                <Upload beforeUpload={() => false} maxCount={1}>
                  <Button>Select Video File</Button>
                </Upload>
              </Form.Item>
              {shouldShowTranscriptSection && (
                <>
                  <Alert
                    type="info"
                    showIcon
                    message="Transcript for uploaded video"
                    description={
                      hasSelectedVideoFile
                        ? 'You can provide both transcript text and transcript .txt file. File content is prioritized when file is uploaded.'
                        : 'You can prepare transcript text/file now. It becomes required when uploading a video file.'
                    }
                    style={{ marginBottom: 16 }}
                  />
                  <Form.Item name="transcript_text" label="Transcript text">
                    <Input.TextArea rows={6} placeholder="Paste transcript text here..." />
                  </Form.Item>
                  <Form.Item
                    name="transcript_file"
                    label="Transcript file (.txt)"
                    valuePropName="fileList"
                    getValueFromEvent={(event) => (Array.isArray(event) ? event : event?.fileList)}
                  >
                    <Upload beforeUpload={() => false} maxCount={1} accept=".txt,text/plain">
                      <Button>Select Transcript File</Button>
                    </Upload>
                  </Form.Item>
                </>
              )}
              <Form.Item
                name="content_markdown"
                label="Summary"
                rules={[{ required: true, message: 'Please enter lesson summary' }]}
              >
                <Input.TextArea rows={10} placeholder="# Lesson summary&#10;Write markdown summary here..." />
              </Form.Item>
              <Form.Item name="min_watch_time" label="Minimum Watch Time (seconds)" initialValue={120}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
              <Card title="Preview" size="small">
                <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{markdownValue || 'Nothing to preview yet.'}</pre>
              </Card>
            </>
          )}

          {lessonType === 'quiz' && (
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
            </>
          )}

          <Form.Item name="order_index" label="Order" initialValue={0}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Button type="primary" htmlType="submit" loading={submitting} size="large">
            {isCreateMode ? 'Create lesson' : 'Save changes'}
          </Button>
        </Form>
      </Card>
    </AdminEntityDetailFrame>
  )
}
