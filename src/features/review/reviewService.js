import axiosClient from '../../services/axiosClient'
import { assertSuccessEnvelope, parseListPayload } from '../../utils/apiEnvelope'

const RATING_TO_CHOICE_MAP = {
  easy: 'EASY',
  good: 'GOOD',
  hard: 'HARD',
}

function requireField(value, fieldPath) {
  if (value === undefined || value === null)
    throw new Error(`Invalid payload: missing ${fieldPath}`)
  return value
}

function mapDueCardDTO(cardSrsState) {
  if (!cardSrsState || typeof cardSrsState !== 'object' || Array.isArray(cardSrsState))
    throw new Error('Invalid due card payload item')

  const cardDetail = cardSrsState.card_detail
  if (!cardDetail || typeof cardDetail !== 'object' || Array.isArray(cardDetail))
    throw new Error('Invalid due card payload: missing card_detail')

  return {
    id: requireField(cardDetail.id, 'card_detail.id'),
    cardStateId: requireField(cardSrsState.id, 'id'),
    frontText: requireField(cardDetail.front_text, 'card_detail.front_text'),
    backText: requireField(cardDetail.back_text, 'card_detail.back_text'),
    ipa: requireField(cardDetail.ipa, 'card_detail.ipa'),
    audioUrl: requireField(cardDetail.audio_url, 'card_detail.audio_url'),
    imageUrl: requireField(cardDetail.image_url, 'card_detail.image_url'),
    cardType: requireField(cardDetail.card_type, 'card_detail.card_type'),
    dueDate: requireField(cardSrsState.due_date, 'due_date'),
    stage: requireField(cardSrsState.stage, 'stage'),
    intervalDays: requireField(cardSrsState.interval_days, 'interval_days'),
  }
}

function mapReviewSessionHistoryDTO(session) {
  if (!session || typeof session !== 'object' || Array.isArray(session))
    throw new Error('Invalid review session payload item')

  return {
    id: session.id,
    createdAt: session.created_at,
    startedAt: session.started_at,
    endedAt: session.ended_at,
    cardsReviewed: requireField(session.cards_reviewed, 'cards_reviewed'),
    xpEarned: requireField(session.xp_earned, 'xp_earned'),
  }
}

function mapReviewSessionDetailDTO(session) {
  if (!session || typeof session !== 'object' || Array.isArray(session))
    throw new Error('Invalid review session create payload')

  return {
    id: session.id,
    createdAt: session.created_at ?? null,
    startedAt: session.started_at ?? null,
    endedAt: session.ended_at ?? null,
  }
}

export async function createReviewSessionAPI({ folderId } = {}) {
  const body = folderId ? { folder: folderId } : {}
  const { data } = await axiosClient.post('/api/review-sessions/', body)
  const row = assertSuccessEnvelope(data, 'review session create')
  return mapReviewSessionDetailDTO(row)
}

export async function getDueCardsAPI({ folderId } = {}) {
  const params = {}
  if (folderId) params.folder = folderId

  const { data } = await axiosClient.get('/api/card-repetition-states/', { params })

  const rows = parseListPayload(data, 'due cards list')
  return rows.map(mapDueCardDTO)
}

export async function submitCardReviewAPI({ sessionId, cardId, rating }) {
  const choice = RATING_TO_CHOICE_MAP[rating]
  if (!choice) throw new Error('Unsupported review rating value')

  const { data } = await axiosClient.post('/api/card-review-logs/', {
    session: sessionId,
    card: cardId,
    choice,
  })

  const row = assertSuccessEnvelope(data, 'card review create')
  return {
    id: row.id,
    cardId: row.card,
    sessionId: row.session,
    choice: row.choice,
  }
}

export async function endReviewSessionAPI(id) {
  const { data } = await axiosClient.patch(`/api/review-sessions/${id}/`, {})

  const row = assertSuccessEnvelope(data, 'review session end')
  return mapReviewSessionHistoryDTO(row)
}

export async function getReviewHistoryAPI() {
  const { data } = await axiosClient.get('/api/review-sessions/')
  const rows = parseListPayload(data, 'review history list')
  return rows.map(mapReviewSessionHistoryDTO)
}
