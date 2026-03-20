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
    totalXp: responseData.total_xp ?? null,
    weeklyXp: responseData.weekly_xp ?? null,
    monthlyXp: responseData.monthly_xp ?? null,
    dailyGoal: responseData.daily_goal ?? null,
    todayXp: responseData.today_xp ?? null,
    streak: responseData.streak ?? null,
    lastSevenDays: responseData.last_seven_days ?? [],
  }
}

export async function getDueCardsAPI() {
  const today = new Date().toISOString().split('T')[0]
  const { data } = await axiosClient.get('/api/srs/card-srs/', {
    params: { due_date__lte: today },
  })
  return parseListDataEnvelope(data, 'due cards list')
}
