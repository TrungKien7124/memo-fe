import axiosClient from '../../services/axiosClient'

function parseLessonChatEnvelope(payload, endpointLabel) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload))
    throw new Error(`Invalid ${endpointLabel} response payload`)
  if (!payload.data || typeof payload.data !== 'object' || Array.isArray(payload.data))
    throw new Error(`Missing data object in ${endpointLabel} response`)
  return payload.data
}

/**
 * Normalized lesson-chat DTO (camelCase). Page code must not read raw transport keys.
 *
 * @typedef {Object} LessonChatAiMessageDTO
 * @property {string} id
 * @property {string} role
 * @property {string} content
 * @property {string} createdAt
 *
 * @typedef {Object} LessonChatResultDTO
 * @property {string} conversationId
 * @property {string} lessonId
 * @property {'ready'|'index_pending'|'index_failed'|'unsupported_lesson'} lessonContextStatus
 * @property {LessonChatAiMessageDTO|null} aiMessage
 */

/**
 * @param {unknown} rawData
 * @returns {LessonChatResultDTO}
 */
export function normalizeLessonChatResponseData(rawData) {
  if (!rawData || typeof rawData !== 'object' || Array.isArray(rawData))
    throw new Error('Invalid lesson chat data shape')

  const lessonContextStatus = rawData.lesson_context_status
  if (typeof lessonContextStatus !== 'string' || !lessonContextStatus.length)
    throw new Error('Missing lesson_context_status in lesson chat response')

  const conversationId = rawData.conversation_id
  const lessonId = rawData.lesson_id
  if (typeof conversationId !== 'string' || !conversationId.length)
    throw new Error('Missing conversation_id in lesson chat response')
  if (typeof lessonId !== 'string' || !lessonId.length)
    throw new Error('Missing lesson_id in lesson chat response')

  const rawAi = rawData.ai_message
  let aiMessage = null
  if (rawAi != null) {
    if (typeof rawAi !== 'object' || Array.isArray(rawAi))
      throw new Error('Invalid ai_message in lesson chat response')
    aiMessage = {
      id: String(rawAi.id),
      role: String(rawAi.role),
      content: String(rawAi.content),
      createdAt: String(rawAi.created_at ?? ''),
    }
  }

  return {
    conversationId,
    lessonId,
    lessonContextStatus,
    aiMessage,
  }
}

/**
 * POST /api/acs/chat/ in lesson-aware mode.
 *
 * @param {string} lessonId
 * @param {string} messageText
 * @param {string} [conversationId]
 * @returns {Promise<LessonChatResultDTO>}
 */
export async function postLessonChatAPI(lessonId, messageText, conversationId) {
  const body = {
    lesson_id: lessonId,
    message: messageText,
  }
  if (conversationId)
    body.conversation_id = conversationId

  const { data } = await axiosClient.post('/api/acs/chat/', body)
  const envelopeData = parseLessonChatEnvelope(data, 'lesson chat')
  return normalizeLessonChatResponseData(envelopeData)
}
