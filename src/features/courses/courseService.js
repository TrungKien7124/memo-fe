import axiosClient from '../../services/axiosClient'

export async function getCoursesAPI() {
  const { data } = await axiosClient.get('/api/cms/courses/')
  return data
}

export async function getCourseDetailAPI(id) {
  const { data } = await axiosClient.get(`/api/cms/courses/${id}/`)
  return data
}

export async function getModulesAPI(courseId) {
  const { data } = await axiosClient.get('/api/cms/modules/', {
    params: { course: courseId },
  })
  return data
}

export async function getLessonsAPI(moduleId) {
  const { data } = await axiosClient.get('/api/cms/lessons/', {
    params: { module: moduleId },
  })
  return data
}

export async function getLessonDetailAPI(id) {
  const { data } = await axiosClient.get(`/api/cms/lessons/${id}/`)
  return data
}

export async function markLessonProgressAPI(lessonId, payload) {
  const { data } = await axiosClient.post('/api/lms/lesson-progress/', {
    lesson: lessonId,
    ...payload,
  })
  return data
}
