import axiosClient from '../../services/axiosClient'

const RATING_TO_CHOICE_MAP = {
  easy: 'EASY',
  good: 'GOOD',
  hard: 'HARD',
}

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

function toReviewCardDTO(cardState) {
  return {
    id: cardState.card,
    cardStateId: cardState.id,
    frontText: `Card ${String(cardState.card).slice(0, 8)}`,
    backText: 'Review this card and rate your recall.',
    dueDate: cardState.due_date,
    stage: cardState.stage,
    intervalDays: cardState.interval_days,
  }
}

function toReviewSessionHistoryDTO(session) {
  return {
    id: session.id,
    createdAt: session.created_at,
    startedAt: session.started_at,
    endedAt: session.ended_at,
    cardsReviewed: 0,
    xpEarned: 0,
  }
}

export async function createReviewSessionAPI() {
  const { data } = await axiosClient.post('/api/rse/review-sessions/')
  return parseDetailDataEnvelope(data, 'review session create')
}

export async function getDueCardsAPI() {
  const today = new Date().toISOString().split('T')[0]
  const { data } = await axiosClient.get('/api/srs/card-srs/', {
    params: { due_date__lte: today },
  })
  return parseListDataEnvelope(data, 'due cards list').map(toReviewCardDTO)
}

export async function submitCardReviewAPI({ sessionId, cardId, rating }) {
  const choice = RATING_TO_CHOICE_MAP[rating]
  if (!choice) throw new Error('Unsupported review rating value')

  const { data } = await axiosClient.post('/api/rse/card-review-logs/', {
    session: sessionId,
    card: cardId,
    choice,
  })
  return parseDetailDataEnvelope(data, 'card review create')
}

export async function endReviewSessionAPI(id) {
  const { data } = await axiosClient.patch(`/api/rse/review-sessions/${id}/`, {})
  return parseDetailDataEnvelope(data, 'review session end')
}

export async function getReviewHistoryAPI() {
  const { data } = await axiosClient.get('/api/rse/review-sessions/')
  return parseListDataEnvelope(data, 'review history list').map(toReviewSessionHistoryDTO)
}
