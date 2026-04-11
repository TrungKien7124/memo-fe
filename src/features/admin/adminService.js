import axiosClient from '../../services/axiosClient'
import { assertSuccessEnvelope, parseListPayload } from '../../utils/apiEnvelope'

function buildLessonFormData(payload) {
  const formData = new FormData()
  Object.entries(payload || {}).forEach(([key, value]) => {
    if (value === undefined || value === null) return
    if ((key === 'video_file' || key === 'transcript_file') && !(value instanceof File || value instanceof Blob))
      return
    if (key === 'quiz_questions')
      formData.append(key, JSON.stringify(value))
    else
      formData.append(key, value)
  })
  return formData
}

export async function getAdminCoursesAPI() {
  const { data } = await axiosClient.get('/api/courses/')
  return parseListPayload(data, 'admin courses list')
}

export async function createAdminCourseAPI(payload) {
  const { data } = await axiosClient.post('/api/courses/', payload)
  return assertSuccessEnvelope(data, 'admin course create')
}

export async function getAdminCourseByIdAPI(courseId) {
  const { data } = await axiosClient.get(`/api/courses/${courseId}/`)
  return assertSuccessEnvelope(data, 'admin course detail')
}

export async function updateAdminCourseAPI(courseId, payload) {
  const { data } = await axiosClient.patch(`/api/courses/${courseId}/`, payload)
  return assertSuccessEnvelope(data, 'admin course update')
}

export async function extendStoreAdminCourseAPI(courseId, payload) {
  const { data } = await axiosClient.patch(`/api/courses/${courseId}/extend-store/`, payload)
  return assertSuccessEnvelope(data, 'admin course extend store')
}

export async function deleteAdminCourseAPI(courseId) {
  const { data } = await axiosClient.delete(`/api/courses/${courseId}/`)
  return assertSuccessEnvelope(data, 'admin course delete')
}

export async function getAdminModulesAPI(courseId) {
  const { data } = await axiosClient.get('/api/modules/', {
    params: courseId ? { course: courseId } : {},
  })
  return parseListPayload(data, 'admin modules list')
}

export async function createAdminModuleAPI(payload) {
  const { data } = await axiosClient.post('/api/modules/', payload)
  return assertSuccessEnvelope(data, 'admin module create')
}

export async function getAdminModuleByIdAPI(moduleId) {
  const { data } = await axiosClient.get(`/api/modules/${moduleId}/`)
  return assertSuccessEnvelope(data, 'admin module detail')
}

export async function updateAdminModuleAPI(moduleId, payload) {
  const { data } = await axiosClient.patch(`/api/modules/${moduleId}/`, payload)
  return assertSuccessEnvelope(data, 'admin module update')
}

export async function extendStoreAdminModuleAPI(moduleId, payload) {
  const { data } = await axiosClient.patch(`/api/modules/${moduleId}/extend-store/`, payload)
  return assertSuccessEnvelope(data, 'admin module extend store')
}

export async function deleteAdminModuleAPI(moduleId) {
  const { data } = await axiosClient.delete(`/api/modules/${moduleId}/`)
  return assertSuccessEnvelope(data, 'admin module delete')
}

export async function getAdminLessonsAPI(moduleId) {
  const { data } = await axiosClient.get('/api/lessons/', {
    params: moduleId ? { module: moduleId } : {},
  })
  return parseListPayload(data, 'admin lessons list')
}

export async function getAdminLessonByIdAPI(lessonId) {
  const { data } = await axiosClient.get(`/api/lessons/${lessonId}/`)
  return assertSuccessEnvelope(data, 'admin lesson detail')
}

export async function getAdminLessonPipelineStatusAPI(lessonId) {
  const { data } = await axiosClient.get(`/api/lesson-ingestion/lessons/${lessonId}/status/`)
  return assertSuccessEnvelope(data, 'admin lesson pipeline status')
}

export async function getAdminLessonPipelineStatusBatchAPI(lessonIds) {
  const { data } = await axiosClient.post('/api/lesson-ingestion/lessons/status/batch/', {
    lesson_ids: lessonIds,
  })
  const envelopeData = assertSuccessEnvelope(data, 'admin lesson pipeline status batch')
  if (!envelopeData || typeof envelopeData !== 'object')
    throw new Error('Invalid admin lesson pipeline status batch envelope data')
  if (!Array.isArray(envelopeData.records))
    throw new Error('Missing records in admin lesson pipeline status batch')
  return {
    records: envelopeData.records,
    missing_lesson_ids: Array.isArray(envelopeData.missing_lesson_ids)
      ? envelopeData.missing_lesson_ids
      : [],
  }
}

export async function createAdminLessonAPI(payload) {
  const hasBinaryFile = Boolean(payload?.video_file) || Boolean(payload?.transcript_file)
  const body = hasBinaryFile ? buildLessonFormData(payload) : payload
  // Let Axios/browser set multipart boundary automatically for FormData.
  const { data } = await axiosClient.post('/api/lessons/', body)
  return assertSuccessEnvelope(data, 'admin lesson create')
}

export async function updateAdminLessonAPI(lessonId, payload) {
  const hasBinaryFile = Boolean(payload?.video_file) || Boolean(payload?.transcript_file)
  const body = hasBinaryFile ? buildLessonFormData(payload) : payload
  const { data } = await axiosClient.patch(`/api/lessons/${lessonId}/`, body)
  return assertSuccessEnvelope(data, 'admin lesson update')
}

export async function deleteAdminLessonAPI(lessonId) {
  const { data } = await axiosClient.delete(`/api/lessons/${lessonId}/`)
  return assertSuccessEnvelope(data, 'admin lesson delete')
}

export async function getCourseEnrollmentsAPI(courseId) {
  const { data } = await axiosClient.get(`/api/courses/${courseId}/enrollments/`)
  return parseListPayload(data, 'course enrollments list')
}

export async function grantCourseAccessAPI(courseId, userId) {
  const { data } = await axiosClient.post(`/api/courses/${courseId}/enrollments/`, {
    user_id: userId,
  })
  return assertSuccessEnvelope(data, 'course enrollment grant')
}

export async function revokeCourseAccessAPI(courseId, enrollmentId) {
  const { data } = await axiosClient.delete(`/api/courses/${courseId}/enrollments/${enrollmentId}/`)
  return assertSuccessEnvelope(data, 'course enrollment revoke')
}

export async function bulkGrantTeachersCourseAccessAPI(courseId) {
  const { data } = await axiosClient.post(`/api/courses/${courseId}/enrollments/bulk-grant-teachers/`, {})
  return assertSuccessEnvelope(data, 'course enrollment bulk grant teachers')
}
