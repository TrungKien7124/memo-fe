import axiosClient from '../../services/axiosClient'
import { assertSuccessEnvelope, parseListPayload } from '../../utils/apiEnvelope'

function mapCourseDto(coursePayload) {
  return {
    id: coursePayload.id,
    title: coursePayload.title,
    description: coursePayload.description,
    thumbnailUrl: coursePayload.thumbnail_url,
    status: coursePayload.status,
    createdBy: coursePayload.created_by,
    createdAt: coursePayload.created_at,
    updatedAt: coursePayload.updated_at,
    lessonCount: coursePayload.lesson_count ?? 0,
    isEnrolled: Boolean(coursePayload.is_enrolled),
    enrolledAt: coursePayload.enrolled_at || null,
  }
}

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
  const courseRecords = parseListPayload(data, 'courses list')
  return courseRecords.map(mapCourseDto)
}

export async function getCourseDetailAPI(id) {
  const { data } = await axiosClient.get(`/api/courses/${id}/`)
  return mapCourseDto(assertSuccessEnvelope(data, 'course detail'))
}

export async function enrollCourseAPI(courseId) {
  const { data } = await axiosClient.post(`/api/courses/${courseId}/enroll/`, {})
  return assertSuccessEnvelope(data, 'course enroll')
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

export async function getLessonPlaybackAPI(lessonId) {
  const { data } = await axiosClient.get(`/api/lessons/${lessonId}/video/playback/`, {
    withCredentials: true,
  })
  return assertSuccessEnvelope(data, 'lesson playback')
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
