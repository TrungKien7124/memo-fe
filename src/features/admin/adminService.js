import axiosClient from '../../services/axiosClient'

export async function getAdminCoursesAPI() {
  const { data } = await axiosClient.get('/api/cms/courses/')
  return data
}

export async function createAdminCourseAPI(payload) {
  const { data } = await axiosClient.post('/api/cms/courses/', payload)
  return data
}

export async function getAdminCourseByIdAPI(courseId) {
  const { data } = await axiosClient.get(`/api/cms/courses/${courseId}/`)
  return data
}

export async function updateAdminCourseAPI(courseId, payload) {
  const { data } = await axiosClient.patch(`/api/cms/courses/${courseId}/`, payload)
  return data
}

export async function getAdminModulesAPI(courseId) {
  const { data } = await axiosClient.get('/api/cms/modules/', {
    params: courseId ? { course: courseId } : {},
  })
  return data
}

export async function createAdminModuleAPI(payload) {
  const { data } = await axiosClient.post('/api/cms/modules/', payload)
  return data
}

export async function getAdminModuleByIdAPI(moduleId) {
  const { data } = await axiosClient.get(`/api/cms/modules/${moduleId}/`)
  return data
}

export async function updateAdminModuleAPI(moduleId, payload) {
  const { data } = await axiosClient.patch(`/api/cms/modules/${moduleId}/`, payload)
  return data
}

export async function getAdminLessonsAPI(moduleId) {
  const { data } = await axiosClient.get('/api/cms/lessons/', {
    params: moduleId ? { module: moduleId } : {},
  })
  return data
}

export async function createAdminLessonAPI(payload) {
  const { data } = await axiosClient.post('/api/cms/lessons/', payload)
  return data
}

export async function updateAdminLessonAPI(lessonId, payload) {
  const { data } = await axiosClient.patch(`/api/cms/lessons/${lessonId}/`, payload)
  return data
}
