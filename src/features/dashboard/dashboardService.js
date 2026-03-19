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

export async function getXPSummaryAPI() {
  const { data } = await axiosClient.get('/api/gms/xp/')
  const responseData = parseDetailDataEnvelope(data, 'xp summary')
  return {
    total_xp: responseData.total_xp ?? 0,
    weekly_xp: responseData.weekly_xp ?? 0,
    monthly_xp: responseData.monthly_xp ?? 0,
    today_xp: responseData.weekly_xp ?? 0,
    daily_goal: 50,
    streak: 0,
    last_seven_days: [],
  }
}

export async function getDueCardsAPI() {
  const today = new Date().toISOString().split('T')[0]
  const { data } = await axiosClient.get('/api/srs/card-srs/', {
    params: { due_date__lte: today },
  })
  return parseListDataEnvelope(data, 'due cards list')
}
