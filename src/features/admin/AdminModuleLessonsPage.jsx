import { useEffect, useRef, useState } from 'react'
import {
  Button,
  Card,
  Descriptions,
  Form,
  Input,
  Modal,
  Space,
  Spin,
  Table,
  Tabs,
  Tag,
  Typography,
  message,
} from 'antd'
import { EyeOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import { AdminEntityDetailFrame } from '../../components/admin/AdminEntityDetailFrame'
import { AdminListCreateLayout } from '../../components/admin/AdminListCreateLayout'
import { TableEditDeleteActions } from '../../components/admin/TableEditDeleteActions'
import {
  deleteAdminLessonAPI,
  extendStoreAdminModuleAPI,
  getAdminLessonPipelineStatusAPI,
  getAdminLessonPipelineStatusBatchAPI,
  getAdminLessonsAPI,
  getAdminModuleByIdAPI,
} from './adminService'
import { applyFormApiError, parseApiError } from '../../utils/apiError'
import styles from './AdminCoursesPage.module.css'
import detailStyles from './AdminCourseDetailPage.module.css'

const { Text } = Typography
const PIPELINE_POLL_MS = 10000
const PIPELINE_STATUS_BATCH_SIZE = 100
const SUB_LESSONS = 'lessons'

function lessonNeedsPipelinePoll(lesson) {
  const publicationStatus = lesson?.publication_status
  return publicationStatus === 'draft' || publicationStatus === 'processing'
}

function publicationStatusTagColor(status) {
  if (status === 'ready')
    return 'success'
  if (status === 'failed')
    return 'error'
  if (status === 'processing')
    return 'blue'
  return 'default'
}

function applyPipelineSnapshot(row, pipeline) {
  return {
    ...row,
    publication_status: pipeline.publication_status,
    is_active: pipeline.is_active,
    publication_error: pipeline.publication_error ?? '',
    transcript_status: pipeline.transcript_status,
    transcript_error: pipeline.transcript_error ?? '',
    _pipelineSnapshot: pipeline,
  }
}

async function fetchAndMergePipelineRows(rows) {
  const pending = rows.filter(lessonNeedsPipelinePoll)
  if (pending.length === 0)
    return rows
  const merged = rows.map((row) => ({ ...row }))
  try {
    const lessonIds = pending.map((lesson) => lesson.id)
    const snapshotByLessonId = new Map()
    for (let offset = 0; offset < lessonIds.length; offset += PIPELINE_STATUS_BATCH_SIZE) {
      const slice = lessonIds.slice(offset, offset + PIPELINE_STATUS_BATCH_SIZE)
      const { records } = await getAdminLessonPipelineStatusBatchAPI(slice)
      for (const snapshot of records)
        snapshotByLessonId.set(String(snapshot.lesson_id), snapshot)
    }
    for (const lesson of pending) {
      const pipeline = snapshotByLessonId.get(String(lesson.id))
      if (!pipeline)
        continue
      const index = merged.findIndex((r) => r.id === lesson.id)
      if (index >= 0)
        merged[index] = applyPipelineSnapshot(merged[index], pipeline)
    }
  }
  catch {
    // keep existing row on transient errors
  }
  return merged
}

function lessonTypeLabel(lessonType) {
  if (lessonType === 'lesson')
    return 'Lesson'
  if (lessonType === 'quiz')
    return 'Quiz'
  return 'Lesson'
}

function lessonTypeColor(lessonType) {
  if (lessonType === 'lesson')
    return 'blue'
  if (lessonType === 'quiz')
    return 'orange'
  return 'blue'
}

function toLessonOrderPayload(lessonList) {
  return lessonList.map((lesson, index) => ({
    id: String(lesson.id),
    order_index: index + 1,
  }))
}

function reorderByIds(items, fromId, toId) {
  const fromIndex = items.findIndex((item) => String(item.id) === String(fromId))
  const toIndex = items.findIndex((item) => String(item.id) === String(toId))
  if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex)
    return items
  const next = [...items]
  const [moved] = next.splice(fromIndex, 1)
  next.splice(toIndex, 0, moved)
  return next
}

export function AdminModuleLessonsPage() {
  const { moduleId } = useParams()
  const navigate = useNavigate()
  const [saveSubmitting, setSaveSubmitting] = useState(false)
  const [loading, setLoading] = useState(false)
  const [module, setModule] = useState(null)
  const [lessonOrderPayload, setLessonOrderPayload] = useState([])
  const [draggingLessonId, setDraggingLessonId] = useState(null)
  const [lessons, setLessons] = useState([])
  const [pipelineModalOpen, setPipelineModalOpen] = useState(false)
  const [pipelineModalLoading, setPipelineModalLoading] = useState(false)
  const [pipelineDetail, setPipelineDetail] = useState(null)
  const [pipelineModalTitle, setPipelineModalTitle] = useState('')

  const lessonsRef = useRef([])

  const [moduleForm] = Form.useForm()

  async function loadData() {
    if (!moduleId) return

    setLoading(true)
    try {
      const [moduleData, lessonsData] = await Promise.all([
        getAdminModuleByIdAPI(moduleId),
        getAdminLessonsAPI(moduleId),
      ])
      setModule(moduleData)
      moduleForm.setFieldsValue({
        title: moduleData.title,
      })
      const baseList = Array.isArray(lessonsData) ? lessonsData : []
      const mergedList = await fetchAndMergePipelineRows(baseList)
      setLessons(mergedList)
      setLessonOrderPayload(toLessonOrderPayload(mergedList))
    } catch (error) {
      const parsed = parseApiError(error, 'Failed to load lessons')
      message.error(parsed.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  // Intentionally only re-run when module changes; loadData closes over moduleId.
  // eslint-disable-next-line react-hooks/exhaustive-deps -- module-scoped reload only
  }, [moduleId])

  lessonsRef.current = lessons

  useEffect(() => {
    if (!moduleId)
      return undefined
    const timer = window.setInterval(async () => {
      const current = lessonsRef.current
      if (!current.length)
        return
      const pending = current.filter(lessonNeedsPipelinePoll)
      if (pending.length === 0)
        return
      const next = await fetchAndMergePipelineRows(current)
      setLessons(next)
    }, PIPELINE_POLL_MS)
    return () => window.clearInterval(timer)
  }, [moduleId])

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

  async function handleOpenPipelineModal(lesson) {
    setPipelineModalTitle(lesson?.title || 'Pipeline')
    setPipelineModalOpen(true)
    setPipelineModalLoading(true)
    setPipelineDetail(null)
    try {
      const detail = await getAdminLessonPipelineStatusAPI(lesson.id)
      setPipelineDetail(detail)
    }
    catch (error) {
      const parsed = parseApiError(error, 'Failed to load pipeline status')
      message.error(parsed.message)
    }
    finally {
      setPipelineModalLoading(false)
    }
  }

  function handleClosePipelineModal() {
    setPipelineModalOpen(false)
    setPipelineDetail(null)
    setPipelineModalTitle('')
  }

  function handleDragStart(lessonId) {
    setDraggingLessonId(String(lessonId))
  }

  function handleDragOver(event) {
    event.preventDefault()
  }

  function handleDrop(targetLessonId) {
    if (!draggingLessonId)
      return
    const reordered = reorderByIds(lessons, draggingLessonId, targetLessonId)
    setLessons(reordered)
    setLessonOrderPayload(toLessonOrderPayload(reordered))
    setDraggingLessonId(null)
  }

  function handleDragEnd() {
    setDraggingLessonId(null)
  }

  async function handleSaveModuleDetail(values) {
    if (!moduleId) return
    setSaveSubmitting(true)
    try {
      await extendStoreAdminModuleAPI(moduleId, {
        title: values.title,
        lessons: lessonOrderPayload,
      })
      message.success('Module updated successfully')
      loadData()
    } catch (error) {
      const parsed = parseApiError(error, 'Failed to save module detail')
      applyFormApiError(moduleForm, parsed)
      message.error(parsed.message)
    } finally {
      setSaveSubmitting(false)
    }
  }

  return (
    <AdminEntityDetailFrame
      backPath={module?.course ? `/admin/course/detail/${module.course}?sub=modules` : '/admin/courses'}
      backLabel="Back to modules"
      title={module?.title || 'Module detail'}
      subtitle={moduleId ? `ID: ${moduleId}` : null}
    >
      <Card
        title="Module information"
        className={`${styles.formCard} ${detailStyles.infoCard}`}
        loading={loading && !module}
      >
        <Form
          form={moduleForm}
          layout="vertical"
          onFinish={handleSaveModuleDetail}
          requiredMark={false}
        >
          <Form.Item name="title" label="Title" rules={[{ required: true, message: 'Title is required' }]}>
            <Input placeholder="Module title" />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={saveSubmitting} size="large">
            Save changes
          </Button>
        </Form>
      </Card>

      <div className={detailStyles.lowerSection}>
        <Text type="secondary" className={detailStyles.lowerHint}>
          Lessons in this module. Create or edit opens lesson detail page.
        </Text>
        <Tabs
          activeKey={SUB_LESSONS}
          className={detailStyles.subTabs}
          items={[
            {
              key: SUB_LESSONS,
              label: 'Lessons',
              children: (
                <AdminListCreateLayout
                  title="Lesson list"
                  cardClassName={styles.tableCard}
                  createLabel="Create new lesson"
                  onCreateClick={() => navigate(`/admin/lesson/detail/new?moduleId=${moduleId}`)}
                >
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
              title: 'Publication',
              key: 'publication_status',
              width: 130,
              render: (_, record) => {
                const publicationStatus = record.publication_status || 'ready'
                return (
                  <Space direction="vertical" size={0}>
                    <Tag color={publicationStatusTagColor(publicationStatus)}>
                      {publicationStatus}
                    </Tag>
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      {record.is_active ? 'active' : 'inactive'}
                    </Text>
                  </Space>
                )
              },
            },
            {
              title: 'Transcript',
              dataIndex: 'transcript_status',
              key: 'transcript_status',
              width: 130,
              render: (value) => <Tag>{value || '—'}</Tag>,
            },
            {
              title: 'Pipeline',
              key: 'pipeline',
              width: 100,
              render: (_, record) => (
                <Button type="text" icon={<EyeOutlined />} onClick={() => handleOpenPipelineModal(record)} />
              ),
            },
            {
              title: 'Actions',
              key: 'actions',
              width: 90,
              render: (_, record) => (
                <TableEditDeleteActions
                  onEdit={() => navigate(`/admin/lesson/detail/${record.id}`)}
                  onDelete={() => handleDeleteLesson(record.id)}
                  deleteTitle="Delete this lesson?"
                />
              ),
            },
          ]}
          onRow={(record) => ({
            draggable: true,
            onDragStart: () => handleDragStart(record.id),
            onDragOver: handleDragOver,
            onDrop: () => handleDrop(record.id),
            onDragEnd: handleDragEnd,
            className: draggingLessonId === String(record.id) ? styles.draggingRow : styles.draggableRow,
          })}
        />
                </AdminListCreateLayout>
              ),
            },
          ]}
        />
      </div>

      <Modal
        title={pipelineModalTitle ? `Pipeline — ${pipelineModalTitle}` : 'Pipeline'}
        open={pipelineModalOpen}
        onCancel={handleClosePipelineModal}
        footer={null}
        width={720}
      >
        <Spin spinning={pipelineModalLoading}>
          {pipelineDetail
            ? (
                <>
                  <Descriptions bordered size="small" column={1} style={{ marginBottom: 16 }}>
                    <Descriptions.Item label="Publication">{pipelineDetail.publication_status}</Descriptions.Item>
                    <Descriptions.Item label="Learner active">{pipelineDetail.is_active ? 'yes' : 'no'}</Descriptions.Item>
                    <Descriptions.Item label="Publication error">
                      {pipelineDetail.publication_error || '—'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Transcript">{pipelineDetail.transcript_status}</Descriptions.Item>
                    <Descriptions.Item label="Transcript error">
                      {pipelineDetail.transcript_error || '—'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Supported for ingestion">
                      {pipelineDetail.supported_for_ingestion ? 'yes' : 'no'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Active chunks">{pipelineDetail.active_chunk_count}</Descriptions.Item>
                    <Descriptions.Item label="Has active chunk set">
                      {pipelineDetail.has_active_chunk_set ? 'yes' : 'no'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Isolation ready">
                      {pipelineDetail.active_chunk_set_isolation_ready ? 'yes' : 'no'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Last indexed at">
                      {pipelineDetail.last_indexed_at || '—'}
                    </Descriptions.Item>
                  </Descriptions>
                  <Text strong>Raw payload</Text>
                  <pre style={{ maxHeight: 280, overflow: 'auto', fontSize: 12, marginTop: 8 }}>
                    {JSON.stringify(pipelineDetail, null, 2)}
                  </pre>
                </>
              )
            : (
                !pipelineModalLoading && <Text type="secondary">No data</Text>
              )}
        </Spin>
      </Modal>

    </AdminEntityDetailFrame>
  )
}
