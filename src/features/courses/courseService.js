import axiosClient from '../../services/axiosClient'
import { assertSuccessEnvelope, parseListPayload } from '../../utils/apiEnvelope'

function parseLessonProgressResponse(payload, endpoint) {
  const progressData = assertSuccessEnvelope(payload, endpoint)
  const quizRuntime = progressData.quiz_runtime && typeof progressData.quiz_runtime === 'object'
    ? progressData.quiz_runtime
    : null

  return {
    progress: progressData,
    quizRuntime,
  }
}

export async function getCoursesAPI() {
  const { data } = await axiosClient.get('/api/courses/')
  return parseListPayload(data, 'courses list')
}

export async function getCourseDetailAPI(id) {
  const { data } = await axiosClient.get(`/api/courses/${id}/`)
  return assertSuccessEnvelope(data, 'course detail')
}

export async function getModulesAPI(courseId) {
  const { data } = await axiosClient.get('/api/modules/', {
    params: { course: courseId },
  })
  return parseListPayload(data, 'modules list')
}

export async function getLessonsAPI(moduleId) {
  const { data } = await axiosClient.get('/api/lessons/', {
    params: { module: moduleId },
  })
  return parseListPayload(data, 'lessons list')
}

export async function getLessonDetailAPI(id) {
  const { data } = await axiosClient.get(`/api/lessons/${id}/`)
  return assertSuccessEnvelope(data, 'lesson detail')
}

export async function markLessonProgressAPI(lessonId, payload) {
  const { data } = await axiosClient.post('/api/lesson-progress/', {
    lesson: lessonId,
    ...payload,
  })
  return parseLessonProgressResponse(data, 'lesson progress')
}

export async function submitQuizAnswerAPI(lessonId, payload) {
  const { data } = await axiosClient.post('/api/lesson-progress/', {
    lesson: lessonId,
    ...payload,
  })
  return parseLessonProgressResponse(data, 'quiz submission')
}
