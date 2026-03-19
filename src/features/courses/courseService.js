import axiosClient from '../../services/axiosClient'

function parseDetailDataEnvelope(payload, endpoint) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload))
    throw new Error(`Invalid ${endpoint} response payload`)
  if (!payload.data || typeof payload.data !== 'object' || Array.isArray(payload.data))
    throw new Error(`Missing data object in ${endpoint} response`)
  return payload.data
}

function parseListDataEnvelope(payload, endpoint) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload))
    throw new Error(`Invalid ${endpoint} response payload`)
  if (!Array.isArray(payload.data))
    throw new Error(`Missing data list in ${endpoint} response`)
  return payload.data
}

function parseLessonProgressResponse(payload, endpoint) {
  const progressData = parseDetailDataEnvelope(payload, endpoint)
  const quizRuntime = progressData.quiz_runtime && typeof progressData.quiz_runtime === 'object'
    ? progressData.quiz_runtime
    : null

  return {
    progress: progressData,
    quizRuntime,
  }
}

export async function getCoursesAPI() {
  const { data } = await axiosClient.get('/api/cms/courses/')
  return parseListDataEnvelope(data, 'courses list')
}

export async function getCourseDetailAPI(id) {
  const { data } = await axiosClient.get(`/api/cms/courses/${id}/`)
  return parseDetailDataEnvelope(data, 'course detail')
}

export async function getModulesAPI(courseId) {
  const { data } = await axiosClient.get('/api/cms/modules/', {
    params: { course: courseId },
  })
  return parseListDataEnvelope(data, 'modules list')
}

export async function getLessonsAPI(moduleId) {
  const { data } = await axiosClient.get('/api/cms/lessons/', {
    params: { module: moduleId },
  })
  return parseListDataEnvelope(data, 'lessons list')
}

export async function getLessonDetailAPI(id) {
  const { data } = await axiosClient.get(`/api/cms/lessons/${id}/`)
  return parseDetailDataEnvelope(data, 'lesson detail')
}

export async function markLessonProgressAPI(lessonId, payload) {
  const { data } = await axiosClient.post('/api/lms/lesson-progress/', {
    lesson: lessonId,
    ...payload,
  })
  return parseLessonProgressResponse(data, 'lesson progress')
}

export async function submitQuizAnswerAPI(lessonId, payload) {
  const { data } = await axiosClient.post('/api/lms/lesson-progress/', {
    lesson: lessonId,
    ...payload,
  })
  return parseLessonProgressResponse(data, 'quiz submission')
}
