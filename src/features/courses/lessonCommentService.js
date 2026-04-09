import axiosClient from '../../services/axiosClient'
import { assertSuccessEnvelope, parseListPayload } from '../../utils/apiEnvelope'

function mapCommentDto(payload) {
  return {
    id: payload.id,
    lessonId: payload.lesson,
    parentId: payload.parent || null,
    content: payload.content || '',
    isDeleted: Boolean(payload.is_deleted),
    editedAt: payload.edited_at || null,
    createdAt: payload.created_at,
    updatedAt: payload.updated_at,
    userId: payload.user_id,
    userEmail: payload.user_email,
    userUsername: payload.user_username,
    userRole: payload.user_role,
    canEdit: Boolean(payload.can_edit),
    canDelete: Boolean(payload.can_delete),
  }
}

export async function getLessonCommentsAPI(lessonId) {
  const { data } = await axiosClient.get('/api/lesson-comments/', {
    params: { lesson: lessonId },
  })
  const records = parseListPayload(data, 'lesson comments list')
  return records.map(mapCommentDto)
}

export async function createLessonCommentAPI(payload) {
  const { data } = await axiosClient.post('/api/lesson-comments/', payload)
  return mapCommentDto(assertSuccessEnvelope(data, 'lesson comment create'))
}

export async function updateLessonCommentAPI(commentId, payload) {
  const { data } = await axiosClient.patch(`/api/lesson-comments/${commentId}/`, payload)
  return mapCommentDto(assertSuccessEnvelope(data, 'lesson comment update'))
}

export async function deleteLessonCommentAPI(commentId) {
  const { data } = await axiosClient.delete(`/api/lesson-comments/${commentId}/`)
  return assertSuccessEnvelope(data, 'lesson comment delete')
}
