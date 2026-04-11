import { useEffect, useMemo, useRef, useState } from 'react'
import { Button, Space, Table, Tabs, Tag, Typography, message } from 'antd'
import { ReloadOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { AdminListCreateLayout } from '../../components/admin/AdminListCreateLayout'
import {
  getAdminLessonsAPI,
  getAdminLessonPipelineStatusBatchAPI,
  getAdminModulesAPI,
} from './adminService'
import { parseApiError } from '../../utils/apiError'
import styles from './AdminCoursesPage.module.css'

const { Text } = Typography

const TAB_ALL = 'all'
const TAB_UPLOADING = 'uploading'
const PIPELINE_POLL_MS = 10000
const PIPELINE_STATUS_BATCH_SIZE = 100

function publicationStatusTagColor(status) {
  if (status === 'ready')
    return 'success'
  if (status === 'failed')
    return 'error'
  if (status === 'processing')
    return 'blue'
  return 'default'
}

function isUploadingLesson(lesson) {
  const publicationStatus = String(lesson?.publication_status || '').toLowerCase()
  const transcriptStatus = String(lesson?.transcript_status || '').toLowerCase()
  return publicationStatus === 'draft' || publicationStatus === 'processing' || transcriptStatus === 'processing'
}

function applyPipelineSnapshot(lesson, pipeline) {
  return {
    ...lesson,
    publication_status: pipeline.publication_status,
    is_active: pipeline.is_active,
    publication_error: pipeline.publication_error ?? '',
    transcript_status: pipeline.transcript_status,
    transcript_error: pipeline.transcript_error ?? '',
    _pipelineSnapshot: pipeline,
  }
}

function sortByUpdatedAtDesc(lessons) {
  return [...lessons].sort((firstLesson, secondLesson) => {
    const firstTimestamp = new Date(firstLesson?.updated_at || 0).getTime()
    const secondTimestamp = new Date(secondLesson?.updated_at || 0).getTime()
    return secondTimestamp - firstTimestamp
  })
}

export function AdminLessonUploadPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [refreshingStatus, setRefreshingStatus] = useState(false)
  const [lessons, setLessons] = useState([])
  const [moduleTitleById, setModuleTitleById] = useState({})
  const [activeTab, setActiveTab] = useState(TAB_UPLOADING)
  const lessonsRef = useRef([])

  async function loadLessons() {
    setLoading(true)
    try {
      const [lessonList, moduleList] = await Promise.all([
        getAdminLessonsAPI(),
        getAdminModulesAPI(),
      ])
      setLessons(Array.isArray(lessonList) ? lessonList : [])
      const moduleMap = {}
      for (const moduleRecord of (Array.isArray(moduleList) ? moduleList : []))
        moduleMap[String(moduleRecord.id)] = moduleRecord.title || String(moduleRecord.id)
      setModuleTitleById(moduleMap)
    }
    catch (error) {
      const parsed = parseApiError(error, 'Failed to load lesson uploads')
      message.error(parsed.message)
    }
    finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLessons()
  }, [])

  lessonsRef.current = lessons

  async function refreshProcessingStatuses() {
    const currentLessons = lessonsRef.current
    if (!currentLessons.length)
      return

    const pendingLessons = currentLessons.filter(isUploadingLesson)
    if (!pendingLessons.length)
      return

    const lessonIds = pendingLessons.map((lesson) => String(lesson.id))
    const snapshotByLessonId = new Map()

    for (let offset = 0; offset < lessonIds.length; offset += PIPELINE_STATUS_BATCH_SIZE) {
      const lessonIdSlice = lessonIds.slice(offset, offset + PIPELINE_STATUS_BATCH_SIZE)
      const { records } = await getAdminLessonPipelineStatusBatchAPI(lessonIdSlice)
      for (const pipelineSnapshot of records)
        snapshotByLessonId.set(String(pipelineSnapshot.lesson_id), pipelineSnapshot)
    }

    setLessons((previousLessons) => previousLessons.map((lesson) => {
      const pipelineSnapshot = snapshotByLessonId.get(String(lesson.id))
      if (!pipelineSnapshot)
        return lesson
      return applyPipelineSnapshot(lesson, pipelineSnapshot)
    }))
  }

  async function handleManualRefresh() {
    // Initial load still needs list + module mapping; later refresh should poll status API only.
    if (!lessonsRef.current.length) {
      await loadLessons()
      return
    }

    setRefreshingStatus(true)
    try {
      await refreshProcessingStatuses()
    }
    catch (error) {
      const parsed = parseApiError(error, 'Failed to refresh processing status')
      message.error(parsed.message)
    }
    finally {
      setRefreshingStatus(false)
    }
  }

  useEffect(() => {
    const timer = window.setInterval(async () => {
      try {
        await refreshProcessingStatuses()
      }
      catch {
        // Keep previous data on transient polling errors
      }
    }, PIPELINE_POLL_MS)

    return () => window.clearInterval(timer)
  }, [])

  const uploadingLessons = useMemo(
    () => sortByUpdatedAtDesc(lessons.filter(isUploadingLesson)),
    [lessons]
  )
  const allLessons = useMemo(
    () => sortByUpdatedAtDesc(lessons),
    [lessons]
  )

  const lessonColumns = [
    {
      title: 'Title',
      key: 'title',
      render: (_, record) => (
        <Button type="link" onClick={() => navigate(`/admin/lesson/detail/${record.id}`)}>
          {record.title}
        </Button>
      ),
    },
    {
      title: 'Module',
      key: 'module',
      width: 220,
      render: (_, record) => {
        const moduleId = record.module == null ? null : String(record.module)
        if (!moduleId)
          return <Text type="secondary">—</Text>
        const moduleTitle = moduleTitleById[moduleId]
        return <Text>{moduleTitle || moduleId}</Text>
      },
    },
    {
      title: 'Type',
      dataIndex: 'lesson_type',
      key: 'lesson_type',
      width: 100,
      render: (lessonType) => <Tag color={lessonType === 'quiz' ? 'orange' : 'blue'}>{lessonType || 'lesson'}</Tag>,
    },
    {
      title: 'Publication',
      key: 'publication_status',
      width: 140,
      render: (_, record) => (
        <Tag color={publicationStatusTagColor(record.publication_status)}>
          {record.publication_status || 'ready'}
        </Tag>
      ),
    },
    {
      title: 'Transcript',
      key: 'transcript_status',
      width: 130,
      render: (_, record) => <Tag>{record.transcript_status || '—'}</Tag>,
    },
    {
      title: 'Updated',
      dataIndex: 'updated_at',
      key: 'updated_at',
      width: 180,
      render: (updatedAt) => (updatedAt ? new Date(updatedAt).toLocaleString() : '—'),
    },
  ]

  return (
    <AdminListCreateLayout
      title="Lesson upload"
      cardClassName={styles.tableCard}
      createLabel="Create from module detail"
      onCreateClick={() => navigate('/admin/courses')}
      disabledCreate
      footerExtra={(
        <Button icon={<ReloadOutlined />} onClick={handleManualRefresh} loading={refreshingStatus || loading}>
          Refresh
        </Button>
      )}
    >
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: TAB_UPLOADING,
            label: `Uploading lesson (${uploadingLessons.length})`,
            children: (
              <Table
                rowKey="id"
                loading={loading}
                dataSource={uploadingLessons}
                columns={lessonColumns}
                pagination={{ pageSize: 10 }}
              />
            ),
          },
          {
            key: TAB_ALL,
            label: `All lesson (${allLessons.length})`,
            children: (
              <Table
                rowKey="id"
                loading={loading}
                dataSource={allLessons}
                columns={lessonColumns}
                pagination={{ pageSize: 12 }}
              />
            ),
          },
        ]}
      />
    </AdminListCreateLayout>
  )
}
