import axiosClient from '../../services/axiosClient'
import { assertSuccessEnvelope, parseListPayload } from '../../utils/apiEnvelope'

function buildLessonFormData(payload) {
  const formData = new FormData()
  Object.entries(payload || {}).forEach(([key, value]) => {
    if (value === undefined || value === null) return
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

export async function createAdminLessonAPI(payload) {
  const hasVideoFile = Boolean(payload?.video_file)
  const body = hasVideoFile ? buildLessonFormData(payload) : payload
  const { data } = await axiosClient.post('/api/lessons/', body, {
    headers: hasVideoFile ? { 'Content-Type': 'multipart/form-data' } : undefined,
  })
  return assertSuccessEnvelope(data, 'admin lesson create')
}

export async function updateAdminLessonAPI(lessonId, payload) {
  const hasVideoFile = Boolean(payload?.video_file)
  const body = hasVideoFile ? buildLessonFormData(payload) : payload
  const { data } = await axiosClient.patch(`/api/lessons/${lessonId}/`, body, {
    headers: hasVideoFile ? { 'Content-Type': 'multipart/form-data' } : undefined,
  })
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
