import axiosClient from '../../services/axiosClient'

/**
 * Fetch all courses.
 * @returns {Promise<{data: Array}>}
 */
export async function getCoursesAPI() {
  const { data } = await axiosClient.get('/api/courses/')
  return data
}

/**
 * Fetch a single course by ID.
 * @param {string|number} id - Course ID
 * @returns {Promise<{data: Object}>}
 */
export async function getCourseDetailAPI(id) {
  const { data } = await axiosClient.get(`/api/courses/${id}/`)
  return data
}

/**
 * Fetch modules for a course.
 * @param {string|number} courseId - Course ID
 * @returns {Promise<{data: Array}>}
 */
export async function getModulesAPI(courseId) {
  const { data } = await axiosClient.get('/api/modules/', {
    params: { course: courseId },
  })
  return data
}

/**
 * Fetch lessons for a module.
 * @param {string|number} moduleId - Module ID
 * @returns {Promise<{data: Array}>}
 */
export async function getLessonsAPI(moduleId) {
  const { data } = await axiosClient.get('/api/lessons/', {
    params: { module: moduleId },
  })
  return data
}

/**
 * Fetch a single lesson by ID.
 * @param {string|number} id - Lesson ID
 * @returns {Promise<{data: Object}>}
 */
export async function getLessonDetailAPI(id) {
  const { data } = await axiosClient.get(`/api/lessons/${id}/`)
  return data
}

/**
 * Mark lesson progress.
 * @param {string|number} lessonId - Lesson ID
 * @param {Object} payload - Progress data (e.g. { completed: true, score: 100 })
 * @returns {Promise<{data: Object}>}
 */
export async function markLessonProgressAPI(lessonId, payload) {
  const { data } = await axiosClient.post('/api/lesson-progress/', {
    lesson: lessonId,
    ...payload,
  })
  return data
}
