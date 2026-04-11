import { useEffect, useState } from 'react'
import { Button, Card, Col, Form, Input, Row, Select, Tabs, Typography, message } from 'antd'
import { useParams, useSearchParams } from 'react-router-dom'
import { AdminEntityDetailFrame } from '../../components/admin/AdminEntityDetailFrame'
import { AdminCourseModulesPanel } from './AdminCourseModulesPanel'
import { AdminCourseAccessPanel } from './AdminCourseAccessPanel'
import { extendStoreAdminCourseAPI, getAdminCourseByIdAPI } from './adminService'
import { applyFormApiError, parseApiError } from '../../utils/apiError'
import styles from './AdminCoursesPage.module.css'
import detailStyles from './AdminCourseDetailPage.module.css'

const SUB_MODULES = 'modules'
const SUB_ACCESS = 'access'

const { Text } = Typography

export function AdminCourseDetailPage() {
  const { courseId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const [course, setCourse] = useState(null)
  const [moduleOrderPayload, setModuleOrderPayload] = useState([])
  const [infoLoading, setInfoLoading] = useState(false)
  const [saveSubmitting, setSaveSubmitting] = useState(false)
  const [infoForm] = Form.useForm()

  const subTab = searchParams.get('sub') === SUB_ACCESS ? SUB_ACCESS : SUB_MODULES

  function setSubTab(key) {
    const next = new URLSearchParams(searchParams)
    next.set('sub', key)
    next.delete('tab')
    setSearchParams(next, { replace: true })
  }

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (!tab) return
    const next = new URLSearchParams(searchParams)
    next.delete('tab')
    if (tab === 'lists' && !next.get('sub'))
      next.set('sub', SUB_MODULES)
    if (tab === 'info')
      next.delete('sub')
    setSearchParams(next, { replace: true })
  }, [searchParams, setSearchParams])

  async function loadCourse() {
    if (!courseId) return
    setInfoLoading(true)
    try {
      const data = await getAdminCourseByIdAPI(courseId)
      setCourse(data)
      infoForm.setFieldsValue({
        title: data.title,
        description: data.description,
        thumbnail_url: data.thumbnail_url,
        status: data.status,
      })
    } catch (error) {
      const parsed = parseApiError(error, 'Failed to load course')
      message.error(parsed.message)
    } finally {
      setInfoLoading(false)
    }
  }

  useEffect(() => {
    loadCourse()
  }, [courseId])

  async function handleSaveInfo(values) {
    if (!courseId) return
    setSaveSubmitting(true)
    try {
      await extendStoreAdminCourseAPI(courseId, {
        ...values,
        modules: moduleOrderPayload,
      })
      message.success('Course updated successfully')
      loadCourse()
    } catch (error) {
      const parsed = parseApiError(error, 'Failed to update course')
      applyFormApiError(infoForm, parsed)
      message.error(parsed.message)
    } finally {
      setSaveSubmitting(false)
    }
  }

  return (
    <AdminEntityDetailFrame
      backPath="/admin/courses"
      backLabel="Back to courses"
      title={course?.title || 'Course detail'}
      subtitle={courseId ? `ID: ${courseId}` : null}
    >
      <Card
        title="Course information"
        className={`${styles.formCard} ${detailStyles.infoCard}`}
        loading={infoLoading}
      >
        <Form
          form={infoForm}
          layout="vertical"
          onFinish={handleSaveInfo}
          requiredMark={false}
        >
          <Row gutter={[16, 0]}>
            <Col xs={24} md={12}>
              <Form.Item name="title" label="Title" rules={[{ required: true, message: 'Title is required' }]}>
                <Input placeholder="Course title" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="status" label="Status" rules={[{ required: true, message: 'Status is required' }]}>
                <Select
                  options={[
                    { value: 'draft', label: 'Draft' },
                    { value: 'published', label: 'Published' },
                    { value: 'archived', label: 'Archived' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="description" label="Description">
                <Input.TextArea rows={4} placeholder="Short description" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="thumbnail_url" label="Thumbnail URL">
                <Input placeholder="https://..." />
              </Form.Item>
            </Col>
          </Row>
          <Button type="primary" htmlType="submit" loading={saveSubmitting} size="large">
            Save changes
          </Button>
        </Form>
      </Card>

      <div className={detailStyles.lowerSection}>
        <Text type="secondary" className={detailStyles.lowerHint}>
          Modules and enrollments for this course.
        </Text>
        <Tabs
          activeKey={subTab}
          onChange={setSubTab}
          type="line"
          className={detailStyles.subTabs}
          items={[
            {
              key: SUB_MODULES,
              label: 'Modules',
              children: courseId
                ? (
                    <AdminCourseModulesPanel
                      courseId={courseId}
                      onModulesOrderChange={setModuleOrderPayload}
                    />
                  )
                : null,
            },
            {
              key: SUB_ACCESS,
              label: 'Course access',
              children: courseId ? <AdminCourseAccessPanel courseId={courseId} /> : null,
            },
          ]}
        />
      </div>
    </AdminEntityDetailFrame>
  )
}
